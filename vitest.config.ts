import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      root: "./app/frontend",
      setupFiles: ["./test/setup.ts"],
      include: ["./**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        reportsDirectory: "../../tmp/coverage-frontend",
        include: ["**/*.{ts,tsx}"],
        exclude: ["test/**", "**/*.d.ts", "entrypoints/**"],
      },
    },
  })
);
