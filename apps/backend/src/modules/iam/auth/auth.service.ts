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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  //  =========================注册接口=========================
  async register(registerDto: RegisterDto) {
    const { username, password, confirmPassword } = registerDto;
    // 核验密码
    if (password !== confirmPassword) {
      throw new BadRequestException("密码和确认密码不一致");
    }
    // 核验用户名
    const existingUser = await this.users.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException("用户名已存在");
    }
    // 密码加密
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    // 创建用户和资料
    await this.users.save(
      this.users.create({ username, passwordHash, profile: { nickname: username } }),
    );
    return "注册成功";
  }
  //  =========================注册接口=========================

  //  =========================登录接口=========================
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.users.findOne({ where: { username } });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const refreshTokenTtl = this.config.getOrThrow<number>("REFRESH_TOKEN_TTL_SECONDS");
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshTokenHash = createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);

    const accessToken = await this.sessions.manager.transaction(async (manager) => {
      await manager.delete(AuthSession, { user: { id: user.id } });

      const session = await manager.save(
        manager.create(AuthSession, {
          user,
          refreshTokenHash,
          expiresAt,
        }),
      );

      return this.jwt.signAsync({ sub: user.id, sid: session.id });
    });

    return { accessToken, refreshToken, refreshTokenTtl };
  }
  //  =========================登录接口=========================
}
