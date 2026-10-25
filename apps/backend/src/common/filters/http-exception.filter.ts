import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const context = host.switchToHttp();
    const { method, url, id } = context.getRequest<{
      method?: string;
      url?: string;
      id?: string;
    }>();
    const path = (url ?? "/").split("?", 1)[0] || "/";
    const response = context.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} ${method ?? "UNKNOWN"} ${path} requestId=${id ?? "unknown"}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    if (httpAdapter.isHeadersSent(response)) return;

    const detail =
      status >= 500
        ? "服务器内部错误"
        : exception instanceof HttpException
          ? exception.message
          : "请求失败";

    httpAdapter.reply(
      response,
      {
        status,
        detail,
        instance: path,
        requestId: id ?? null,
      },
      status,
    );
  }
}
