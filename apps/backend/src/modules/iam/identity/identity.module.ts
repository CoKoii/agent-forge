import { Module } from "@nestjs/common";
import { IdentityService } from "./identity.service";
import { IdentityController } from "./identity.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Identity } from "./entities/identity.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}
