import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/iam/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { ObserveInfrastructureModule } from "./infrastructure/observe/observe.module";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { AppConfigModule } from "./config/config.module";
import { ProfileModule } from "./modules/iam/profile/profile.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    AppConfigModule,
    LoggerModule,
    ObserveInfrastructureModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    ProfileModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
