import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { AppConfigModule } from "./config/config.module";
import { UserModule } from "./modules/iam/user/user.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    UserModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
