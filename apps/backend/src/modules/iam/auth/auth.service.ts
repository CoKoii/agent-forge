import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

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
    // 创建用户和资料
    await this.users.save(
      this.users.create({ username, password, profile: { nickname: username } }),
    );
    return "注册成功";
  }
  //  =========================注册接口=========================

  //  =========================登录接口=========================
  login(loginDto: LoginDto) {
    return { username: loginDto.username };
  }
  //  =========================登录接口=========================
}
