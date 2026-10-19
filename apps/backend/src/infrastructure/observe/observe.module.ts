import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import { AppConfigModule } from "../../config/config.module";

const { ObserveModule, ObserveInstrument } = createObserveModule();
export { ObserveInstrument };

@Module({
  imports: [
    ObserveModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.get<string>("OBSERVE_APP_KEY", ""),
        appSecret: configService.get<string>("OBSERVE_APP_SECRET", ""),
        serviceId: "backend",
      }),
    }),
  ],
  exports: [ObserveModule],
})
export class ObserveInfrastructureModule {}
