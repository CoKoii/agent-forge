<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

import { Page, useVbenDrawer, useVbenModal } from "@vben/common-ui";
import { IconifyIcon } from "@vben/icons";
import { Button, Input, Popconfirm, Popover, Tag } from "antdv-next";

import { deleteRoleApi, getRoleApi, getRoleListApi } from "#/api/core/role";
import { getUserApi } from "#/api/core/user";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { createGridOptions, searchFormOptions } from "./config";
import RolePermission from "./modules/role-permission.vue";
import RoleForm from "./modules/role-form.vue";
import UserForm from "./modules/user-form.vue";

const roleOptions = ref<any[]>([]);
const openRoleMenuId = ref<number>();
const TAG_COLORS = [
  "#1677ff",
  "#13c2c2",
  "#52c41a",
  "#faad14",
  "#fa541c",
  "#eb2f96",
  "#722ed1",
  "#2f54eb",
];
const roleTagColor = (name: string) =>
  [...name].reduce((hash, char) => (hash * 31 + char.codePointAt(0)!) >>> 0, 0) % TAG_COLORS.length;

const selectedRoleId = ref<number>();
const roleTreeKeyword = ref("");
const filteredRoles = computed(() => {
  const keyword = roleTreeKeyword.value.trim().toLocaleLowerCase();
  return roleOptions.value.filter(({ label }) => label.toLocaleLowerCase().includes(keyword));
});
const [Grid, gridApi] = useVbenVxeGrid({
  tableTitle: "用户列表",
  formOptions: searchFormOptions,
  gridOptions: createGridOptions(() => selectedRoleId.value),
});
const [RoleFormModal, roleModalApi] = useVbenModal({
  connectedComponent: RoleForm,
  fullscreenButton: false,
});
const [RolePermissionDrawer, rolePermissionDrawerApi] = useVbenDrawer({
  connectedComponent: RolePermission,
});
const [UserFormModal, userModalApi] = useVbenModal({
  connectedComponent: UserForm,
  fullscreenButton: false,
});

async function loadRoleOptions() {
  try {
    const roles = await getRoleListApi();
    roleOptions.value = roles.map(({ code, id, name, permissions }: any) => ({
      code,
      label: name,
      permissions,
      value: id,
    }));
  } catch {
    // The request interceptor reports API errors.
  }
}

function selectRole(role?: any) {
  if (selectedRoleId.value === role?.value) return;
  selectedRoleId.value = role?.value;
  void gridApi.reload();
}

function toggleRoleMenu({ value }: any, open: boolean) {
  openRoleMenuId.value = open ? value : undefined;
}

async function editUser(user: any) {
  userModalApi.setData(await getUserApi(user.id)).open();
}

async function editRole(role: any) {
  openRoleMenuId.value = undefined;
  const detail = await getRoleApi(role.value);
  roleModalApi.setData({ ...detail, id: role.value }).open();
}

async function editPermissions(role: any) {
  openRoleMenuId.value = undefined;
  rolePermissionDrawerApi.setData(await getRoleApi(role.value)).open();
}

async function deleteRole({ value }: any) {
  openRoleMenuId.value = undefined;
  try {
    await deleteRoleApi(value);
    if (selectedRoleId.value === value) {
      selectedRoleId.value = undefined;
      await gridApi.reload();
    }
    await loadRoleOptions();
  } catch {
    // The request interceptor reports API errors.
  }
}

onMounted(loadRoleOptions);
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full min-h-0 flex-col gap-4 md:flex-row">
      <aside
        class="max-h-[40vh] w-full shrink-0 overflow-auto rounded-md bg-card p-3 md:h-full md:max-h-none md:w-72"
      >
        <div class="mb-2 flex flex-nowrap items-center gap-2">
          <span class="shrink-0 font-medium">角色</span>
          <Input
            v-model:value="roleTreeKeyword"
            allow-clear
            class="w-0 min-w-0 flex-1"
            placeholder="搜索角色名称"
          />
          <Button
            class="shrink-0 whitespace-nowrap"
            type="primary"
            @click="roleModalApi.setData(null).open()"
          >
            新增
          </Button>
        </div>
        <div class="space-y-1">
          <div
            class="flex h-8 cursor-pointer items-center rounded px-2 hover:bg-accent"
            :class="{ 'bg-accent': !selectedRoleId }"
            @click="selectRole()"
          >
            全部角色
          </div>
          <div
            v-for="role in filteredRoles"
            :key="role.value"
            class="flex h-8 cursor-pointer items-center justify-between rounded px-2 hover:bg-accent"
            :class="{ 'bg-accent': role.value === selectedRoleId }"
            @click="selectRole(role)"
          >
            <span class="truncate">{{ role.label }}</span>
            <Popover
              :open="openRoleMenuId === role.value"
              placement="rightTop"
              trigger="click"
              @click.stop
              @open-change="(open) => toggleRoleMenu(role, open)"
            >
              <Button aria-label="更多" size="small" type="text">
                <IconifyIcon class="size-4" icon="lucide:ellipsis-vertical" />
              </Button>
              <template #content>
                <div class="flex flex-col items-start">
                  <Button type="link" @click="editRole(role)">编辑</Button>
                  <Button type="link" @click="editPermissions(role)">权限</Button>
                  <Popconfirm title="确认删除该角色？" @confirm="deleteRole(role)">
                    <Button danger type="link">删除</Button>
                  </Popconfirm>
                </div>
              </template>
            </Popover>
          </div>
        </div>
      </aside>
      <div class="min-h-0 min-w-0 flex-1">
        <Grid>
          <template #roles="{ row }">
            <Tag
              v-for="role in row.roles"
              :key="role.id"
              class="mr-1"
              :color="TAG_COLORS[roleTagColor(role.name)]"
            >
              {{ role.name }}
            </Tag>
          </template>
          <template #actions="{ row }">
            <Button size="small" type="link" @click="editUser(row)">编辑</Button>
          </template>
        </Grid>
      </div>
    </div>

    <RoleFormModal @saved="loadRoleOptions" />
    <RolePermissionDrawer @saved="loadRoleOptions" />
    <UserFormModal :role-options="roleOptions" @saved="gridApi.reload()" />
  </Page>
</template>
