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
  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);

    try {
      return await this.dataSource.transaction((manager) =>
        this.createAccount(
          manager,
          { nickname: dto.email.split("@")[0] },
          {
            provider: "password",
            providerSubject: dto.email,
            passwordHash,
          },
        ),
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
      }

      throw error;
    }
  }

  // =========================用户登录=========================
  async login(dto: LoginDto) {
    const identity = await this.findIdentity("password", dto.email);

    // 统一提示，不暴露邮箱是否已注册
    if (!identity?.passwordHash || !(await argon2.verify(identity.passwordHash, dto.password))) {
      throw new HttpException("邮箱或密码错误", HttpStatus.UNAUTHORIZED);
    }

    this.assertActive(identity.user);

    return this.issueTokens(identity.user);
  }

  // =========================GitHub 登录=========================
  async githubLogin(githubUser: any) {
    if (typeof githubUser?.id !== "number") {
      throw new HttpException("获取 GitHub 用户信息失败", HttpStatus.BAD_GATEWAY);
    }

    const providerSubject = String(githubUser.id);
    const identity = await this.findIdentity("github", providerSubject);

    const profile: Partial<Profile> = {
      nickname: githubUser.name ?? githubUser.login,
      avatarUrl: githubUser.avatar_url,
      bio: githubUser.bio,
    };

    if (identity) {
      this.assertActive(identity.user);
      await this.syncProfile(identity.user, profile);
      return this.issueTokens(identity.user);
    }

    try {
      return await this.dataSource.transaction((manager) =>
        this.createAccount(manager, profile, { provider: "github", providerSubject }),
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new HttpException("登录处理失败，请重试", HttpStatus.CONFLICT);
      }

      throw error;
    }
  }

  // =========================刷新令牌=========================
  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
    }

    return this.dataSource.transaction(async (manager) => {
      // 锁住会话行，避免同一令牌被并发刷新
      const session = await manager.findOne(RefreshSession, {
        where: { tokenHash: this.hashToken(refreshToken) },
        lock: { mode: "pessimistic_write" },
      });

      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
      }

      // 单独查询用户，避免关联查询参与加锁
      const user = await manager.findOneByOrFail(User, { id: session.userId });
      this.assertActive(user);

      await manager.delete(RefreshSession, { id: session.id });

      return this.issueTokens(user, manager);
    });
  }

  // =========================退出登录=========================
  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshSessionRepository.delete({ tokenHash: this.hashToken(refreshToken) });
    }
  }

  // =========================签发令牌=========================
  private async issueTokens(user: User, manager: EntityManager = this.dataSource.manager) {
    const refreshToken = randomBytes(32).toString("base64url");
    const accessToken = await this.jwtService.signAsync({ sub: String(user.id) });
    const expiresAt = new Date(
      Date.now() + this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN") * 1000,
    );

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

  // =========================账号创建=========================
  // 账号、资料、身份在同一事务内创建
  private async createAccount(
    manager: EntityManager,
    profile: Partial<Profile>,
    identity: Partial<Identity>,
  ) {
    const user = await manager.save(manager.create(User));

    await manager.save(manager.create(Profile, { ...profile, user }));

    await manager.save(manager.create(Identity, { ...identity, user }));

    return this.issueTokens(user, manager);
  }

  // =========================资料同步=========================
  private async syncProfile(user: User, profile: Partial<Profile>) {
    const existing = await this.dataSource.manager.findOneBy(Profile, { user: { id: user.id } });

    if (existing) {
      await this.dataSource.manager.update(Profile, existing.id, profile);
    }
  }

  private findIdentity(provider: string, providerSubject: string) {
    return this.identityRepository.findOne({
      where: { provider, providerSubject },
      relations: { user: true },
    });
  }

  private isUniqueViolation(error: unknown) {
    return error instanceof QueryFailedError && error.driverError.code === "23505";
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
