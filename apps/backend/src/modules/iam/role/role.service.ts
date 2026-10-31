import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { Permission } from "../permission/entities/permission.entity";
import { getPagination, pageResult } from "../../../common/utils/pagination";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { Role } from "./entities/role.entity";

@Injectable()
export class RoleService {
  // 角色和权限数据依赖
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission) private readonly permissions: Repository<Permission>,
  ) {}

  // 查询角色列表
  async findAll({ page, pageSize }: PageQueryDto) {
    const pagination = getPagination(page, pageSize);
    const [items, total] = await this.roles.findAndCount({
      relations: { permissions: true },
      skip: pagination.skip,
      take: pagination.take,
      order: { id: "DESC" },
    });

    return pageResult(items, total, pagination);
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
    return this.roles.save(role);
  }

  // 更新角色和权限
  async update(id: number, { permissionIds, ...data }: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, data);
    if (permissionIds) role.permissions = await this.getPermissions(permissionIds);
    return this.roles.save(role);
  }

  // 软删除角色
  async remove(id: number) {
    const role = await this.findOne(id);
    await this.roles.softRemove(role);
  }

  // 加载角色权限
  private async getPermissions(ids?: number[]) {
    if (!ids) return [];
    const permissions = await this.permissions.find({ where: { id: In(ids) } });
    if (permissions.length !== ids.length) throw new NotFoundException("权限不存在");
    return permissions;
  }
}
