import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "../../../common/decorators/public.decorator";

type AuthTokens = Awaited<ReturnType<AuthService["login"]>>;

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  //  =========================注册接口=========================
  @Public()
  @Post("register")
  register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respondWithTokens(reply, this.authService.register(registerDto));
  }
  //  =========================注册接口=========================

  //  =========================刷新令牌接口=========================
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respondWithTokens(reply, this.authService.refresh(request.cookies?.refresh_token));
  }
  //  =========================刷新令牌接口=========================

  //  =========================登录接口=========================
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respondWithTokens(reply, this.authService.login(loginDto));
  }
  //  =========================登录接口=========================

  //  =========================共享方法=========================
  private async respondWithTokens(reply: FastifyReply, tokens: Promise<AuthTokens>) {
    const { accessToken, refreshToken, refreshTokenTtl } = await tokens;

    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshTokenTtl,
    });

    return { accessToken };
  }
  //  =========================共享方法=========================
}
