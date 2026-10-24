import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor() {}
  //  =========================登录接口=========================
  login(loginDto: LoginDto) {
    return loginDto;
  }
  //  =========================登录接口=========================

  //  =========================注册接口=========================
  register(registerDto: RegisterDto) {
    const { username, password, confirmPassword } = registerDto;
    if (password !== confirmPassword) {
      throw new BadRequestException("两次输入的密码不一致");
    }
    return registerDto;
  }
  //  =========================注册接口=========================
  // create(createAuthDto: CreateAuthDto) {
  //   return "This action adds a new auth";
  // }
  // findAll() {
  //   return `This action returns all auth`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }
  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
