import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envValidationSchema } from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      // 全局注册
      isGlobal: true,
      // 加载 env 文件
      envFilePath: [`.env.${process.env["NODE_ENV"] ?? "development"}`, ".env"],
      // 校验环境变量
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
