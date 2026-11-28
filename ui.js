import {
  assess,
  buildPrompt,
  grayValue,
  luminance,
  studies,
} from "./studio.js";
const buildId = __STUDIO_BUILD_ID__;
const attempts = [];
let preparedCoach;
const byId = (id) => document.getElementById(id);
const environment = () => ({ origin: location.origin, userAgent: navigator.userAgent, secureContext: isSecureContext });
const failureCode = (error) => typeof error?.code === "string" && /^[a-z\d/_-]{1,100}$/i.test(error.code) ? error.code : "unclassified";
const failureDetail = (error) => String(error?.message ?? "No error detail reported.")
  .replace(/AIza[\w-]+/g, "[public web setting omitted]")
  .replace(/eyJ[\w.-]{30,}/g, "[authentication data omitted]")
  .replace(/[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}/gi, "[identifier omitted]")
  .replace(/https?:\/\/[^\s"')]+/g, "[request URL omitted]").slice(0, 1200);
const evidencePayload = () => ({ schema: "value-study-studio.inference-evidence.v1", buildId, true_rsi: false, true_agi: false, evidenceClass: "BROWSER_OBSERVATIONS_REQUIRING_REVIEW", attempts });
function recordAttempt(attempt) {
  attempts.push(attempt);
  byId("export").disabled = false;
  byId("copy-evidence").disabled = false;
  byId("evidence").textContent = attempts.map((entry) => `${entry.startedAt} · ${entry.requestedMode} · ${entry.status} · SDK source: ${entry.sdkRoute ?? "unreported"}${entry.failureCode ? " · " + entry.failureCode : ""}`).join("\n");
  byId("evidence-json").textContent = JSON.stringify(evidencePayload(), null, 2);
}
let active = 0,
  guess = [],
  generation = 0;
function render() {
  generation++;
  preparedCoach = undefined;
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
  byId("prepare").disabled = false;
  byId("mode").disabled = false;
  byId("ask").disabled = true;
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
byId("mode").onchange = () => {
  preparedCoach = undefined;
  byId("ask").disabled = true;
  byId("advice").textContent = "Prepare the coach for the selected mode.";
};
byId("prepare").onclick = async () => {
  const version = generation;
  const mode = byId("mode").value;
  const startedAt = new Date().toISOString();
  const palette = studies[active].name;
  preparedCoach = undefined;
  byId("prepare").disabled = true;
  byId("mode").disabled = true;
  byId("ask").disabled = true;
  byId("advice").textContent = "Preparing the AI coach…";
  try {
    const { prepareCoach } = await import("./coach.js");
    const generate = await prepareCoach(mode);
    if (version === generation) {
      preparedCoach = { mode, generate };
      byId("ask").disabled = false;
      byId("advice").textContent = "Coach prepared. Click Get a painting exercise to run inference.";
    }
  } catch (error) {
    recordAttempt({ stage: "preparation", requestedMode: mode, startedAt, finishedAt: new Date().toISOString(), buildId, palette,
      status: "preparation_failed", sdkRoute: null, failureCode: failureCode(error), failureDetail: failureDetail(error), environment: environment(), true_rsi: false, true_agi: false });
    if (version === generation)
      byId("advice").textContent = "Coach setup unavailable. " + failureDetail(error);
  } finally {
    if (version === generation) {
      byId("prepare").disabled = false;
      byId("mode").disabled = false;
    }
  }
};
byId("ask").onclick = async () => {
  if (!preparedCoach) return;
  const version = generation;
  const { mode, generate } = preparedCoach;
  const prompt = buildPrompt(studies[active], guess);
  const started = performance.now();
  const attempt = {
    requestedMode: mode, startedAt: new Date().toISOString(), buildId,
    palette: studies[active].name, guess: [...guess], prompt,
    stage: "inference", environment: environment(),
    true_rsi: false, true_agi: false,
  };
  byId("ask").disabled = true;
  byId("prepare").disabled = true;
  byId("mode").disabled = true;
  byId("advice").textContent = "Requesting an exercise…";
  try {
    const answer = await generate(prompt, (event) => {
      if (version !== generation) return;
      if (event.stage === "model_download" && Number.isFinite(event.progress))
        byId("advice").textContent = `Downloading the on-device model: ${Math.round(event.progress * 100)}%.`;
      else byId("advice").textContent = event.stage === "device_initialization" ? "Initializing the on-device model. A first download can take several minutes…" : "Generating the painting exercise…";
    });
    Object.assign(attempt, { status: "response_received", sdkRoute: answer.route, message: answer.message });
    if (version === generation)
      byId("advice").textContent =
        answer.message +
        " · SDK inference source: " +
        (answer.route ?? "unreported");
  } catch (error) {
    Object.assign(attempt, { status: "failed", sdkRoute: null, failureCode: failureCode(error), failureDetail: failureDetail(error) });
    if (version === generation)
      byId("advice").textContent = "Coach unavailable. " + failureDetail(error);
  } finally {
    Object.assign(attempt, { finishedAt: new Date().toISOString(), elapsedMs: Math.round(performance.now() - started), shownForCurrentPalette: version === generation });
    recordAttempt(attempt);
    if (version === generation) {
      byId("ask").disabled = false;
      byId("prepare").disabled = false;
      byId("mode").disabled = false;
    }
  }
};
byId("export").onclick = () => {
  const payload = evidencePayload();
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "value-study-studio-inference-evidence.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
byId("copy-evidence").onclick = async () => {
  await navigator.clipboard.writeText(JSON.stringify(evidencePayload(), null, 2));
};
byId("device-check").onclick = async () => {
  const result = { ...environment(), checkedAt: new Date().toISOString(), promptApiExposed: typeof window.LanguageModel !== "undefined" };
  byId("device-status").textContent = "Checking the browser's supported Prompt API…";
  try {
    if (result.promptApiExposed) result.availability = await window.LanguageModel.availability();
    else result.availability = "API_NOT_EXPOSED";
  } catch (error) {
    result.failureCode = failureCode(error);
    result.failureDetail = failureDetail(error);
  }
  byId("device-status").textContent = JSON.stringify(result, null, 2);
};
render();
