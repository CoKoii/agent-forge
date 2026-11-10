import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreatePermissionDto, UpdatePermissionDto } from "./dto/permission.dto";
import { Permissions } from "../../../common/decorators/permissions.decorator";

import { PermissionService } from "./permission.service";

@Controller("permissions")
export class PermissionController {
  // 权限管理依赖
  constructor(private readonly permissions: PermissionService) {}

  // 查询权限列表
  @Permissions("system:permission:read")
  @Get()
  findAll() {
    return this.permissions.findAll();
  }

  // 查询单个权限
  @Permissions("system:permission:read")
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.permissions.findOne(id);
  }

  // 创建权限
  @Permissions("system:permission:create")
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissions.create(dto);
  }

  // 更新权限
  @Permissions("system:permission:update")
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissions.update(id, dto);
  }

  // 删除权限
  @Permissions("system:permission:delete")
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.permissions.remove(id);
  }
}
