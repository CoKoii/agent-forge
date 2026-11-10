import { Body, Controller, Get, Patch } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../../common/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ProfileService } from "./profile.service";

// 个人资料控制器
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 查询当前资料
  @Get()
  getCurrentProfile(@CurrentUser() user: AuthUser) {
    return this.profileService.getCurrentProfile(user);
  }

  // 更新当前资料
  @Patch()
  updateCurrentProfile(@CurrentUser() user: AuthUser, @Body() updateDto: UpdateProfileDto) {
    return this.profileService.updateCurrentProfile(user, updateDto);
  }
}
