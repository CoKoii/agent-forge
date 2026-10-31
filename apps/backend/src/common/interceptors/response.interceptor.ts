import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

// 全局响应拦截器
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // 统一响应格式
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { id } = context.switchToHttp().getRequest<{ id?: string }>();

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          requestId: id ?? null,
        },
      })),
    );
  }
}
