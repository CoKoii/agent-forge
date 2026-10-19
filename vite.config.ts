import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    overrides: [
      {
        files: ["apps/backend/**"],
        env: { node: true },
        rules: {
          "typescript/no-explicit-any": "off",
          "typescript/no-floating-promises": "error",
        },
      },
    ],
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    globals: true,
    include: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
  },
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix",
  },
});
