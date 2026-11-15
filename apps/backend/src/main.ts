import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import cookie from "@fastify/cookie";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    // 缓冲启动日志
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  // 注册 cookie 插件
  await app.register(cookie);

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 请求校验
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          Object.values(
            errors.find(({ constraints }) => !constraints?.whitelistValidation)?.constraints ?? {},
          )[0] ?? "请求参数校验失败",
        ),
    }),
  );

  // 日志服务
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 优雅关闭
  app.enableShutdownHooks();

  // CORS
  app.enableCors({
    origin: configService
      .getOrThrow<string>("CORS_ORIGIN")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  });

  // API 前缀
  app.setGlobalPrefix("api");

  // API 版本
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // 服务端口
  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);
}

void bootstrap();
