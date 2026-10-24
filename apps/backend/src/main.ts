import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ObserveInstrument } from "./infrastructure/observe/observe.module";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, VersioningType } from "@nestjs/common";
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    // Observe 追踪配置(https://www.observe.nestjs.com)
    instrument: ObserveInstrument,
    // 启动日志缓冲配置
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  // 全局验证管道配置
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 日志配置
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 关闭钩子配置
  app.enableShutdownHooks();

  // CORS 配置
  const corsOrigin = configService.getOrThrow<string>("CORS_ORIGIN");
  app.enableCors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((o) => o.trim()),
  });

  // 全局路由前缀配置
  app.setGlobalPrefix("api");

  // 版本控制配置
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // 端口配置
  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);
}
void bootstrap();
