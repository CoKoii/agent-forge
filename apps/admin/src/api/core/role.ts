import { requestClient } from "#/api/request";

export function getRoleListApi() {
  return requestClient.get("/roles");
}

export function getRoleApi(id: number) {
  return requestClient.get(`/roles/${id}`);
}

export function createRoleApi(data: any) {
  return requestClient.post("/roles", data);
}

export function updateRoleApi(id: number, data: any) {
  return requestClient.request(`/roles/${id}`, { method: "PATCH", data });
}

export function deleteRoleApi(id: number) {
  return requestClient.request(`/roles/${id}`, { method: "DELETE" });
}
