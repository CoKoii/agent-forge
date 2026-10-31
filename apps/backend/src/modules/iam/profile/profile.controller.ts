import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import type { NodeRequest } from "@nestjs/platform-node";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ProfileService } from "./profile.service";

// 个人资料控制器
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 查询当前资料
  @Get()
  getCurrentProfile(@Req() request: NodeRequest & { user: { sub: number } }) {
    return this.profileService.getCurrentProfile(request.user.sub);
  }

  // 更新当前资料
  @Patch()
  updateCurrentProfile(
    @Req() request: NodeRequest & { user: { sub: number } },
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.profileService.updateCurrentProfile(request.user.sub, updateDto);
  }
}
