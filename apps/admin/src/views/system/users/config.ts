import { getUserListApi } from "#/api/core/user";

export const searchFormOptions: any = {
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

export function userFormSchema(roleOptions: any[]): any[] {
  return [
    {
      component: "Input",
      componentProps: { readonly: true, maxlength: 50 },
      fieldName: "username",
      label: "账号",
    },
    {
      component: "Input",
      componentProps: { maxlength: 50 },
      fieldName: "realName",
      label: "姓名",
    },
    {
      component: "Input",
      componentProps: { maxlength: 50 },
      fieldName: "nickname",
      label: "昵称",
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        mode: "multiple",
        options: roleOptions,
        optionFilterProp: "label",
        placeholder: "搜索并选择角色名称",
        showSearch: true,
      },
      fieldName: "roleIds",
      label: "角色",
    },
  ];
}

export const roleFormSchema: any[] = [
  {
    component: "Input",
    componentProps: { maxlength: 100 },
    fieldName: "code",
    label: "角色编码",
    rules: "required",
  },
  {
    component: "Input",
    componentProps: { maxlength: 100 },
    fieldName: "name",
    label: "角色名称",
    rules: "required",
  },
];

export function createGridOptions(getRoleId: () => number | undefined): any {
  return {
    columns: [
      { title: "序号", type: "seq", width: 50 },
      { field: "username", title: "账号" },
      { field: "profile.realName", title: "姓名" },
      { field: "profile.nickname", title: "昵称" },
      {
        field: "roles",
        title: "角色",
        slots: { default: "roles" },
      },
      { field: "createdAt", title: "创建时间", formatter: "formatDateTime" },
      { field: "actions", title: "操作", slots: { default: "actions" } },
    ],
    exportConfig: {},
    height: "auto",
    keepSource: true,
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: ({ page }: any, { createdAtRange, ...formValues }: any) => {
          const params: any = {
            currentPage: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            roleId: getRoleId(),
          };
          if (createdAtRange?.length) {
            params.createdAtStart = createdAtRange[0];
            params.createdAtEnd = createdAtRange[1];
          }
          return getUserListApi(params);
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
}
