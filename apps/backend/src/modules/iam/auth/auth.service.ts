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

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

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
      this.users.create({ username, password: passwordHash, profile: { nickname: username } }),
    );
    return "注册成功";
  }
  //  =========================注册接口=========================

  //  =========================登录接口=========================
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.users.findOne({ where: { username } });
    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException("用户名或密码错误");
    }
    return { username: user.username };
  }
  //  =========================登录接口=========================
}
