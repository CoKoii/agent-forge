import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
  },
});
