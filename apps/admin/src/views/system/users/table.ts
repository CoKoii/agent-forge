import { getUserListApi } from "#/api/core/user";

export const formOptions: any = {
  fieldMappingTime: [["createdAtRange", ["createdAtStart", "createdAtEnd"], null]],
  schema: [
    {
      component: "Input",
      fieldName: "keyword",
      label: "关键词",
      componentProps: { placeholder: "搜索用户名、姓名或昵称" },
    },
    {
      component: "RangePicker",
      fieldName: "createdAtRange",
      label: "创建时间",
      componentProps: {
        allowClear: true,
        placeholder: ["开始时间", "结束时间"],
        showTime: true,
        valueFormat: "YYYY-MM-DDTHH:mm:ssZ",
      },
    },
  ],
  showCollapseButton: true,
  submitOnChange: false,
  submitOnEnter: true,
};

export const gridOptions: any = {
  columns: [
    { title: "序号", type: "seq", width: 50 },
    { field: "username", title: "账号" },
    { field: "profile.realName", title: "姓名" },
    { field: "profile.nickname", title: "昵称" },
    {
      field: "roles",
      title: "角色",
      formatter: ({ cellValue }: any) => cellValue?.map(({ name }: any) => name).join("、") ?? "",
    },
    { field: "createdAt", title: "创建时间", formatter: "formatDateTime" },
  ],
  exportConfig: {},
  height: "auto",
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: ({ page }: any, formValues: any) => {
        const { total: _total, ...pagination } = page;
        return getUserListApi({ ...pagination, ...formValues });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    resizable: true,
    search: true,
    zoom: true,
  },
};
