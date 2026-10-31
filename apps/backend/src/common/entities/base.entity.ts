import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/** 全局基础实体 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id!: number;

  @CreateDateColumn({ comment: "创建时间", type: "timestamptz" })
  createdAt!: Date;

  @Column({ comment: "创建人ID", type: "integer", nullable: true })
  createdBy!: number | null;

  @UpdateDateColumn({ comment: "更新时间", type: "timestamptz" })
  updatedAt!: Date;

  @Column({ comment: "更新人ID", type: "integer", nullable: true })
  updatedBy!: number | null;

  @DeleteDateColumn({ comment: "软删除时间", type: "timestamptz" })
  deletedAt!: Date | null;

  @Column({ comment: "删除人ID", type: "integer", nullable: true })
  deletedBy!: number | null;
}
