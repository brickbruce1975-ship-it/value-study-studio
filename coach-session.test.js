import test from "node:test";
import assert from "node:assert/strict";
import { createCoachSession } from "./coach-session.js";

// Scripted SDK doubles verify control flow only. These are not inference receipts.
function fixture(route, { initFailure = false, message = "Synthetic unit-test text." } = {}) {
  const calls = [];
  return { calls, model: {
    async initializeDeviceModel() { calls.push("initialize"); if (initFailure) throw Error("unavailable"); },
    async generateContent(prompt) { calls.push(prompt); return { response: { inferenceSource: route, text: () => message } }; },
  } };
}
test("device-only initializes on the initiating call and returns the SDK route", async () => {
  const f = fixture("ON_DEVICE");
  const promise = createCoachSession(f.model, "device")("prompt");
  assert.deepEqual(f.calls, ["initialize"]);
  assert.deepEqual(await promise, { message: "Synthetic unit-test text.", route: "ON_DEVICE" });
});
test("device-only fails without requesting generation when initialization fails", async () => {
  const f = fixture("ON_DEVICE", { initFailure: true });
  await assert.rejects(createCoachSession(f.model, "device")("prompt"));
  assert.deepEqual(f.calls, ["initialize"]);
});
test("cloud-only does not initialize the device model", async () => {
  const f = fixture("IN_CLOUD");
  assert.equal((await createCoachSession(f.model, "cloud")("prompt")).route, "IN_CLOUD");
  assert.deepEqual(f.calls, ["prompt"]);
});
test("hybrid initializes device and preserves the route supplied by Firebase", async () => {
  for (const route of ["ON_DEVICE", "IN_CLOUD"]) {
    const f = fixture(route, { initFailure: route === "IN_CLOUD" });
    assert.equal((await createCoachSession(f.model, "hybrid")("prompt")).route, route);
    assert.deepEqual(f.calls, ["initialize", "prompt"]);
  }
});
test("strict route mismatch, missing SDK route and empty output cannot count as a result", async () => {
  for (const [mode, route] of [["device", "IN_CLOUD"], ["cloud", "ON_DEVICE"], ["hybrid", undefined]])
    await assert.rejects(createCoachSession(fixture(route).model, mode)("prompt"));
  await assert.rejects(createCoachSession(fixture("IN_CLOUD", { message: " " }).model, "cloud")("prompt"));
  assert.throws(() => createCoachSession({}, "unknown"));
});
