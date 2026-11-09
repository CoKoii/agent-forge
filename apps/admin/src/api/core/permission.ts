import { requestClient } from "#/api/request";

export interface Permission {
  code: string;
  id: number;
  name: string;
  parentId?: number | null;
}

export function getPermissionListApi() {
  return requestClient.get<Permission[]>("/permissions");
}

export function getPermissionApi(id: number) {
  return requestClient.get<Permission>(`/permissions/${id}`);
}

export function createPermissionApi(data: Omit<Permission, "id">) {
  return requestClient.post<Permission>("/permissions", data);
}

export function updatePermissionApi(id: number, data: Partial<Omit<Permission, "id">>) {
  return requestClient.request<Permission>(`/permissions/${id}`, { method: "PATCH", data });
}

export function deletePermissionApi(id: number) {
  return requestClient.request(`/permissions/${id}`, { method: "DELETE" });
}
