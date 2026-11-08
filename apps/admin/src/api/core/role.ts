import { requestClient } from "#/api/request";

export interface RoleOption {
  id: number;
  name: string;
}

export interface CreateRoleData {
  code: string;
  name: string;
}

/** 获取角色列表。 */
export function getRoleListApi() {
  return requestClient.get("/roles");
}

/** 创建角色。 */
export function createRoleApi(data: CreateRoleData) {
  return requestClient.post<RoleOption>("/roles", data);
}
