import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

// 全局异常过滤器
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // 异常日志配置
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // HTTP 适配器配置
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  // 统一异常处理
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const { method, url, id } = request;
    const path = (url ?? "/").split("?", 1)[0] || "/";
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    // 记录服务器异常
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} ${method ?? "UNKNOWN"} ${path} requestId=${id ?? "unknown"}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // 响应头已发送时不再重复响应
    if (httpAdapter.isHeadersSent(response)) return;

    // 区分客户端错误和服务器内部错误
    const message =
      exception instanceof HttpException && status < 500 ? exception.message : "服务器内部错误";

    // 返回统一错误响应
    httpAdapter.reply(
      response,
      {
        message,
        requestId: id ?? null,
      },
      status,
    );
  }
}
