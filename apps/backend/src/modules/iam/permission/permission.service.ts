import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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

  async findAllCodes(): Promise<string[]> {
    const permissions = await this.permissions.find({ select: { code: true }, order: { code: "ASC" } });
    return permissions.map(({ code }) => code);
  }
  // 查询用户权限编码
  async findCodesByUserId(userId: number): Promise<string[]> {
    const permissions = await this.permissions.find({
      where: { roles: { users: { id: userId } } },
      order: { code: "ASC" },
      relations: { roles: { users: true } },
    });
    return [...new Set(permissions.map(({ code }) => code))];
  }

  findAll() {
    return this.permissions.find({ order: { code: "ASC" }, relations: { parent: true } });
  }

  // 查询单个权限
  async findOne(id: number) {
    const permission = await this.permissions.findOne({ where: { id } });
    if (!permission) throw new NotFoundException("权限不存在");
    return permission;
  }

  async create(data: CreatePermissionDto) {
    await this.validateParent(data.parentId);
    const { parentId, ...permission } = data;
    return this.permissions.save(this.permissions.create({ ...permission, parentId }));
  }

  // 更新权限
  async update(id: number, data: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    await this.validateParent(data.parentId, id);
    Object.assign(permission, data);
    return this.permissions.save(permission);
  }

  private async validateParent(parentId?: number | null, id?: number) {
    if (parentId == null) return;
    if (parentId === id) throw new ConflictException("权限不能设置自身为上级");
    const visited = new Set<number>(id ? [id] : []);
    let current = parentId;
    while (current) {
      if (visited.has(current)) throw new ConflictException("权限层级不能形成循环");
      visited.add(current);
      const parent = await this.permissions.findOne({ where: { id: current }, select: { id: true, parentId: true } });
      if (!parent) throw new NotFoundException("上级权限不存在");
      current = parent.parentId ?? 0;
    }
  }

  // 软删除权限
  async remove(id: number) {
    const permission = await this.findOne(id);
    await this.permissions.softRemove(permission);
  }
}
