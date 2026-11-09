import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, QueryFailedError, Repository } from "typeorm";
import { Permission } from "../permission/entities/permission.entity";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { Role } from "./entities/role.entity";

@Injectable()
export class RoleService {
  // 角色和权限数据依赖
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission) private readonly permissions: Repository<Permission>,
  ) {}

  findAll() {
    return this.roles.find({
      relations: { permissions: true },
      order: { id: "DESC" },
    });
  }

  // 查询单个角色
  async findOne(id: number) {
    const role = await this.roles.findOne({ where: { id }, relations: { permissions: true } });
    if (!role) throw new NotFoundException("角色不存在");
    return role;
  }

  // 创建角色
  async create({ permissionIds, ...data }: CreateRoleDto) {
    const role = this.roles.create({
      ...data,
      permissions: await this.getPermissions(permissionIds),
    });
    return this.saveRole(role);
  }

  // 更新角色和权限
  async update(id: number, { permissionIds, ...data }: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, data);
    if (permissionIds) role.permissions = await this.getPermissions(permissionIds);
    return this.saveRole(role);
  }

  // 软删除角色
  async remove(id: number) {
    const role = await this.findOne(id);
    const userCount = await this.roles
      .createQueryBuilder("role")
      .innerJoin("role.users", "user")
      .where("role.id = :id", { id })
      .getCount();
    if (userCount) throw new ConflictException("该角色仍绑定用户，无法删除");
    await this.roles.softRemove(role);
  }

  private async saveRole(role: Role) {
    try {
      return await this.roles.save(role);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === "23505") {
        throw new ConflictException("角色编码已存在");
      }
      throw error;
    }
  }

  // 加载角色权限
  private async getPermissions(ids?: number[]) {
    if (!ids) return [];
    const permissions = await this.permissions.find({ where: { id: In(ids) } });
    if (permissions.length !== ids.length) throw new NotFoundException("权限不存在");
    return permissions;
  }
}
