import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Observable, defer, map } from "rxjs";
import { requestContext } from "../context/request-context";

// 全局响应拦截器
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // 统一响应格式
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { id, user } = context
      .switchToHttp()
      .getRequest<{ id?: string; user?: { sub: number } }>();

    return defer(() => requestContext.run({ userId: user?.sub ?? null }, () => next.handle())).pipe(
      map((data) => ({
        data,
        meta: {
          requestId: id ?? null,
        },
      })),
    );
  }
}
