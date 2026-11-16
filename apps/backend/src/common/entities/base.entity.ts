import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/** 全局基础实体 */
export class BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id: number;

  @CreateDateColumn({ comment: "创建时间", select: false })
  createdAt: Date;

  @Column({ comment: "创建人ID", select: false })
  createdBy: number;

  @UpdateDateColumn({ comment: "更新时间", select: false })
  updatedAt: Date;

  @Column({ comment: "更新人ID", select: false })
  updatedBy: number;

  @DeleteDateColumn({ comment: "软删除时间", select: false })
  deletedAt: Date;

  @Column({ comment: "删除人ID", select: false })
  deletedBy: number;
}
