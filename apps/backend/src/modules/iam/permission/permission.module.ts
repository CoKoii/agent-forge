import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../role/entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { PermissionsGuard } from "../../../common/guards/permissions.guard";
import { PermissionService } from "./permission.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  providers: [PermissionService, PermissionsGuard],
  exports: [PermissionService, PermissionsGuard],
})
export class PermissionModule {}
