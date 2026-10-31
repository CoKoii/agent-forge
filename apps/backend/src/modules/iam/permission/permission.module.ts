import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../role/entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { RoleController } from "../role/role.controller";
import { RoleService } from "../role/role.service";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  controllers: [PermissionController, RoleController],
  providers: [PermissionService, PermissionsGuard, RoleService],
  exports: [PermissionService, PermissionsGuard],
})
export class PermissionModule {}
