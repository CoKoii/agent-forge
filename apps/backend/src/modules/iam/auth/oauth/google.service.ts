import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { fetchWithTimeout } from "./fetch-with-timeout";

@Injectable()
export class GoogleService {
  // =========================依赖注入=========================
  constructor(private readonly configService: ConfigService) {}

  // =========================授权地址=========================
  authorizeUrl(state: string) {
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.configService.getOrThrow("GOOGLE_CLIENT_ID"),
      redirect_uri: this.configService.getOrThrow("GOOGLE_CALLBACK_URL"),
      response_type: "code",
      scope: "openid email profile",
      state,
    })}`;
  }

  // =========================授权回调=========================
  async authorize(
    { code, state, error }: { code?: string; state?: string; error?: string },
    cookieState?: string,
  ) {
    if (error || !code || !state || cookieState !== state) {
      throw new HttpException("Google 授权失败", HttpStatus.UNAUTHORIZED);
    }

    return this.getUser(await this.exchangeCode(code));
  }

  // =========================换取访问令牌=========================
  private async exchangeCode(code: string) {
    const response = await this.request("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.configService.getOrThrow("GOOGLE_CLIENT_ID"),
        client_secret: this.configService.getOrThrow("GOOGLE_CLIENT_SECRET"),
        redirect_uri: this.configService.getOrThrow("GOOGLE_CALLBACK_URL"),
      }).toString(),
    });

    const data = response.ok ? ((await response.json()) as { access_token?: string }) : {};

    if (!data.access_token) {
      throw new HttpException("Google 授权失败", HttpStatus.UNAUTHORIZED);
    }

    return data.access_token;
  }

  // =========================获取用户信息=========================
  private async getUser(accessToken: string) {
    const response = await this.request("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new HttpException("获取 Google 用户信息失败", HttpStatus.BAD_GATEWAY);
    }

    return response.json();
  }

  // =========================请求封装=========================
  private request(url: string, init: RequestInit) {
    return fetchWithTimeout(url, init, "Google 服务不可用");
  }
}
