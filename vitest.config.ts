import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Match the "@/*" alias used across src so tests import the same way.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // The tested modules (validation, submit, format) are pure TS — no DOM needed.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
