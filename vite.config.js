import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const files = ["package-lock.json", "index.html", "ui.js", "studio.js", "studio.css", "coach.js", "coach-session.js", "judge-config.js", "vite.config.js"];
const hash = createHash("sha256");
for (const file of files) hash.update(file + "\0").update(readFileSync(new URL(file, import.meta.url))).update("\0");
export default defineConfig({ base: "./", define: { __STUDIO_BUILD_ID__: JSON.stringify(hash.digest("hex")) } });
