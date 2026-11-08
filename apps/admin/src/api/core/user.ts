import type { UserInfo } from "@vben/types";

import { requestClient } from "#/api/request";

export interface UserRoleSummary {
  id: number;
  name: string;
}

export interface UserListItem {
  id: number;
  username: string;
  createdAt: string;
  profile: { realName: string; nickname: string } | null;
  roles: UserRoleSummary[];
}

export interface UserListParams {
  currentPage?: number;
  pageSize?: number;
  keyword?: string;
  roleId?: number;
  createdAtStart?: string;
  createdAtEnd?: string;
}

export interface UpdateUserData {
  realName?: string;
  nickname?: string;
  roleIds?: number[];
}

/** 获取当前用户信息。 */
export function getUserInfoApi() {
  return requestClient.get<UserInfo>("/user/info");
}

/** 按关键词、角色和创建时间查询用户列表。 */
export function getUserListApi(params: UserListParams) {
  return requestClient.get("/user", { params });
}

/** 更新用户资料和角色。 */
export function updateUserApi(id: number, data: UpdateUserData) {
  return requestClient.request(`/user/${id}`, { method: "PATCH", data });
}
