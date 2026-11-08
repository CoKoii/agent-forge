<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

import { Button, Input, Tree } from "antdv-next";
import { Page, useVbenModal } from "@vben/common-ui";

import { getRoleListApi } from "#/api/core/role";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { createGridOptions, searchFormOptions } from "./config";
import RoleForm from "./modules/role-form.vue";
import UserForm from "./modules/user-form.vue";

const roleOptions = ref<any[]>([]);
const selectedRoleId = ref<number>();
const roleTreeKeyword = ref("");
const selectedKeys = computed(() => [selectedRoleId.value ?? "all"]);
const roleTreeData = computed<any[]>(() => {
  const keyword = roleTreeKeyword.value.trim().toLocaleLowerCase();
  const children = roleOptions.value
    .filter(({ label }) => label.toLocaleLowerCase().includes(keyword))
    .map(({ label, value }) => ({ key: value, title: label, isLeaf: true }));
  return [{ key: "all", title: "全部角色", children }];
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
const [UserFormModal, userModalApi] = useVbenModal({
  connectedComponent: UserForm,
  fullscreenButton: false,
});

async function loadRoleOptions() {
  try {
    const roles = await getRoleListApi();
    roleOptions.value = [
      ...new Map(
        [...roles.map(({ id, name }: any) => ({ label: name, value: id })), ...roleOptions.value].map(
          (role) => [role.value, role],
        ),
      ).values(),
    ];
  } catch {
    // The request interceptor reports API errors.
  }
}

function selectRole(_: any, { node }: any) {
  selectedRoleId.value = node.key === "all" ? undefined : node.key;
  void gridApi.reload();
}

function editUser(user: any) {
  userModalApi.setData(user).open();
}

function appendRole(role: any) {
  if (!roleOptions.value.some(({ value }) => value === role.id)) {
    roleOptions.value.push({ label: role.name, value: role.id });
  }
}

onMounted(loadRoleOptions);
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full min-h-0 flex-col gap-4 md:flex-row">
      <aside class="max-h-[40vh] w-full shrink-0 overflow-auto rounded-md bg-card p-3 md:h-full md:max-h-none md:w-72">
        <div class="mb-2 flex flex-nowrap items-center gap-2">
          <span class="shrink-0 font-medium">角色</span>
          <Input
            v-model:value="roleTreeKeyword"
            allow-clear
            class="w-0 min-w-0 flex-1"
            placeholder="搜索角色名称"
          />
          <Button class="shrink-0 whitespace-nowrap" type="primary" @click="roleModalApi.open()">
            新增
          </Button>
        </div>
        <Tree
          block-node
          default-expand-all
          :tree-data="roleTreeData"
          :selected-keys="selectedKeys"
          @select="selectRole"
        />
      </aside>
      <div class="min-h-0 min-w-0 flex-1">
        <Grid>
          <template #actions="{ row }">
            <Button size="small" type="link" @click="editUser(row)">编辑</Button>
          </template>
        </Grid>
      </div>
    </div>

    <RoleFormModal @created="appendRole" />
    <UserFormModal :role-options="roleOptions" @saved="gridApi.reload()" />
  </Page>
</template>
