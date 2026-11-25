import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GithubService {
  // =========================依赖注入=========================
  constructor(private readonly configService: ConfigService) {}

  // =========================授权地址=========================
  authorizeUrl(state: string) {
    return `https://github.com/login/oauth/authorize?${new URLSearchParams({
      client_id: this.configService.getOrThrow("GITHUB_CLIENT_ID"),
      redirect_uri: this.configService.getOrThrow("GITHUB_CALLBACK_URL"),
      scope: "read:user",
      state,
    })}`;
  }

  // =========================授权回调=========================
  async authorize(
    { code, state, error }: { code?: string; state?: string; error?: string },
    cookieState?: string,
  ) {
    if (error || !code || !state || cookieState !== state) {
      throw new HttpException("GitHub 授权失败", HttpStatus.UNAUTHORIZED);
    }

    return this.getUser(await this.exchangeCode(code));
  }

  // =========================换取访问令牌=========================
  private async exchangeCode(code: string) {
    const response = await this.request("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: this.configService.getOrThrow("GITHUB_CLIENT_ID"),
        client_secret: this.configService.getOrThrow("GITHUB_CLIENT_SECRET"),
        code,
        redirect_uri: this.configService.getOrThrow("GITHUB_CALLBACK_URL"),
      }),
    });

    const data = response.ok ? ((await response.json()) as { access_token?: string }) : {};

    if (!data.access_token) {
      throw new HttpException("GitHub 授权失败", HttpStatus.UNAUTHORIZED);
    }

    return data.access_token;
  }

  // =========================获取用户信息=========================
  private async getUser(accessToken: string) {
    const response = await this.request("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "agent-forge" },
    });

    if (!response.ok) {
      throw new HttpException("获取 GitHub 用户信息失败", HttpStatus.BAD_GATEWAY);
    }

    return response.json();
  }

  // =========================请求封装=========================
  private async request(url: string, init: RequestInit) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(5000) });
    } catch {
      throw new HttpException("GitHub 服务不可用", HttpStatus.BAD_GATEWAY);
    }
  }
}
