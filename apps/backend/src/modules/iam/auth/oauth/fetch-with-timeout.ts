import { HttpException, HttpStatus } from "@nestjs/common";

// 为第三方请求统一加超时
export function fetchWithTimeout(url: string, init: RequestInit, unavailableMessage: string) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(5000) }).catch(() => {
    throw new HttpException(unavailableMessage, HttpStatus.BAD_GATEWAY);
  });
}
