<script lang="ts" setup>
import { Page } from "@vben/common-ui";

import { useVbenVxeGrid } from "#/adapter/vxe-table";

import { formOptions, gridOptions } from "./table";

const [Grid] = useVbenVxeGrid({ tableTitle: "角色列表", formOptions, gridOptions });
</script>

<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
