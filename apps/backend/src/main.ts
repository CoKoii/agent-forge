import { NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ObserveInstrument } from "./infrastructure/observe/observe.module";
import { ConfigService } from "@nestjs/config";
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Observe 追踪配置(https://www.observe.nestjs.com)
    instrument: ObserveInstrument,
    // 启动日志缓冲配置
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  // 日志配置
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 关闭钩子配置
  app.enableShutdownHooks();

  // CORS 配置
  const corsOrigin = configService.getOrThrow<string>("CORS_ORIGIN");
  app.enableCors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((o) => o.trim()),
  });

  // 端口配置
  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);
}
void bootstrap();
