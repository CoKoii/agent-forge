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
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.register(dto));
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.login(dto));
  }

  @Post("refresh")
  async refresh(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.respond(reply, await this.authService.refresh(request.cookies["refresh_token"]));
  }

  @Post("logout")
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.authService.logout(request.cookies["refresh_token"]);

    // Path 需与写入时一致，否则清不掉 Cookie
    reply.clearCookie("refresh_token", { path: "/" });
  }

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
