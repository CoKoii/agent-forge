import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";

@Entity({ comment: "用户" })
export class User extends BaseEntity {
  @Column({ comment: "用户名", length: 50 })
  username!: string;

  @Column({ comment: "密码", length: 100 })
  password!: string;
}
