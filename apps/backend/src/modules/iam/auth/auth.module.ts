import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Identity } from "../identity/entities/identity.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
