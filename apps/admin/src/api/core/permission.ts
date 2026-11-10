import { requestClient } from "#/api/request";

export function getPermissionListApi() {
  return requestClient.get("/permissions");
}

export function getPermissionApi(id: number) {
  return requestClient.get(`/permissions/${id}`);
}

export function createPermissionApi(data: any) {
  return requestClient.post("/permissions", data);
}

export function updatePermissionApi(id: number, data: any) {
  return requestClient.request(`/permissions/${id}`, { method: "PATCH", data });
}

export function deletePermissionApi(id: number) {
  return requestClient.request(`/permissions/${id}`, { method: "DELETE" });
}
