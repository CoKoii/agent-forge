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
  Query,
  Req,
} from "@nestjs/common";
import type { NodeRequest } from "@nestjs/platform-node";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

// 用户控制器
@Controller("user")
export class UserController {
  // 用户管理依赖
  constructor(private readonly users: UserService) {}

  // 查询当前用户
  @Get("me")
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

  // 创建用户
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  // 更新用户
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  // 删除用户
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}
