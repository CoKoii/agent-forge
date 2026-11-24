import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/** 全局基础实体 */
export class BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id: number;

  @CreateDateColumn({ type: "timestamptz", comment: "创建时间", select: false })
  createdAt: Date;

  @Column({ comment: "创建人ID", select: false, nullable: true })
  createdBy: number;

  @UpdateDateColumn({ type: "timestamptz", comment: "更新时间", select: false })
  updatedAt: Date;

  @Column({ comment: "更新人ID", select: false, nullable: true })
  updatedBy: number;
}
