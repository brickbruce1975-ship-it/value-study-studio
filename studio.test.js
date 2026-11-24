import test from "node:test";
import assert from "node:assert/strict";
import {
  grayValue,
  luminance,
  assess,
  buildPrompt,
  studies,
} from "./studio.js";
test("linear-light reference endpoints and green primary", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#ffffff"), 1);
  assert.equal(luminance("#00ff00"), 0.7152);
  assert.throws(() => luminance("white"));
});
test("each of the six orders earns exactly one correct result in every study", () => {
  for (const s of studies) {
    let correct = 0;
    for (const g of [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ]) {
      const a = assess(s, g);
      if (a.correct) correct++;
      else assert.ok(a.reversal);
    }
    assert.equal(correct, 1);
  }
});
test("partial and repeated answers cannot earn a result", () => {
  for (const g of [[1], [1, 1, 2], [3, 0, 1]])
    assert.throws(() => assess(studies[0], g));
});
test("the model receives both the actual guess and the computed reference", () => {
  const prompt = buildPrompt(studies[0], [0, 1, 2]);
  assert.match(prompt, /Lantern → Plum → Canopy/);
  assert.match(prompt, /Plum → Canopy → Lantern/);
});

test("grayscale proof preserves reference grays and the ordering used for scoring", () => {
  for (const gray of ["#000000", "#393939", "#808080", "#ffffff"])
    assert.equal(grayValue(gray), gray);
  for (const study of studies) {
    const measured = assess(study, [0, 1, 2]).expected.map((i) =>
      grayValue(study.colors[i][1])
    );
    assert.deepEqual(measured, [...measured].sort());
  }
});
