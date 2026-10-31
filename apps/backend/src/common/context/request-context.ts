import { AsyncLocalStorage } from "node:async_hooks";

// 请求上下文
export type RequestContext = {
  userId: number | null;
};

// 请求上下文存储
export const requestContext = new AsyncLocalStorage<RequestContext>();
