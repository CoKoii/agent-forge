import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envValidationSchema } from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      // 全局注册配置模块，所有模块都可以直接注入 ConfigService
      isGlobal: true,

      // 加载 env 文件，优先加载 .env.NODE_ENV 文件，其次加载 .env 文件
      envFilePath: [`.env.${process.env["NODE_ENV"] ?? "development"}`, ".env"],

      // 启动时对 env 变量进行 Joi 校验，不合法直接报错
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
