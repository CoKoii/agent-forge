import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, type EntityManager, Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import * as argon2 from "argon2";
import { AuthSession } from "./entities/auth-session.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshTokenTtl() {
    return this.config.getOrThrow<number>("REFRESH_TOKEN_TTL_SECONDS");
  }

  private createRefreshToken() {
    return randomBytes(32).toString("base64url");
  }

  private hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private async createTokenResponse(
    userId: number,
    sessionId: number,
    refreshToken: string,
    refreshTokenTtl: number,
  ) {
    return {
      accessToken: await this.jwt.signAsync({ sub: userId, sid: sessionId }),
      refreshToken,
      refreshTokenTtl,
    };
  }

  private async createSessionTokens(manager: EntityManager, user: User) {
    const refreshTokenTtl = this.getRefreshTokenTtl();
    const refreshToken = this.createRefreshToken();
    const session = await manager.save(
      manager.create(AuthSession, {
        user,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenTtl * 1000),
      }),
    );

    return { session, refreshToken, refreshTokenTtl };
  }

  //  =========================注册接口=========================
  async register(registerDto: RegisterDto) {
    const { username, password, confirmPassword } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException("密码和确认密码不一致");
    }

    const existingUser = await this.users.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException("用户名已存在");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    const { user, session, refreshToken, refreshTokenTtl } = await this.users.manager.transaction(
      async (manager) => {
        const user = await manager.save(
          manager.create(User, {
            username,
            passwordHash,
            profile: { nickname: username },
          }),
        );

        return { user, ...(await this.createSessionTokens(manager, user)) };
      },
    );

    return this.createTokenResponse(user.id, session.id, refreshToken, refreshTokenTtl);
  }
  //  =========================注册接口=========================

  //  =========================登录接口=========================
  async login({ username, password }: LoginDto) {
    const user = await this.users.findOne({ where: { username } });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const { session, refreshToken, refreshTokenTtl } = await this.sessions.manager.transaction(
      async (manager) => {
        await manager.delete(AuthSession, { user: { id: user.id } });
        return this.createSessionTokens(manager, user);
      },
    );

    return this.createTokenResponse(user.id, session.id, refreshToken, refreshTokenTtl);
  }
  //  =========================登录接口=========================

  //  =========================刷新令牌接口=========================
  async refresh(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException("Refresh token 无效或已过期");
    }

    const refreshTokenTtl = this.getRefreshTokenTtl();
    const refreshToken = this.createRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(rawRefreshToken);
    const nextRefreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);

    const session = await this.sessions.findOne({
      where: { refreshTokenHash },
      relations: { user: true },
    });

    if (
      !session ||
      (
        await this.sessions.update(
          {
            id: session.id,
            refreshTokenHash,
            expiresAt: MoreThan(new Date()),
            deletedAt: IsNull(),
          },
          {
            refreshTokenHash: nextRefreshTokenHash,
            expiresAt,
          },
        )
      ).affected !== 1
    ) {
      throw new UnauthorizedException("Refresh token 无效或已过期");
    }

    return this.createTokenResponse(session.user.id, session.id, refreshToken, refreshTokenTtl);
  }
  //  =========================刷新令牌接口=========================
}
