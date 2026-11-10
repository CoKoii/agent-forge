import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { UserListQueryDto } from "./dto/user-list-query.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthSession } from "../auth/entities/auth-session.entity";
import { Role } from "../role/entities/role.entity";
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
    roleId,
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
    if (roleId) {
      query.innerJoin("user.roles", "filterRole", "filterRole.id = :roleId", { roleId });
    }
    if (createdAtStart) {
      query.andWhere("user.createdAt >= :createdAtStart", { createdAtStart });
    }
    if (createdAtEnd) {
      query.andWhere("user.createdAt <= :createdAtEnd", { createdAtEnd });
    }
    const [items, total] = await query
      .skip((currentPage - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total };
  }

  // 查询当前用户
  async findCurrent(currentUser: AuthUser) {
    const user = await this.findOne(currentUser.userId);
    const { id: _profileId, ...profile } = user.profile;
    return { ...profile, roles: user.roles.map(({ code }) => code) };
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

  // 更新用户及角色
  async update(id: number, { realName, nickname, roleIds }: UpdateUserDto) {
    return this.users.manager.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id },
        relations: { profile: true, roles: true },
      });
      if (!user) throw new NotFoundException("用户不存在");

      if (realName !== undefined) user.profile.realName = realName;
      if (nickname !== undefined) user.profile.nickname = nickname;
      if (roleIds !== undefined) {
        user.roles = await manager.findBy(Role, { id: In(roleIds) });
        if (user.roles.length !== roleIds.length) throw new NotFoundException("角色不存在");
      }
      await manager.save(user);
    });
  }

  // 删除用户并撤销其会话
  async remove(id: number) {
    await this.sessions.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const user = await users.findOneBy({ id });
      if (!user) throw new NotFoundException("用户不存在");
      await manager.getRepository(AuthSession).delete({ user: { id } });
      await users.softRemove(user);
    });
  }
}
