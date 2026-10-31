import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { RoleService } from "./role.service";

@Controller("admin/roles")
@Permissions("role:manage")
export class RoleController {
  // 角色管理依赖
  constructor(private readonly roles: RoleService) {}

  // 查询角色列表
  @Get()
  findAll() {
    return this.roles.findAll();
  }

  // 查询单个角色
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.roles.findOne(id);
  }

  // 创建角色
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  // 更新角色
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roles.update(id, dto);
  }

  // 删除角色
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.roles.remove(id);
  }
}
