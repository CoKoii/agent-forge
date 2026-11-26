import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Identity } from "../identity/entities/identity.entity";
import { RefreshSession } from "./entities/refresh-session.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubService } from "./github.service";
import { GoogleService } from "./google.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity, RefreshSession]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.getOrThrow("JWT_ACCESS_SECRET"),
        signOptions: {
          expiresIn: cs.getOrThrow<number>("JWT_ACCESS_EXPIRES_IN"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubService, GoogleService],
})
export class AuthModule {}
