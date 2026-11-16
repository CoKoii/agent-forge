import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../../common/entities/base.entity";

@Entity("profiles")
export class Profile extends BaseEntity {
  @Column({ comment: "用户昵称" })
  nickname: string;

  @Column({ comment: "用户头像", nullable: true })
  avatarUrl: string;

  @Column({ comment: "用户简介", nullable: true })
  bio: string;
}
