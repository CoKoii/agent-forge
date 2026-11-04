import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { paginate } from "../../../common/utils/pagination";
import { AuthSession } from "../auth/entities/auth-session.entity";
import { User } from "./entities/user.entity";

// 用户服务
@Injectable()
export class UserService {
  // 服务依赖配置
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {}

  // 查询用户列表
  findAll(query: PageQueryDto) {
    return paginate(this.users, query, {
      relations: { profile: true, roles: true },
      order: { id: "DESC" },
    });
  }

  // 查询单个用户
  async findOne(id: number) {
    const user = await this.users.findOne({
      where: { id },
      relations: { profile: true, roles: true },
    });
    if (!user) throw new NotFoundException("用户不存在");
    return user;
  }

  // 删除用户
  async remove(id: number) {
    const user = await this.findOne(id);
    await this.sessions.delete({ user: { id } });
    await this.users.softRemove(user);
  }

}
