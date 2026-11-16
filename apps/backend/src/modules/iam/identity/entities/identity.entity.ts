import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity("identities")
export class Identity extends BaseEntity {
  @Column({ comment: "身份提供者" })
  provider: string;

  @Column({ comment: "提供者主体 ID" })
  providerAccountId: string;

  @ManyToOne(() => User, (user) => user.identities)
  @JoinColumn()
  user: User;
}
