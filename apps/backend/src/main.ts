import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ObserveInstrument } from "./infrastructure/observe/observe.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
