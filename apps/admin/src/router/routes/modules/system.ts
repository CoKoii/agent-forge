import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: "lucide:settings-2",
      order: 10,
      title: "系统管理",
    },
    name: "SystemManagement",
    path: "/system",
    children: [
      {
        name: "SystemUsers",
        path: "users",
        component: () => import("#/views/system/users/index.vue"),
        meta: {
          icon: "lucide:users",
          title: "用户管理",
        },
      },
    ],
  },
];

export default routes;
