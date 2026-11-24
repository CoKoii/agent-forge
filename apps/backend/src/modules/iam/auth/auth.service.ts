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

  async register({ email, password }: RegisterDto) {
    const passwordHash = await argon2.hash(password);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const user = await manager.save(manager.create(User));

        await manager.save(
          manager.create(Profile, {
            nickname: email.split("@")[0],
            user,
          }),
        );

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
      // 唯一约束冲突即邮箱重复
      if (error instanceof QueryFailedError && error.driverError.code === "23505") {
        throw new HttpException("该邮箱已注册", HttpStatus.CONFLICT);
      }

      throw error;
    }
  }

  async login({ email, password }: LoginDto) {
    const identity = await this.identityRepository.findOne({
      where: { provider: "password", providerSubject: email },
      relations: { user: true },
    });

    // 统一提示，避免暴露邮箱是否注册
    if (!identity || !(await argon2.verify(identity.passwordHash, password))) {
      throw new HttpException("邮箱或密码错误", HttpStatus.UNAUTHORIZED);
    }

    this.assertActive(identity.user);

    return this.issueTokens(identity.user);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
    }

    return this.dataSource.transaction(async (manager) => {
      // 锁住会话行，避免同一令牌并发刷新
      const session = await manager.findOne(RefreshSession, {
        where: { tokenHash: this.hashToken(refreshToken) },
        lock: { mode: "pessimistic_write" },
      });

      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new HttpException("刷新令牌无效", HttpStatus.UNAUTHORIZED);
      }

      const user = await manager.findOneByOrFail(User, { id: session.userId });
      this.assertActive(user);

      await manager.delete(RefreshSession, { id: session.id });

      return this.issueTokens(user, manager);
    });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshSessionRepository.delete({ tokenHash: this.hashToken(refreshToken) });
    }
  }

  private async issueTokens(user: User, manager: EntityManager = this.dataSource.manager) {
    const refreshToken = randomBytes(32).toString("base64url");
    const accessToken = await this.jwtService.signAsync({ sub: String(user.id) });
    const expiresAt = new Date(
      Date.now() + this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN") * 1000,
    );

    // 清理该用户已过期的会话
    await manager.delete(RefreshSession, { userId: user.id, expiresAt: LessThan(new Date()) });

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
