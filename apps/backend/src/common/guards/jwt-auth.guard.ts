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

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) throw new UnauthorizedException("缺少访问令牌");

    let payload: { sub?: number; sid?: number };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("访问令牌无效或已过期");
    }

    if (!Number.isInteger(payload.sub) || !Number.isInteger(payload.sid)) {
      throw new UnauthorizedException("访问令牌无效");
    }

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
    request.user = payload;
    return true;
  }
}
