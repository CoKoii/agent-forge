import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "node:crypto";
import { DataSource, EntityManager, LessThan, QueryFailedError, Repository } from "typeorm";
import * as argon2 from "argon2";
import { Identity } from "../identity/entities/identity.entity";
import { Profile } from "../profile/entities/profile.entity";
import { User } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshSession } from "./entities/refresh-session.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository: Repository<RefreshSession>,
  ) {}

  // =========================用户注册=========================
  async register({ email, password }: RegisterDto) {
    // 密码只保存哈希
    const passwordHash = await argon2.hash(password);

    try {
      // 账号、资料、身份在同一事务内创建
      return await this.dataSource.transaction(async (manager) => {
        // 创建用户账号
        const user = await manager.save(manager.create(User));

        // 创建用户资料，昵称取邮箱前缀
        await manager.save(
          manager.create(Profile, {
            nickname: email.split("@")[0],
            user,
          }),
        );

        // 创建密码登录身份
        await manager.save(
          manager.create(Identity, {
            provider: "password",
            providerSubject: email,
            passwordHash,
            user,
          }),
        );

        return this.issueTokens(user, manager);
      });
    } catch (error) {
      // 唯一约束冲突说明邮箱已注册
      if (error instanceof QueryFailedError && error.driverError.code === "23505") {
        throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
      }

      throw error;
    }
  }

  // =========================用户登录=========================
  async login({ email, password }: LoginDto) {
    // 按邮箱查找密码登录身份
    const identity = await this.identityRepository.findOne({
      where: { provider: "password", providerSubject: email },
      relations: { user: true },
    });

    // 统一提示，不暴露邮箱是否已注册
    if (!identity || !(await argon2.verify(identity.passwordHash, password))) {
      throw new HttpException("邮箱或密码错误", HttpStatus.UNAUTHORIZED);
    }

    // 禁用账号不允许登录
    this.assertActive(identity.user);

    return this.issueTokens(identity.user);
  }

  // =========================刷新令牌=========================
  async refresh(refreshToken?: string) {
    // 缺少令牌与令牌无效统一返回未授权
    if (!refreshToken) {
      throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
    }

    return this.dataSource.transaction(async (manager) => {
      // 锁住会话行，避免同一令牌被并发刷新
      const session = await manager.findOne(RefreshSession, {
        where: { tokenHash: this.hashToken(refreshToken) },
        lock: { mode: "pessimistic_write" },
      });

      // 会话不存在或已过期都按无效处理
      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
      }

      // 单独查询用户，避免关联查询参与加锁
      const user = await manager.findOneByOrFail(User, { id: session.userId });
      this.assertActive(user);

      // 轮换令牌：删除旧会话
      await manager.delete(RefreshSession, { id: session.id });

      return this.issueTokens(user, manager);
    });
  }

  // =========================退出登录=========================
  async logout(refreshToken?: string) {
    // 无令牌时直接返回，Cookie 由控制器清理
    if (refreshToken) {
      await this.refreshSessionRepository.delete({ tokenHash: this.hashToken(refreshToken) });
    }
  }

  // =========================签发令牌=========================
  private async issueTokens(user: User, manager: EntityManager = this.dataSource.manager) {
    // 生成刷新令牌、访问令牌和会话过期时间
    const refreshToken = randomBytes(32).toString("base64url");
    const accessToken = await this.jwtService.signAsync({ sub: String(user.id) });
    const expiresAt = new Date(
      Date.now() + this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN") * 1000,
    );

    // 清理该用户已过期的会话
    await manager.delete(RefreshSession, { userId: user.id, expiresAt: LessThan(new Date()) });

    // 数据库只保存刷新令牌哈希
    await manager.save(
      manager.create(RefreshSession, {
        tokenHash: this.hashToken(refreshToken),
        user,
        expiresAt,
      }),
    );

    return { accessToken, refreshToken };
  }

  private assertActive(user: User) {
    if (user.status === "disabled") {
      throw new HttpException("账号已被禁用", HttpStatus.FORBIDDEN);
    }
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}
