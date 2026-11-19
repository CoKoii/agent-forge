import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "node:crypto";
import { DataSource, Repository } from "typeorm";
import * as argon2 from "argon2";
import { Identity } from "../identity/entities/identity.entity";
import { Profile } from "../profile/entities/profile.entity";
import { User } from "../user/entities/user.entity";
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

    // 生成刷新令牌和过期时间
    const refreshToken = randomBytes(32).toString("base64url");
    const refreshExpiresIn = this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN");

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

      const accessToken = await this.jwtService.signAsync({
        sub: String(user.id),
      });

      await manager.save(
        manager.create(RefreshSession, {
          tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
          user,
          expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
        }),
      );
      return { accessToken, refreshToken };
    });
  }
}
