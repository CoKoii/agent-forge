import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ObserveInstrument } from "./infrastructure/observe/observe.module";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { NodeAdapter, type NestNodeApplication } from "@nestjs/platform-node";
import cookieParser from "cookie-parser";
import { requestIdMiddleware } from "./common/middleware/request-id.middleware";

async function bootstrap() {
  const app = await NestFactory.create<NestNodeApplication>(AppModule, new NodeAdapter(), {
    // Observe 追踪配置(https://www.observe.nestjs.com)
    instrument: ObserveInstrument,
    // 启动日志缓冲配置
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  // 生成请求 ID，供响应和异常日志关联
  app.use(requestIdMiddleware);

  // 全局异常过滤器配置
  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));

  // 全局响应拦截器配置
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局验证管道配置
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const constraints = errors.find(
          ({ constraints }) => !constraints?.whitelistValidation,
        )?.constraints;
        return new BadRequestException(Object.values(constraints ?? {})[0] ?? "请求参数校验失败");
      },
    }),
  );

  // 日志配置
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 关闭钩子配置
  app.enableShutdownHooks();

  // CORS 配置
  app.enableCors({
    origin: configService
      .getOrThrow<string>("CORS_ORIGIN")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  });

  // 全局路由前缀配置
  app.setGlobalPrefix("api");

  // 版本控制配置
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // cookie 配置
  app.use(cookieParser());

  // 端口配置
  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);
}
void bootstrap();
