import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { AppConfigModule } from "./config/config.module";
import { UserModule } from "./modules/iam/user/user.module";
import { ProfileModule } from "./modules/iam/profile/profile.module";
import { IdentityModule } from "./modules/iam/identity/identity.module";
import { AuthModule } from "./modules/iam/auth/auth.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    AppConfigModule,
    RedisModule,
    LoggerModule,
    DatabaseModule,
    UserModule,
    ProfileModule,
    IdentityModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
