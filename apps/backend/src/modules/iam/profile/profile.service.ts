import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Profile } from "./entities/profile.entity";

// 个人资料服务
@Injectable()
export class ProfileService {
  // 服务依赖配置
  constructor(@InjectRepository(Profile) private readonly profiles: Repository<Profile>) {}

  // 查询当前资料
  async getCurrentProfile(userId: number) {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) throw new NotFoundException("个人资料不存在");
    return profile;
  }

  // 更新当前资料
  async updateCurrentProfile(userId: number, updateDto: UpdateProfileDto) {
    if (!Object.keys(updateDto).length) {
      throw new BadRequestException("至少提供一个资料字段");
    }

    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) throw new NotFoundException("个人资料不存在");

    Object.assign(profile, updateDto);
    await this.profiles.save(profile);
    return profile;
  }
}
