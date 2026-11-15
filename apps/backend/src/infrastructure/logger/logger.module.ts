import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { utilities, WinstonModule } from "nest-winston";
import { format, transports } from "winston";

@Module({
  imports: [
    // 全局日志配置
    WinstonModule.forRootAsync({
      // 注入配置服务
      inject: [ConfigService],
      // 日志配置
      useFactory: (configService: ConfigService) => {
        return {
          transports: [
            // 控制台输出
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
