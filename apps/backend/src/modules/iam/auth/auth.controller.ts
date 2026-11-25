import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // =========================用户注册=========================
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    // 创建账号并签发令牌
    return this.respond(reply, await this.authService.register(dto));
  }

  // =========================用户登录=========================
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    // 校验密码并签发令牌
    return this.respond(reply, await this.authService.login(dto));
  }

  // =========================刷新令牌=========================
  @Post("refresh")
  async refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    // 轮换刷新令牌后签发新令牌
    return this.respond(reply, await this.authService.refresh(request.cookies["refresh_token"]));
  }

  // =========================退出登录=========================
  @Post("logout")
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    // 删除该刷新令牌对应的会话
    await this.authService.logout(request.cookies["refresh_token"]);

    // Path 需与写入时一致，否则清不掉 Cookie
    reply.clearCookie("refresh_token", { path: "/" });
  }

  // =========================刷新令牌 Cookie=========================
  // 写入 HttpOnly Cookie，只把访问令牌返回给前端
  private respond(
    reply: FastifyReply,
    { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
  ) {
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/",
      maxAge: this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN"),
    });

    return { accessToken };
  }
}
