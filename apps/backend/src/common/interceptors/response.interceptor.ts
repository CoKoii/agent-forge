import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Observable, defer, map } from "rxjs";
import { requestContext } from "../context/request-context";
import type { AuthUser } from "../guards/jwt-auth.guard";

// 全局响应拦截器
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // 统一响应格式
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();

    return defer(() =>
      requestContext.run({ userId: user?.userId ?? null }, () => next.handle()),
    ).pipe(
      map((result) => ({
        code: 0,
        data: result ?? null,
      })),
    );
  }
}
