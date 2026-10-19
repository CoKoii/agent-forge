import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/iam/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { ObserveInfrastructureModule } from "./infrastructure/observe/observe.module";

@Module({
  imports: [ObserveInfrastructureModule, AuthModule, HealthModule],
})
export class AppModule {}
