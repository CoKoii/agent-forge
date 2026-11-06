import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from "@nestjs/common";
import type { NodeRequest } from "@nestjs/platform-node";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { UserService } from "./user.service";

// 用户控制器
@Controller("user")
export class UserController {
  // 用户管理依赖
  constructor(private readonly users: UserService) {}

  // 查询当前用户信息
  @Get("info")
  getCurrentUser(@Req() request: NodeRequest & { user: { sub: number } }) {
    return this.users.findOne(request.user.sub);
  }

  // 查询用户列表
  @Get()
  findAll(@Query() query: PageQueryDto) {
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
