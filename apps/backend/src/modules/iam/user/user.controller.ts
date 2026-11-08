import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../../common/guards/jwt-auth.guard";
import { UserListQueryDto } from "./dto/user-list-query.dto";
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
  @Get()
  findAll(@Query() query: UserListQueryDto) {
    return this.users.findAll(query);
  }

  // 查询单个用户
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }

  // 删除用户
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}
