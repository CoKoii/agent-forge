import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import { AppConfigModule } from "./config/config.module";
import { AuthModule } from "./modules/iam/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.get("OBSERVE_APP_KEY", ""),
        appSecret: configService.get("OBSERVE_APP_SECRET", ""),
        serviceId: "backend",
      }),
    }),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
