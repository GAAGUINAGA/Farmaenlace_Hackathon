// Build estático para Render (Static Site): activa el modo SPA en vite.config.ts y deja
// el sitio listo en dist/ (index.html + assets). Las rutas se resuelven con un rewrite a /index.html.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

fs.rmSync("dist", { recursive: true, force: true });

const result = spawnSync("npx vite build", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, FARMAPOS_STATIC_BUILD: "1" },
});
if (result.status !== 0) process.exit(result.status ?? 1);

// Vite deja dist/client (sitio) y dist/server (solo se usó para generar el shell).
fs.renameSync("dist/client", "dist-static");
fs.rmSync("dist", { recursive: true, force: true });
fs.renameSync("dist-static", "dist");

if (!fs.existsSync("dist/index.html")) {
  console.error("build:static: falta dist/index.html");
  process.exit(1);
}
console.log("build:static listo en dist/");
