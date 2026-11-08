import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserListQueryDto } from "./dto/user-list-query.dto";
import { AuthSession } from "../auth/entities/auth-session.entity";
import { User } from "./entities/user.entity";
import type { AuthUser } from "../../../common/guards/jwt-auth.guard";

// 用户服务
@Injectable()
export class UserService {
  // 服务依赖配置
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {}

  // 查询用户列表
  async findAll({
    currentPage,
    pageSize,
    keyword,
    createdAtStart,
    createdAtEnd,
  }: UserListQueryDto) {
    const query = this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.roles", "role")
      .addSelect("user.createdAt")
      .orderBy("user.id", "DESC");
    const search = keyword?.trim();
    if (search) {
      query.andWhere(
        "(user.username ILIKE :search OR profile.realName ILIKE :search OR profile.nickname ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (createdAtStart) {
      query.andWhere("user.createdAt >= :createdAtStart", { createdAtStart });
    }
    if (createdAtEnd) {
      query.andWhere("user.createdAt <= :createdAtEnd", { createdAtEnd });
    }
    const [users, total] = await query
      .skip((currentPage - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      items: users,
      total,
      currentPage,
      pageSize,
    };
  }

  // 查询当前用户
  async findCurrent(currentUser: AuthUser) {
    const user = await this.findOne(currentUser.userId);
    const { id: _profileId, ...profile } = user.profile;
    return { ...profile, roles: user.roles };
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
