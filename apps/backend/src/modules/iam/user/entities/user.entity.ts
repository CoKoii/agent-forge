import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { Profile } from "../../profile/entities/profile.entity";
import { Identity } from "../../identity/entities/identity.entity";

@Entity("users", { comment: "用户账号" })
export class User extends BaseEntity {
  @Column({ comment: "用户状态", default: "active" })
  status: "active" | "disabled";

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Identity, (identity) => identity.user)
  identities: Identity[];
}
