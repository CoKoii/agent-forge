import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  //  =========================注册接口=========================
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  //  =========================注册接口=========================

  //  =========================登录接口=========================
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { refreshToken, refreshTokenTtl, ...response } = await this.authService.login(loginDto);

    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenTtl,
    });

    return response;
  }
  //  =========================登录接口=========================
}
