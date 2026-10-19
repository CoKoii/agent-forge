import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/iam/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { ObserveInfrastructureModule } from "./infrastructure/observe/observe.module";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { AppConfigModule } from "./config/config.module";

@Module({
  imports: [AppConfigModule, LoggerModule, ObserveInfrastructureModule, AuthModule, HealthModule],
})
export class AppModule {}
