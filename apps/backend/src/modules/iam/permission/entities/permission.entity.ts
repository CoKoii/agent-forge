import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { Role } from "../../role/entities/role.entity";

@Entity({ comment: "权限" })
export class Permission extends BaseEntity {
  @Column({ comment: "权限编码", length: 100, unique: true })
  code!: string;

  @Column({ comment: "权限名称", length: 100 })
  name!: string;

  @Column({ comment: "权限说明", type: "varchar", length: 255, nullable: true })
  description!: string | null;

  @Column({ comment: "父权限ID", type: "integer", nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Permission, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "parentId" })
  parent!: Permission | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
