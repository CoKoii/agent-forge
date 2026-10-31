import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, Repository } from "typeorm";
import { AuthSession } from "../../modules/iam/auth/entities/auth-session.entity";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

// 全局 JWT 守卫
@Injectable()
export class JwtAuthGuard implements CanActivate {
  // 守卫依赖配置
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {}

  // 统一访问令牌校验
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 公开接口直接放行
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];

    // 验证 Bearer 请求头
    if (scheme !== "Bearer" || !token) throw new UnauthorizedException("缺少访问令牌");

    // 验证 JWT 签名和有效期
    let payload: { sub?: number; sid?: number };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("访问令牌无效或已过期");
    }

    // 验证 JWT 载荷
    if (!Number.isInteger(payload.sub) || !Number.isInteger(payload.sid)) {
      throw new UnauthorizedException("访问令牌无效");
    }

    // 验证对应的活跃会话
    let session: AuthSession | null;
    try {
      session = await this.sessions.findOne({
        where: {
          id: payload.sid!,
          user: { id: payload.sub! },
          expiresAt: MoreThan(new Date()),
          deletedAt: IsNull(),
        },
      });
    } catch {
      throw new ServiceUnavailableException("会话验证暂时不可用");
    }

    if (!session) throw new UnauthorizedException("访问令牌无效或已过期");

    // 将已验证的用户信息交给后续处理
    request.user = payload;
    return true;
  }
}
