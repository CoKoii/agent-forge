import { randomUUID } from "node:crypto";
import type { NodeRequest } from "@nestjs/platform-node";

// 请求 ID 中间件
export const requestIdMiddleware = (
  request: NodeRequest & { id?: string },
  _response: unknown,
  next: () => void,
) => {
  // 生成请求 ID，供响应和异常日志关联
  request.id = randomUUID();

  // 继续处理请求
  next();
};
