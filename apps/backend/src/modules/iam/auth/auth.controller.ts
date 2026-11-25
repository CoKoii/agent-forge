import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GithubService } from "./github.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
  ) {}

  // =========================用户注册=========================
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.register(dto));
  }

  // =========================用户登录=========================
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.login(dto));
  }

  // =========================GitHub 登录=========================
  @Get("github")
  github(@Res() reply: FastifyReply) {
    const state = randomBytes(16).toString("base64url");
    reply.setCookie("github_state", state, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 600,
    });

    reply
      .status(HttpStatus.FOUND)
      .header("Location", this.githubService.authorizeUrl(state))
      .send();
  }

  // =========================GitHub 回调=========================
  @Get("github/callback")
  async githubCallback(
    @Query() query: { code?: string; state?: string; error?: string },
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    reply.clearCookie("github_state", { path: "/api/v1/auth" });

    const user = await this.githubService.authorize(query, request.cookies["github_state"]);

    return this.respond(reply, await this.authService.githubLogin(user));
  }

  // =========================刷新令牌=========================
  @Post("refresh")
  async refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.refresh(request.cookies["refresh_token"]));
  }

  // =========================退出登录=========================
  @Post("logout")
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.authService.logout(request.cookies["refresh_token"]);

    // Path 需与写入时一致，否则清不掉 Cookie
    reply.clearCookie("refresh_token", { path: "/" });
  }

  // =========================刷新令牌 Cookie=========================
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
