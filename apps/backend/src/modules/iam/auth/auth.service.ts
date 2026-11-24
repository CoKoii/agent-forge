import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "node:crypto";
import { DataSource, EntityManager, Repository } from "typeorm";
import * as argon2 from "argon2";
import { Identity } from "../identity/entities/identity.entity";
import { Profile } from "../profile/entities/profile.entity";
import { User } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshSession } from "./entities/refresh-session.entity";

@Injectable()
export class AuthService {
  // =========================依赖注入=========================
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
  ) {}

  // =========================用户注册=========================
  async register({ email, password }: RegisterDto) {
    // 统一邮箱格式，避免大小写和首尾空格造成重复账号
    email = email.trim().toLowerCase();

    // 注册前检查已有的密码身份
    if (
      await this.identityRepository.existsBy({
        provider: "password",
        providerSubject: email,
      })
    ) {
      throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
    }

    // 密码哈希
    const passwordHash = await argon2.hash(password);

    // 在同一事务中创建账号、资料和登录身份
    return this.dataSource.transaction(async (manager) => {
      // 创建用户账号
      const user = await manager.save(manager.create(User));

      // 创建用户资料，并用邮箱前缀初始化昵称
      await manager.save(
        manager.create(Profile, {
          nickname: email.split("@")[0],
          user,
        }),
      );

      // 创建密码登录身份并保存密码哈希
      await manager.save(
        manager.create(Identity, {
          provider: "password",
          providerSubject: email,
          passwordHash,
          user,
        }),
      );

      return this.issueTokens(manager, user);
    });
  }

  // =========================用户登录=========================
  async login({ email, password }: LoginDto) {
    // 统一邮箱格式，保持与注册时的查找键一致
    email = email.trim().toLowerCase();

    // 按邮箱查找密码身份，并连带查出所属账号
    const identity = await this.identityRepository.findOne({
      where: {
        provider: "password",
        providerSubject: email,
      },
      relations: { user: true },
    });

    // 统一提示，避免暴露邮箱是否已注册
    if (!identity || !(await argon2.verify(identity.passwordHash, password))) {
      throw new HttpException("邮箱或密码错误", HttpStatus.UNAUTHORIZED);
    }

    // 禁用账号不允许登录
    if (identity.user.status === "disabled") {
      throw new HttpException("账号已被禁用", HttpStatus.FORBIDDEN);
    }

    // 登录成功，为该账号新建一条刷新会话
    return this.dataSource.transaction(async (manager) => {
      return this.issueTokens(manager, identity.user);
    });
  }

  // =========================刷新令牌=========================
  async refresh(refreshToken?: string) {
    // 缺少令牌与令牌无效统一按未授权处理
    if (!refreshToken) {
      throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
    }

    // 对客户端传来的明文令牌做哈希，再按哈希查会话
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

    return this.dataSource.transaction(async (manager) => {
      const sessionRepository = manager.getRepository(RefreshSession);

      // 锁定旧会话，避免同一个令牌被并发刷新两次
      const session = await sessionRepository
        .createQueryBuilder("session")
        .setLock("pessimistic_write")
        .leftJoinAndSelect("session.user", "user")
        .where("session.tokenHash = :tokenHash", { tokenHash })
        .getOne();

      // 令牌不存在或已过期，一律按无效处理
      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
      }

      // 禁用账号不再签发新的令牌
      if (session.user.status === "disabled") {
        throw new HttpException("账号已被禁用", HttpStatus.FORBIDDEN);
      }

      // 物理删除旧会话，完成令牌轮换
      await manager.delete(RefreshSession, { id: session.id });

      // 滑动到期：新会话从现在重新计算有效期
      return this.issueTokens(manager, session.user);
    });
  }

  // =========================签发令牌=========================
  private async issueTokens(manager: EntityManager, user: User) {
    // 生成刷新令牌和过期时间
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshExpiresIn = this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN");

    // 签发访问令牌
    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
    });

    // 数据库只保存刷新令牌的哈希
    await manager.save(
      manager.create(RefreshSession, {
        tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
        user,
        expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
      }),
    );

    return { accessToken, refreshToken };
  }
}
