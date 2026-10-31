import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
}
