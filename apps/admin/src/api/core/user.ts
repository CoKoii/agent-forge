import type { UserInfo } from "@vben/types";

import { requestClient } from "#/api/request";

/** 获取当前用户信息。 */
export function getUserInfoApi() {
  return requestClient.get<UserInfo>("/user/info");
}

/** 按关键词、角色和创建时间查询用户列表。 */
export function getUserListApi(params: any) {
  return requestClient.get("/user", { params });
}

export function getUserApi(id: number) {
  return requestClient.get(`/user/${id}`);
}

/** 更新用户资料和角色。 */
export function updateUserApi(id: number, data: any) {
  return requestClient.request(`/user/${id}`, { method: "PATCH", data });
}
