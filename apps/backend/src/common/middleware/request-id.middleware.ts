import { randomUUID } from "node:crypto";
import type { NodeRequest } from "@nestjs/platform-node";
import { requestContext } from "../context/request-context";

// 请求 ID 中间件
export const requestIdMiddleware = (
  request: NodeRequest & { id?: string },
  _response: unknown,
  next: () => void,
) => {
  // 初始化请求上下文
  requestContext.run({ userId: null }, () => {
    // 生成请求 ID，供响应和异常日志关联
    request.id = randomUUID();
    next();
  });
};
