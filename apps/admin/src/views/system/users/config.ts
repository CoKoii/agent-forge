import { getUserListApi } from "#/api/core/user";
import { z } from "#/adapter/form";

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
      componentProps: { disabled: true, maxlength: 50 },
      fieldName: "username",
      label: "账号",
    },
    {
      component: "Input",
      componentProps: { maxlength: 50 },
      fieldName: "realName",
      label: "姓名",
      rules: z.string().max(50, "姓名不能超过50个字符"),
    },
    {
      component: "Input",
      componentProps: { maxlength: 50 },
      fieldName: "nickname",
      label: "昵称",
      rules: z.string().max(50, "昵称不能超过50个字符"),
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
    rules: z.string().min(1, "请输入角色编码").max(100, "角色编码不能超过100个字符"),
  },
  {
    component: "Input",
    componentProps: { maxlength: 100 },
    fieldName: "name",
    label: "角色名称",
    rules: z.string().min(1, "请输入角色名称").max(100, "角色名称不能超过100个字符"),
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
        formatter: ({ cellValue }: any) =>
          (cellValue as any[] | undefined)?.map(({ name }) => name).join("、") ?? "",
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
