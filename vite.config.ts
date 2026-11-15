import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    overrides: [
      {
        files: ["apps/backend/**"],
        env: { node: true },
        rules: { "typescript/no-floating-promises": "error" },
      },
    ],
  },
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix",
  },
});
