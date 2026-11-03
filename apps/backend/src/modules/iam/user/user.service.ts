import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { In, Repository } from "typeorm";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { paginate } from "../../../common/utils/pagination";
import { AuthSession } from "../auth/entities/auth-session.entity";
import { Role } from "../role/entities/role.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

// 用户服务
@Injectable()
export class UserService {
  // 服务依赖配置
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
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

  // 创建用户
  async create({ username, password, confirmPassword, roleIds }: CreateUserDto) {
    if (password !== confirmPassword) {
      throw new BadRequestException("密码和确认密码不一致");
    }

    await this.ensureUsernameAvailable(username);
    const user = this.users.create({
      username,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      profile: { nickname: username },
      roles: await this.getRoleEntities(roleIds),
    });
    await this.users.save(user);
    return this.findOne(user.id);
  }

  // 更新用户
  async update(id: number, { username, roleIds }: UpdateUserDto) {
    const user = await this.findOne(id);
    if (username !== undefined && username !== user.username) {
      await this.ensureUsernameAvailable(username, id);
      user.username = username;
    }
    if (roleIds !== undefined) user.roles = await this.getRoleEntities(roleIds);
    return this.users.save(user);
  }

  // 删除用户
  async remove(id: number) {
    const user = await this.findOne(id);
    await this.sessions.delete({ user: { id } });
    await this.users.softRemove(user);
  }

  // 校验用户名是否可用
  private async ensureUsernameAvailable(username: string, currentUserId?: number) {
    const user = await this.users.findOne({ where: { username }, withDeleted: true });
    if (user && user.id !== currentUserId) throw new ConflictException("用户名已存在");
  }

  // 查询角色实体
  private async getRoleEntities(roleIds?: number[]) {
    if (!roleIds?.length) return [];
    const roles = await this.roles.find({ where: { id: In(roleIds) } });
    if (roles.length !== roleIds.length) throw new NotFoundException("角色不存在");
    return roles;
  }
}
