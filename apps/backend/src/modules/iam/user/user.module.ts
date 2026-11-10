import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionModule } from "../permission/permission.module";
import { Role } from "../role/entities/role.entity";
import { AuthSession } from "../auth/entities/auth-session.entity";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, AuthSession]), PermissionModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
