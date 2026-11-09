<script setup lang="ts">
import { ref, watch } from "vue";

import { message } from "antdv-next";
import { useVbenModal } from "@vben/common-ui";

import { createRoleApi, updateRoleApi } from "#/api/core/role";
import { useVbenForm } from "#/adapter/form";
import { roleFormSchema } from "../config";

const emit = defineEmits(["saved"]);
const editing = ref(false);
const submitting = ref(false);
const [Form, formApi] = useVbenForm<any>({
  commonConfig: { componentProps: { class: "w-full" } },
  layout: "vertical",
  schema: roleFormSchema,
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal<any>({
  confirmText: "确定",
  fullscreenButton: false,
  onBeforeClose: () => !submitting.value,
  onConfirm: async () => {
    if (submitting.value) return;
    submitting.value = true;
    modalApi.lock();
    try {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const { code, name } = await formApi.getValues();
      const role = modalApi.getData();
      await (editing.value ? updateRoleApi(role.id, { name }) : createRoleApi({ code, name }));
      message.success(`角色${editing.value ? "更新" : "创建"}成功`);
      emit("saved");
      await modalApi.close();
    } catch {
      // The request interceptor reports API errors.
    } finally {
      submitting.value = false;
      modalApi.unlock();
    }
  },
  title: "角色",
});

const isOpen = modalApi.useStore((state) => state.isOpen);
watch(isOpen, (open) => {
  if (!open) return;
  const role = modalApi.getData();
  editing.value = Boolean(role);
  formApi.updateSchema([
    { componentProps: { disabled: editing.value, maxlength: 100 }, fieldName: "code" },
  ]);
  formApi.reset();
  if (role) formApi.setValues(role);
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
