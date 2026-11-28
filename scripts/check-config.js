import { readFileSync } from "node:fs";
import { validateJudgeConfig } from "../judge-config.js";
try {
  validateJudgeConfig(JSON.parse(readFileSync(new URL("../public/judge-config.json", import.meta.url), "utf8")));
  console.log("Public configuration shape: PASS. Firebase access and inference are not tested by this check.");
} catch {
  console.error("Configuration: BLOCKED. Copy judge-config.example.json to public/judge-config.json and fill only existing authorized public web settings.");
  process.exitCode = 2;
}
