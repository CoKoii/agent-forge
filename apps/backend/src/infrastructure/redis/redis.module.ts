import { Logger, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { createKeyv } from "@keyv/redis";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = new URL("redis://localhost");
        redisUrl.hostname = configService.getOrThrow<string>("REDIS_HOST");
        redisUrl.port = String(configService.getOrThrow<number>("REDIS_PORT"));
        redisUrl.pathname = `/${configService.getOrThrow<number>("REDIS_DB")}`;

        const password = configService.getOrThrow<string>("REDIS_PASSWORD");
        if (password) {
          redisUrl.password = password;
        }

        const store = createKeyv(redisUrl.toString());
        store.on("error", (error: unknown) =>
          Logger.error(String(error).replace(/rediss?:\/\/[^\s"'<>]+/gi, "[Redis URL redacted]")),
        );

        return { stores: [store] };
      },
    }),
  ],
})
export class RedisModule {}
