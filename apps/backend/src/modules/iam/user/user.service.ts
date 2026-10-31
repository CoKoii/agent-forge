import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../role/entities/role.entity";
import { User } from "./entities/user.entity";

// 用户服务
@Injectable()
export class UserService {
  // 服务依赖配置
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  // 查询当前用户
  async getCurrentUser(userId: number) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException("用户不存在");

    return user;
  }

  // 查询用户角色
  async getRoles(userId: number) {
    const user = await this.findWithRoles(userId);
    return user.roles;
  }

  // 分配用户角色
  async assignRole(userId: number, roleId: number) {
    const user = await this.findWithRoles(userId);
    const role = await this.roles.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException("角色不存在");

    if (!user.roles.some(({ id }) => id === roleId)) {
      user.roles.push(role);
      await this.users.save(user);
    }

    return user.roles;
  }

  // 移除用户角色
  async removeRole(userId: number, roleId: number) {
    const user = await this.findWithRoles(userId);
    user.roles = user.roles.filter(({ id }) => id !== roleId);
    await this.users.save(user);
  }

  // 查询用户和角色
  private async findWithRoles(userId: number) {
    const user = await this.users.findOne({ where: { id: userId }, relations: { roles: true } });
    if (!user) throw new NotFoundException("用户不存在");
    return user;
  }
}
