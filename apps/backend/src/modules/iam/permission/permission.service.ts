import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageQueryDto } from "../../../common/dto/page-query.dto";
import { getPagination, pageResult } from "../../../common/utils/pagination";
import { CreatePermissionDto, UpdatePermissionDto } from "./dto/permission.dto";
import { Permission } from "./entities/permission.entity";

@Injectable()
export class PermissionService {
  constructor(@InjectRepository(Permission) private readonly permissions: Repository<Permission>) {}

  async hasPermissions(userId: number, codes: string[]) {
    const count = await this.permissions
      .createQueryBuilder("permission")
      .innerJoin("permission.roles", "role")
      .innerJoin("role.users", "user", "user.id = :userId", { userId })
      .where("permission.code IN (:...codes)", { codes })
      .andWhere("permission.deletedAt IS NULL")
      .andWhere("role.deletedAt IS NULL")
      .getCount();

    return count === new Set(codes).size;
  }

  // 查询权限列表
  async findAll({ page, pageSize }: PageQueryDto) {
    const pagination = getPagination(page, pageSize);
    const [items, total] = await this.permissions.findAndCount({
      skip: pagination.skip,
      take: pagination.take,
      order: { id: "DESC" },
    });

    return pageResult(items, total, pagination);
  }

  // 查询单个权限
  async findOne(id: number) {
    const permission = await this.permissions.findOne({ where: { id } });
    if (!permission) throw new NotFoundException("权限不存在");
    return permission;
  }

  // 创建权限
  create(data: CreatePermissionDto) {
    return this.permissions.save(this.permissions.create(data));
  }

  // 更新权限
  async update(id: number, data: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    Object.assign(permission, data);
    return this.permissions.save(permission);
  }

  // 软删除权限
  async remove(id: number) {
    const permission = await this.findOne(id);
    await this.permissions.softRemove(permission);
  }
}
