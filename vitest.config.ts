import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config propia (sin los plugins de TanStack Start): el motor y la API se prueban en Node puro.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
