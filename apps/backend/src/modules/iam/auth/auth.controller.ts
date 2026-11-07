import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NodeRequest, NodeResponse } from "@nestjs/platform-node";
import type { AuthUser } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
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
  register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) reply: NodeResponse) {
    return this.respondWithTokens(reply, this.authService.register(registerDto));
  }

  //  =========================刷新令牌接口=========================
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() request: NodeRequest & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) reply: NodeResponse,
  ) {
    return this.respondWithTokens(reply, this.authService.refresh(request.cookies?.refresh_token));
  }

  //  =========================登录接口=========================
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) reply: NodeResponse) {
    return this.respondWithTokens(reply, this.authService.login(loginDto));
  }

  // =========================获取权限编码=========================
  @Get("codes")
  getAccessCodes(@CurrentUser() user: AuthUser) {
    return this.authService.getAccessCodes(user);
  }

  @Patch("password")
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) reply: NodeResponse,
  ) {
    await this.authService.changePassword(user, changePasswordDto);
    reply.clearCookie("refresh_token", this.getRefreshCookieOptions());

    return { message: "密码修改成功" };
  }

  //  =========================退出登录接口=========================
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) reply: NodeResponse) {
    await this.authService.logout(user);
    reply.clearCookie("refresh_token", this.getRefreshCookieOptions());

    return { message: "退出登录成功" };
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

  private async respondWithTokens(reply: NodeResponse, tokens: Promise<AuthTokens>) {
    const { accessToken, refreshToken, refreshTokenTtl } = await tokens;

    reply.cookie("refresh_token", refreshToken, {
      ...this.getRefreshCookieOptions(),
      maxAge: refreshTokenTtl * 1000,
    });

    return { accessToken };
  }
}
