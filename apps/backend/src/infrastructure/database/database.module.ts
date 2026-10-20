import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: "postgres",
        host: cs.getOrThrow("DB_HOST"),
        port: cs.getOrThrow<number>("DB_PORT"),
        username: cs.getOrThrow("DB_USERNAME"),
        password: cs.getOrThrow("DB_PASSWORD"),
        database: cs.getOrThrow("DB_DATABASE"),
        autoLoadEntities: true,
        synchronize: cs.get("NODE_ENV") === "development",
        logging: cs.get("NODE_ENV") === "development",
        extra: { max: cs.getOrThrow<number>("DB_POOL_MAX") },
      }),
    }),
  ],
})
export class DatabaseModule {}
