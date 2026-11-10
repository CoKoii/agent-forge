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
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Permissions } from "../../../common/decorators/permissions.decorator";

import type { AuthUser } from "../../../common/guards/jwt-auth.guard";
import { UserListQueryDto } from "./dto/user-list-query.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

// 用户控制器
@Controller("user")
export class UserController {
  constructor(private readonly users: UserService) {}

  // 查询当前用户信息
  @Get("info")
  getCurrentUser(@CurrentUser() user: AuthUser) {
    return this.users.findCurrent(user);
  }

  // 查询用户列表
  @Permissions("system:user:read")
  @Get()
  findAll(@Query() query: UserListQueryDto) {
    return this.users.findAll(query);
  }

  // 查询单个用户
  @Permissions("system:user:read")
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }

  // 更新用户
  @Permissions("system:user:update")
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  // 删除用户
  @Permissions("system:user:delete")
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}
