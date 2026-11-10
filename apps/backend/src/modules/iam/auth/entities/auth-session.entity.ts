import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity({ comment: "用户登录会话" })
export class AuthSession extends BaseEntity {
  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "char", length: 64, comment: "Refresh Token 的 SHA-256 哈希" })
  refreshTokenHash!: string;

  @Column({ type: "timestamptz", comment: "会话过期时间" })
  expiresAt!: Date;
}
