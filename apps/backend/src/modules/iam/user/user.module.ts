import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionModule } from "../permission/permission.module";
import { Role } from "../role/entities/role.entity";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserRoleController } from "./user-role.controller";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), PermissionModule],
  controllers: [UserController, UserRoleController],
  providers: [UserService],
})
export class UserModule {}
