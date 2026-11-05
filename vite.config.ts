import { defineConfig } from "vite-plus";

export default defineConfig({
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
  },
  test: {
    exclude: ["**/node_modules/**", "node_modules/**"],
    globals: true,
    include: ["**/*.test.ts", "**/*.spec.ts", "**/*.e2e-spec.ts"],
  },
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix",
  },
});
