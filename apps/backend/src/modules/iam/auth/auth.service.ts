import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import * as argon2 from "argon2";
import { AuthSession } from "./entities/auth-session.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";

// 认证服务
@Injectable()
export class AuthService {
  // 服务依赖配置
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // 获取 Refresh Token 有效期
  private getRefreshTokenTtl() {
    return this.config.getOrThrow<number>("REFRESH_TOKEN_TTL_SECONDS");
  }

  // 生成 Refresh Token
  private createRefreshToken() {
    return randomBytes(32).toString("base64url");
  }

  // 哈希 Refresh Token
  private hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  // 签发访问令牌并返回认证数据
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

  // 创建登录会话并签发认证令牌
  private async createAuthTokens(user: User) {
    const refreshTokenTtl = this.getRefreshTokenTtl();
    const refreshToken = this.createRefreshToken();
    const session = await this.sessions.save(
      this.sessions.create({
        user,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenTtl * 1000),
      }),
    );

    return this.createTokenResponse(user.id, session.id, refreshToken, refreshTokenTtl);
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

    const user = await this.users.save(
      this.users.create({
        username,
        passwordHash,
        profile: { nickname: username },
      }),
    );

    return this.createAuthTokens(user);
  }

  //  =========================登录接口=========================
  async login({ username, password }: LoginDto) {
    const user = await this.users.findOne({ where: { username } });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    await this.sessions.delete({ user: { id: user.id } });
    return this.createAuthTokens(user);
  }

  //  =========================退出登录接口=========================
  async logout(userId: number, sessionId: number) {
    await this.sessions.delete({ id: sessionId, user: { id: userId } });
  }

  //  =========================刷新令牌接口=========================
  async refresh(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException("登录状态已失效，请重新登录");
    }

    const refreshTokenTtl = this.getRefreshTokenTtl();
    const refreshToken = this.createRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(rawRefreshToken);

    const session = await this.sessions.findOne({
      where: { refreshTokenHash },
      relations: { user: true },
    });

    if (!session || session.expiresAt <= new Date() || session.deletedAt) {
      throw new UnauthorizedException("登录状态已失效，请重新登录");
    }

    session.refreshTokenHash = this.hashRefreshToken(refreshToken);
    session.expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);
    await this.sessions.save(session);

    return this.createTokenResponse(session.user.id, session.id, refreshToken, refreshTokenTtl);
  }
}
