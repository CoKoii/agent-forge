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

  //  =========================刷新令牌接口=========================
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respondWithTokens(reply, this.authService.refresh(request.cookies?.refresh_token));
  }

  //  =========================登录接口=========================
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respondWithTokens(reply, this.authService.login(loginDto));
  }

  //  =========================退出登录接口=========================
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: FastifyRequest & { user: { sub: number; sid: number } },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logout(request.user.sub, request.user.sid);
    reply.clearCookie("refresh_token", this.getRefreshCookieOptions());
  }

  //  =========================共享方法=========================
  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: "lax" as const,
      path: "/",
    };
  }

  private async respondWithTokens(reply: FastifyReply, tokens: Promise<AuthTokens>) {
    const { accessToken, refreshToken, refreshTokenTtl } = await tokens;

    reply.setCookie("refresh_token", refreshToken, {
      ...this.getRefreshCookieOptions(),
      maxAge: refreshTokenTtl,
    });

    return { accessToken };
  }
}
