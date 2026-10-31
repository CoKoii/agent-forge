import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { UserService } from "./user.service";

@Controller("admin/users")
@Permissions("user-role:manage")
export class UserRoleController {
  // 用户角色管理依赖
  constructor(private readonly users: UserService) {}

  // 查询用户角色
  @Get(":userId/roles")
  getRoles(@Param("userId", ParseIntPipe) userId: number) {
    return this.users.getRoles(userId);
  }

  // 分配用户角色
  @Post(":userId/roles")
  assignRole(@Param("userId", ParseIntPipe) userId: number, @Body() dto: AssignRoleDto) {
    return this.users.assignRole(userId, dto.roleId);
  }

  // 移除用户角色
  @Delete(":userId/roles/:roleId")
  removeRole(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("roleId", ParseIntPipe) roleId: number,
  ) {
    return this.users.removeRole(userId, roleId);
  }
}
