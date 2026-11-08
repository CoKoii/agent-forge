<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

import { message } from "antdv-next";
import { useVbenModal } from "@vben/common-ui";

import { updateUserApi } from "#/api/core/user";
import { useVbenForm } from "#/adapter/form";
import { userFormSchema } from "../config";

const props = defineProps({ roleOptions: { type: Array, default: () => [] } });
const emit = defineEmits(["saved"]);

const submitting = ref(false);
const [Form, formApi] = useVbenForm<any>(
  reactive({
    commonConfig: { componentProps: { class: "w-full" } },
    layout: "vertical",
    schema: computed(() => userFormSchema(props.roleOptions)),
    showDefaultActions: false,
  }),
);
const [Modal, modalApi] = useVbenModal<any>({
  closeOnClickModal: false,
  confirmText: "保存",
  fullscreenButton: false,
  onBeforeClose: () => !submitting.value,
  onConfirm: async () => {
    if (submitting.value) return;
    submitting.value = true;
    modalApi.lock();
    try {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const user = modalApi.getData();
      if (!user) return;
      const values = await formApi.getValues();
      const data = {
        realName: values.realName,
        nickname: values.nickname,
        roleIds: values.roleIds,
      };
      await updateUserApi(user.id, data);
      message.success("用户更新成功");
      emit("saved");
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
  title: "编辑用户",
});

const isOpen = modalApi.useStore((state) => state.isOpen);
watch(isOpen, (open) => {
  if (!open) {
    formApi.reset();
    return;
  }
  const user = modalApi.getData();
  if (!user) return;
  formApi.setValues({
    username: user.username,
    realName: user.profile?.realName ?? "",
    nickname: user.profile?.nickname ?? "",
    roleIds: user.roles.map(({ id }: any) => id),
  });
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
