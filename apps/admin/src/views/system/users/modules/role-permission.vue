<script lang="ts" setup>
import { computed, ref } from "vue";

import { useVbenDrawer, useVbenModal } from "@vben/common-ui";
import { IconifyIcon } from "@vben/icons";
import { Button, Input, Popconfirm, Popover, Spin, Tree } from "antdv-next";

import { deletePermissionApi, getPermissionApi, getPermissionListApi } from "#/api/core/permission";
import { updateRoleApi } from "#/api/core/role";
import PermissionForm from "./permission-form.vue";

const role = ref<any>();
const emit = defineEmits(["saved"]);
const permissions = ref<any[]>([]);
const checkedIds = ref<number[]>([]);
const loading = ref(false);
const keyword = ref("");

function buildPermissionTree(items: any[]) {
  const nodes = new Map(
    items.map((permission) => [
      permission.id,
      { ...permission, children: [], title: permission.name },
    ]),
  );
  const roots: any[] = [];
  for (const permission of items) {
    const node: any = nodes.get(permission.id);
    const parent = permission.parentId == null ? undefined : nodes.get(permission.parentId);
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

const permissionTree = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  if (!value) return buildPermissionTree(permissions.value);
  const byId = new Map(permissions.value.map((permission) => [permission.id, permission]));
  const includedIds = new Set<number>();
  for (const permission of permissions.value) {
    if (!`${permission.code} ${permission.name}`.toLowerCase().includes(value)) continue;
    let current: any = permission;
    while (current && !includedIds.has(current.id)) {
      includedIds.add(current.id);
      current = current.parentId == null ? undefined : byId.get(current.parentId);
    }
  }
  return buildPermissionTree(permissions.value.filter(({ id }) => includedIds.has(id)));
});
const expandedKeys = computed(() => {
  const keys: number[] = [];
  const visit = (nodes: any[]) =>
    nodes.forEach((node) => {
      keys.push(node.id);
      visit(node.children);
    });
  visit(permissionTree.value);
  return keys;
});
const title = computed(() => `角色权限-${role.value?.label ?? ""}`);
const [PermissionModal, permissionModalApi] = useVbenModal({ connectedComponent: PermissionForm });

async function load() {
  loading.value = true;
  try {
    permissions.value = await getPermissionListApi();
    checkedIds.value = role.value?.permissions?.map(({ id }: any) => id) ?? [];
  } finally {
    loading.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  confirmText: "保存",
  async onConfirm() {
    await updateRoleApi(role.value.value, { permissionIds: checkedIds.value });
    emit("saved");
    drawerApi.close();
  },
  async onOpenChange(open) {
    if (!open) return;
    role.value = drawerApi.getData();
    keyword.value = "";
    await load();
  },
});

function togglePermission(id: number) {
  checkedIds.value = checkedIds.value.includes(id)
    ? checkedIds.value.filter((value) => value !== id)
    : [...checkedIds.value, id];
}

async function editPermission(permission: any) {
  permissionModalApi.setData(await getPermissionApi(permission.id)).open();
}

async function deletePermission(permission: any) {
  await deletePermissionApi(permission.id);
  permissions.value = permissions.value.filter(({ id }) => id !== permission.id);
  checkedIds.value = checkedIds.value.filter((id) => id !== permission.id);
}

function addPermission(permission: any) {
  const index = permissions.value.findIndex(({ id }) => id === permission.id);
  if (index < 0) {
    permissions.value = [permission, ...permissions.value];
    checkedIds.value.push(permission.id);
  } else permissions.value[index] = permission;
}

function createPermission() {
  permissionModalApi.open();
}
</script>

<template>
  <Drawer :title="title" class="w-[92vw] md:w-[560px]">
    <Spin :spinning="loading">
      <div class="flex items-center gap-2">
        <Input v-model:value="keyword" allow-clear class="flex-1" placeholder="搜索权限码" />
        <Button type="primary" @click="createPermission">新增</Button>
      </div>
      <Tree
        v-model:checked-keys="checkedIds"
        :expanded-keys="expandedKeys"
        :field-names="{ key: 'id', title: 'title', children: 'children' }"
        :tree-data="permissionTree"
        checkable
        class="permission-tree mt-4"
        default-expand-all
      >
        <template #titleRender="node">
          <span
            class="flex w-full min-w-0 items-center gap-2"
            @click.stop="togglePermission(node.id)"
          >
            <span class="min-w-0 flex-1 truncate">{{ node.name }}</span>
            <Popover placement="rightTop" trigger="click" @click.stop>
              <Button aria-label="更多" size="small" type="text">
                <IconifyIcon class="size-4" icon="lucide:ellipsis-vertical" />
              </Button>
              <template #content>
                <div class="flex flex-col items-start">
                  <Button type="link" @click.stop="editPermission(node)">编辑</Button>
                  <Popconfirm title="确认删除该权限？" @confirm="deletePermission(node)">
                    <Button danger type="link">删除</Button>
                  </Popconfirm>
                </div>
              </template>
            </Popover>
          </span>
        </template>
      </Tree>
    </Spin>
    <PermissionModal @saved="addPermission" />
  </Drawer>
</template>

<style scoped>
.permission-tree :deep(.ant-tree-treenode) {
  width: 100%;
}

.permission-tree :deep(.ant-tree-node-content-wrapper) {
  flex: 1;
  min-width: 0;
}
</style>
