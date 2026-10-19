import { NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ObserveInstrument } from "./infrastructure/observe/observe.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    bufferLogs: true,
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
