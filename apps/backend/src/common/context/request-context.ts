import { AsyncLocalStorage } from "node:async_hooks";

// 请求上下文
export type RequestContext = {
  userId: number | null;
};

// 请求上下文存储
export const requestContext = new AsyncLocalStorage<RequestContext>();

// 写入当前用户 ID
export function setCurrentUserId(userId: number) {
  const context = requestContext.getStore();
  if (context) context.userId = userId;
}
