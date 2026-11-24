import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity("refresh_sessions", { comment: "刷新令牌会话" })
export class RefreshSession extends BaseEntity {
  @Index()
  @Column({ comment: "刷新令牌哈希", select: false })
  tokenHash: string;

  @Column({ comment: "用户ID" })
  userId: number;

  @Column({ type: "timestamptz", comment: "过期时间" })
  expiresAt: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
