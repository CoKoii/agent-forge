<script setup lang="ts">
import { ref, watch } from "vue";

import { message } from "antdv-next";
import { useVbenModal } from "@vben/common-ui";

import { createRoleApi } from "#/api/core/role";
import { useVbenForm } from "#/adapter/form";
import { roleFormSchema } from "../config";

const emit = defineEmits(["created"]);
const submitting = ref(false);
const [Form, formApi] = useVbenForm<any>({
  commonConfig: { componentProps: { class: "w-full" } },
  layout: "vertical",
  schema: roleFormSchema,
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
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
      const role = await createRoleApi({ code, name });
      message.success("角色创建成功");
      emit("created", role);
      formApi.reset();
      submitting.value = false;
      modalApi.unlock();
      await modalApi.close();
    } catch {
      // The request interceptor reports API errors.
    } finally {
      submitting.value = false;
      modalApi.unlock();
    }
  },
  title: "新增角色",
});

const isOpen = modalApi.useStore((state) => state.isOpen);
watch(isOpen, (open) => {
  if (open) formApi.reset();
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
