import { describe, expect, it } from "vite-plus/test";

import { defaultPreferences } from "../src/config";

describe("defaultPreferences immutability test", () => {
  // 创建快照，确保默认配置对象不被修改
  it("should not modify the config object", () => {
    expect(defaultPreferences).toMatchSnapshot();
  });
});
