import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/smoke.test.tsx"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
