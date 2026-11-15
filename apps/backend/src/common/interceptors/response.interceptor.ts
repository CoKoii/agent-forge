import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Observable, defer, map } from "rxjs";

// 全局响应拦截器
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // 统一响应格式
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return defer(() => next.handle()).pipe(
      map((result) => ({
        code: 0,
        data: result ?? null,
      })),
    );
  }
}
