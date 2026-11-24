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

  @Post("register")
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(registerDto);

    this.setRefreshTokenCookie(reply, refreshToken);

    return { accessToken };
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    this.setRefreshTokenCookie(reply, refreshToken);

    return { accessToken };
  }

  @Post("refresh")
  async refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    // 令牌缺失由服务层统一校验
    const { accessToken, refreshToken } = await this.authService.refresh(
      request.cookies["refresh_token"],
    );

    this.setRefreshTokenCookie(reply, refreshToken);

    return { accessToken };
  }

  // =========================刷新令牌 Cookie=========================
  private setRefreshTokenCookie(reply: FastifyReply, refreshToken: string) {
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN"),
    });
  }
}
