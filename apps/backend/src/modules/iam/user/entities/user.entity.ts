import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { Profile } from "../../profile/entities/profile.entity";

@Entity({ comment: "用户" })
export class User extends BaseEntity {
  @Column({ comment: "用户名", length: 50, unique: true })
  username!: string;

  @Column({ comment: "密码哈希", select: false })
  passwordHash!: string;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: ["insert"] })
  profile!: Profile;
}
