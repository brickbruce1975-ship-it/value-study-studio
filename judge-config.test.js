import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateJudgeConfig } from "./judge-config.js";
// Deliberately synthetic shape fixtures. Never supplied to a Firebase client.
const valid = () => ({ firebaseConfig: { apiKey: "synthetic-web-setting", projectId: "synthetic-project", appId: "synthetic-app" }, appCheckSiteKey: "synthetic-site-setting" });
test("public web configuration is accepted without requiring unrelated optional settings", () => {
  assert.deepEqual(validateJudgeConfig(valid()), valid());
});
test("unfilled template and missing settings fail before Firebase initialization", () => {
  assert.throws(() => validateJudgeConfig(JSON.parse(readFileSync(new URL("./judge-config.example.json", import.meta.url)))));
  for (const v of [null, [], {}, { ...valid(), appCheckSiteKey: "" }, { ...valid(), firebaseConfig: {} }]) assert.throws(() => validateJudgeConfig(v));
});
test("service credentials and debug tokens cannot enter the public configuration", () => {
  for (const v of [{ ...valid(), private_key: "synthetic" }, { ...valid(), debugToken: "synthetic" }, { ...valid(), firebaseConfig: { ...valid().firebaseConfig, client_email: "synthetic" } }]) assert.throws(() => validateJudgeConfig(v));
});
