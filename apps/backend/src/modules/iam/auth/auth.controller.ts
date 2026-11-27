import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GithubService } from "./oauth/github.service";
import { GoogleService } from "./oauth/google.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly githubService: GithubService,
    private readonly googleService: GoogleService,
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
    this.startAuth(reply, "github_state", (state) => this.githubService.authorizeUrl(state));
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

  // =========================Google 登录=========================
  @Get("google")
  google(@Res() reply: FastifyReply) {
    this.startAuth(reply, "google_state", (state) => this.googleService.authorizeUrl(state));
  }

  // =========================Google 回调=========================
  @Get("google/callback")
  async googleCallback(
    @Query() query: { code?: string; state?: string; error?: string },
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    reply.clearCookie("google_state", { path: "/api/v1/auth" });

    const user = await this.googleService.authorize(query, request.cookies["google_state"]);

    return this.respond(reply, await this.authService.googleLogin(user));
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
      secure: this.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: this.configService.getOrThrow<number>("JWT_REFRESH_EXPIRES_IN"),
    });

    return { accessToken };
  }

  // =========================第三方登录入口=========================
  private startAuth(
    reply: FastifyReply,
    cookieName: string,
    authorizeUrl: (state: string) => string,
  ) {
    const state = randomBytes(16).toString("base64url");

    reply.setCookie(cookieName, state, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 600,
    });

    reply.status(HttpStatus.FOUND).header("Location", authorizeUrl(state)).send();
  }

  private get isProduction() {
    return this.configService.get("NODE_ENV") === "production";
  }
}
