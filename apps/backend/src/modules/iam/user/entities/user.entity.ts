import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ comment: "用户状态", default: "active" })
  status: "active" | "disabled";
}
