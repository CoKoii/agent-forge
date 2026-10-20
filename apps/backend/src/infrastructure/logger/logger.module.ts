import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { utilities, WinstonModule } from "nest-winston";
import { format, transports } from "winston";

@Module({
  imports: [
    // 全局日志：winston 控制台
    WinstonModule.forRootAsync({
      // 注入 ConfigService 以便读取日志相关配置
      inject: [ConfigService],
      // 创建日志配置
      useFactory: (configService: ConfigService) => {
        return {
          transports: [
            // 控制台：按 Nest 风格输出，便于开发调试
            new transports.Console({
              level: configService.getOrThrow<string>("LOG_LEVEL"),
              format: format.combine(
                format.timestamp(),
                format.ms(),
                utilities.format.nestLike("server"),
              ),
            }),
          ],
        };
      },
    }),
  ],
})
export class LoggerModule {}
