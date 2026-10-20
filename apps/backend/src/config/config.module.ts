import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "node:path";
import { envValidationSchema } from "./env.validation";

const rootDir = resolve(__dirname, "../../../..");

@Module({
  imports: [
    ConfigModule.forRoot({
      // 全局注册
      isGlobal: true,
      // 加载 env 文件
      envFilePath: [
        resolve(rootDir, `.env.${process.env["NODE_ENV"] ?? "development"}`),
        resolve(rootDir, ".env"),
      ],
      // 校验环境变量
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
