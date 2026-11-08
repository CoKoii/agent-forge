import type { VbenRouteMeta } from "./vue-router";

declare module "vue-router" {
  // oxlint-disable-next-line typescript/no-empty-object-type
  interface RouteMeta extends VbenRouteMeta {}
}

export type * from "./app";
export type * from "./basic";
export type * from "./helper";
export type * from "./languages";
export type * from "./menu-record";
export type * from "./tabs";
export type * from "./vue-router";
