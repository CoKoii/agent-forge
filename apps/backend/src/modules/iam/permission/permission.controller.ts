import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreatePermissionDto, UpdatePermissionDto } from "./dto/permission.dto";
import { PermissionService } from "./permission.service";

@Controller("admin/permissions")
@Permissions("permission:manage")
export class PermissionController {
  // 权限管理依赖
  constructor(private readonly permissions: PermissionService) {}

  // 查询权限列表
  @Get()
  findAll() {
    return this.permissions.findAll();
  }

  // 查询单个权限
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.permissions.findOne(id);
  }

  // 创建权限
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissions.create(dto);
  }

  // 更新权限
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissions.update(id, dto);
  }

  // 删除权限
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.permissions.remove(id);
  }
}
