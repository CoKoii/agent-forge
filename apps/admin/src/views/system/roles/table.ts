const roleInfo: any = {
  admin: { name: "管理员", description: "拥有系统管理权限" },
  operator: { name: "运营", description: "负责日常运营与内容维护" },
  auditor: { name: "审计员", description: "查看操作记录与审计信息" },
  viewer: { name: "访客", description: "只读访问" },
};

const roleRows: any[] = [
  { id: 1, key: "admin", members: 2, status: "active" },
  { id: 2, key: "operator", members: 8, status: "active" },
  { id: 3, key: "auditor", members: 3, status: "active" },
  { id: 4, key: "viewer", members: 12, status: "disabled" },
].map((role) => ({
  ...role,
  ...roleInfo[role.key],
  statusText: role.status === "active" ? "启用" : "停用",
}));

export const formOptions: any = {
  collapsed: false,
  schema: [
    { component: "Input", fieldName: "keyword", label: "关键字" },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: [
          { label: "启用", value: "active" },
          { label: "停用", value: "disabled" },
        ],
      },
      fieldName: "status",
      label: "状态",
    },
  ],
  showCollapseButton: true,
  submitOnChange: true,
  submitOnEnter: true,
};

export const gridOptions: any = {
  checkboxConfig: { highlight: true, labelField: "name" },
  columns: [
    { title: "序号", type: "seq", width: 50 },
    { align: "left", title: "角色名称", type: "checkbox", width: 100 },
    { field: "key", title: "角色标识", minWidth: 120 },
    { field: "description", title: "描述", minWidth: 260 },
    { field: "members", title: "用户数", width: 110 },
    { field: "statusText", title: "状态", width: 110 },
  ],
  exportConfig: {},
  height: "auto",
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }: any, { keyword = "", status }: any) => {
        const search = keyword?.trim().toLowerCase() ?? "";
        const filtered = roleRows.filter(
          ({ name, key, description, status: rowStatus }: any) =>
            (!search || [name, key, description].join(" ").toLowerCase().includes(search)) &&
            (!status || rowStatus === status),
        );
        return {
          items: filtered.slice(
            (page.currentPage - 1) * page.pageSize,
            page.currentPage * page.pageSize,
          ),
          total: filtered.length,
        };
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
