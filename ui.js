import {
  assess,
  buildPrompt,
  grayValue,
  luminance,
  studies,
} from "./studio.js";
const byId = (id) => document.getElementById(id);
let active = 0,
  guess = [],
  generation = 0;
function render() {
  generation++;
  const study = studies[active],
    complete = guess.length === 3;
  byId("study").textContent = study.name;
  byId("swatches").replaceChildren(
    ...study.colors.map(([name, hex], i) => {
      const button = document.createElement("button"),
        chip = document.createElement("span"),
        caption = document.createElement("span");
      chip.className = "chip";
      chip.style.backgroundColor = hex;
      chip.setAttribute("aria-hidden", "true");
      const rank = guess.indexOf(i);
      button.className = "swatch";
      button.disabled = rank !== -1;
      caption.className = "caption";
      caption.textContent = (rank === -1 ? "" : rank + 1 + ". ") + name;
      button.append(chip, caption);
      button.onclick = () => {
        guess.push(i);
        render();
      };
      return button;
    })
  );
  byId("undo").disabled = !guess.length;
  byId("retry").disabled = !guess.length;
  byId("coaching").hidden = !complete;
  byId("ask").disabled = false;
  byId("advice").textContent = "";
  byId("reply").textContent = guess.length
    ? "Your order: " + guess.map((i) => study.colors[i][0]).join(" → ")
    : "Choose the darkest swatch first.";
  if (!complete) return;
  const { correct, expected, reversal } = assess(study, guess);
  byId("reply").textContent = correct
    ? "You found the measured order."
    : "Compare " +
      study.colors[reversal[0]][0] +
      " with " +
      study.colors[reversal[1]][0] +
      ". Their measured order is reversed.";
  byId("proof").replaceChildren(
    ...expected.map((i) => {
      const [name, hex] = study.colors[i];
      const patch = document.createElement("span");
      patch.style.backgroundColor = grayValue(hex);
      patch.title = name + " in grayscale";
      patch.setAttribute("aria-label", patch.title);
      return patch;
    })
  );
  byId("measured").textContent =
    "Measured from dark to light: " +
    expected
      .map(
        (i) =>
          study.colors[i][0] +
          " (" +
          luminance(study.colors[i][1]).toFixed(3) +
          ")"
      )
      .join(" → ") +
    ". Values use relative luminance from 0 to 1.";
}
byId("undo").onclick = () => {
  guess.pop();
  render();
};
byId("retry").onclick = () => {
  guess = [];
  render();
};
byId("next").onclick = () => {
  active = (active + 1) % studies.length;
  guess = [];
  render();
};
byId("ask").onclick = async () => {
  const version = generation;
  const mode = byId("mode").value;
  const prompt = buildPrompt(studies[active], guess);
  byId("ask").disabled = true;
  byId("advice").textContent = "Requesting an exercise…";
  try {
    const { coach } = await import("./coach.js");
    const answer = await coach(prompt, mode);
    if (version === generation)
      byId("advice").textContent =
        answer.message +
        " · SDK inference source: " +
        (answer.route ?? "unreported");
  } catch (error) {
    if (version === generation)
      byId("advice").textContent = "Coach unavailable. " + error.message;
  } finally {
    if (version === generation) byId("ask").disabled = false;
  }
};
render();
