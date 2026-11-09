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
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { Permissions } from "../../../common/decorators/permissions.decorator";

import { RoleService } from "./role.service";

@Controller("roles")
export class RoleController {
  // 角色管理依赖
  constructor(private readonly roles: RoleService) {}

  // 查询角色列表
  @Permissions("system:role:read")
  @Get()
  findAll() {
    return this.roles.findAll();
  }

  // 查询单个角色
  @Permissions("system:role:read")
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.roles.findOne(id);
  }

  // 创建角色
  @Permissions("system:role:create")
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  // 更新角色
  @Permissions("system:role:update")
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roles.update(id, dto);
  }

  // 删除角色
  @Permissions("system:role:delete")
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.roles.remove(id);
  }
}
