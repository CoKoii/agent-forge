import { requestClient } from "#/api/request";

export interface RoleOption {
  code: string;
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

export function getRoleApi(id: number) {
  return requestClient.get<RoleOption & { permissions?: unknown[] }>(`/roles/${id}`);
}
/** 创建角色。 */
export function createRoleApi(data: CreateRoleData) {
  return requestClient.post<RoleOption>("/roles", data);
}

/** 更新角色。 */
export function updateRoleApi(id: number, data: Partial<CreateRoleData> & { permissionIds?: number[] }) {
  return requestClient.request<RoleOption>(`/roles/${id}`, { method: "PATCH", data });
}

/** 删除角色。 */
export function deleteRoleApi(id: number) {
  return requestClient.request(`/roles/${id}`, { method: "DELETE" });
}
