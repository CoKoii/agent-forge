import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

// 用户服务
@Injectable()
export class UserService {
  // 服务依赖配置
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  // 查询当前用户
  async getCurrentUser(userId: number) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException("用户不存在");

    return user;
  }
}
