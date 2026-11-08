import type { UserInfo } from "@vben/types";

import { requestClient } from "#/api/request";

/** 获取当前用户信息。 */
export function getUserInfoApi() {
  return requestClient.get<UserInfo>("/user/info");
}

/** 按关键词和创建时间查询用户列表。 */
export function getUserListApi(params: any) {
  return requestClient.get<any>("/user", { params });
}
