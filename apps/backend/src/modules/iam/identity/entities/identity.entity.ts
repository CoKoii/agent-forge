import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity("identities", { comment: "用户身份凭证" })
export class Identity extends BaseEntity {
  @Column({ comment: "身份提供者" })
  provider: string;

  @Column({ comment: "提供者主体" })
  providerSubject: string;

  @Column({ comment: "密码哈希" })
  passwordHash: string;

  @ManyToOne(() => User, (user) => user.identities)
  @JoinColumn()
  user: User;
}
