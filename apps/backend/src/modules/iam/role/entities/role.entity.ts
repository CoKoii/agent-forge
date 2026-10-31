import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { Permission } from "../../permission/entities/permission.entity";
import { User } from "../../user/entities/user.entity";

@Entity({ comment: "角色" })
export class Role extends BaseEntity {
  @Column({ comment: "角色编码", length: 100, unique: true })
  code!: string;

  @Column({ comment: "角色名称", length: 100 })
  name!: string;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({ name: "role_permission" })
  permissions!: Permission[];
}
