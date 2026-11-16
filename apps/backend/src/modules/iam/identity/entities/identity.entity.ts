import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";

@Entity("identities")
export class Identity extends BaseEntity {
  @Column({ comment: "身份提供者" })
  provider: string;
}
