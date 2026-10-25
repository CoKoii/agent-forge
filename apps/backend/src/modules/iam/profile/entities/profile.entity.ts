import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity({ comment: "用户资料" })
export class Profile extends BaseEntity {
  @Column({ comment: "昵称", length: 50 })
  nickname!: string;

  @Column({ comment: "头像", type: "varchar", length: 500, nullable: true })
  avatarUrl!: string | null;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user!: User;
}
