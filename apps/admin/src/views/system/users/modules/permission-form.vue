<script setup lang="ts">
import { ref, watch } from "vue";

import { useVbenModal } from "@vben/common-ui";

import {
  createPermissionApi,
  getPermissionListApi,
  updatePermissionApi,
} from "#/api/core/permission";
import { useVbenForm } from "#/adapter/form";

const editing = ref(false);
const emit = defineEmits(["saved"]);

function buildPermissionTree(items: any[]) {
  const nodes = new Map(
    items.map((permission) => [
      permission.id,
      { ...permission, children: [], title: permission.name, value: permission.id },
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

function availableParents(items: any[], id?: any) {
  if (!id) return items;
  const excluded = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const permission of items) {
      if (
        permission.parentId != null &&
        excluded.has(permission.parentId) &&
        !excluded.has(permission.id)
      ) {
        excluded.add(permission.id);
        changed = true;
      }
    }
  }
  return items.filter(({ id }) => !excluded.has(id));
}
const [Form, formApi] = useVbenForm<any>({
  commonConfig: { componentProps: { class: "w-full" } },
  layout: "vertical",
  schema: [
    { component: "Input", fieldName: "code", label: "权限码", rules: "required" },
    { component: "Input", fieldName: "name", label: "权限名称", rules: "required" },
    {
      component: "TreeSelect",
      componentProps: { allowClear: true, treeData: [], treeDefaultExpandAll: true },
      fieldName: "parentId",
      label: "上一级",
    },
  ],
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal({
  confirmText: "确定",
  fullscreenButton: false,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const permission = modalApi.getData();
    const saved = editing.value
      ? await updatePermissionApi(permission.id, values)
      : await createPermissionApi(values);
    emit("saved", saved);
    await modalApi.close();
  },
  title: "权限码",
});

const isOpen = modalApi.useStore((state) => state.isOpen);
watch(isOpen, async (open) => {
  if (!open) return;
  const permission = modalApi.getData();
  editing.value = Boolean(permission);
  formApi.updateSchema([{ componentProps: { disabled: editing.value }, fieldName: "code" }]);
  formApi.reset();
  if (permission) formApi.setValues(permission);
  const permissions = await getPermissionListApi();
  formApi.updateSchema([
    {
      componentProps: {
        allowClear: true,
        treeData: buildPermissionTree(availableParents(permissions, permission?.id)),
        treeDefaultExpandAll: true,
      },
      fieldName: "parentId",
    },
  ]);
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
