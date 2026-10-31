import { Controller, Get, Req } from "@nestjs/common";
import type { NodeRequest } from "@nestjs/platform-node";
import { UserService } from "./user.service";

// 用户控制器
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 查询当前用户
  @Get("me")
  getCurrentUser(@Req() request: NodeRequest & { user: { sub: number } }) {
    return this.userService.getCurrentUser(request.user.sub);
  }
}
