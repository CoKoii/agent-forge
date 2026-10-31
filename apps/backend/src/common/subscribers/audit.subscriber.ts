import {
  EventSubscriber,
  type EntitySubscriberInterface,
  type InsertEvent,
  type SoftRemoveEvent,
  type UpdateEvent,
} from "typeorm";
import { requestContext } from "../context/request-context";
import { BaseEntity } from "../entities/base.entity";

// 审计字段订阅器
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
  // 获取当前用户 ID
  private getCurrentUserId() {
    return requestContext.getStore()?.userId ?? null;
  }

  // 创建时写入审计字段
  beforeInsert({ entity }: InsertEvent<BaseEntity>) {
    const userId = this.getCurrentUserId();
    Object.assign(entity!, { createdBy: userId, updatedBy: userId });
  }

  // 更新时写入修改人
  beforeUpdate({ entity }: UpdateEvent<BaseEntity>) {
    entity!.updatedBy = this.getCurrentUserId();
  }

  // 软删除时写入删除人
  beforeSoftRemove({ entity }: SoftRemoveEvent<BaseEntity>) {
    entity!.deletedBy = this.getCurrentUserId();
  }
}
