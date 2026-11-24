// The sRGB transfer curve is nonlinear. Equal RGB averages need not have equal lightness.
export function luminance(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex))
    throw new Error("Expected a six-digit hex color.");
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((pair) => {
      const s = parseInt(pair, 16) / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function grayValue(hex) {
  const y = luminance(hex);
  const srgb = y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
  const channel = Math.round(255 * srgb)
    .toString(16)
    .padStart(2, "0");
  return "#" + channel.repeat(3);
}

export const studies = [
  {
    name: "The night market",
    colors: [
      ["Lantern", "#E7A64F"],
      ["Plum", "#613254"],
      ["Canopy", "#638675"],
    ],
  },
  {
    name: "Backstage",
    colors: [
      ["Curtain", "#A23C4A"],
      ["Chalk", "#EFF0DF"],
      ["Wing", "#283653"],
    ],
  },
  {
    name: "After the rain",
    colors: [
      ["Pavement", "#5F6770"],
      ["Puddle", "#7199A1"],
      ["Reflection", "#DFC785"],
    ],
  },
  {
    name: "Paint box",
    colors: [
      ["Cobalt", "#4561BD"],
      ["Cadmium", "#BF4E37"],
      ["Leaf", "#658C44"],
    ],
  },
];

export function assess(study, guess) {
  if (
    guess.length !== 3 ||
    new Set(guess).size !== 3 ||
    guess.some((i) => !Number.isInteger(i) || !study.colors[i])
  )
    throw new Error("Choose all three different swatches.");
  const expected = study.colors
    .map(([, hex], i) => ({ i, y: luminance(hex) }))
    .sort((a, b) => a.y - b.y)
    .map((x) => x.i);
  const correct = guess.every((v, i) => v === expected[i]);
  const reversal = guess
    .flatMap((v, i) => guess.slice(i + 1).map((w) => [v, w]))
    .find(([v, w]) => expected.indexOf(v) > expected.indexOf(w));
  return { expected, correct, reversal };
}

export function buildPrompt(study, guess) {
  const { expected, reversal } = assess(study, guess);
  const asNames = (ids) => ids.map((i) => study.colors[i][0]).join(" → ");
  const pairs = study.colors
    .map(([name, hex]) => name + " " + hex + " Y=" + luminance(hex).toFixed(3))
    .join(", ");
  return (
    "You are an art teacher. Give one concrete paint-mixing exercise in two short sentences. " +
    "Use these computed sRGB relative luminances as ground truth. Do not guess a score or diagnosis. " +
    "Palette: " +
    pairs +
    ". Learner ordered darkest to lightest: " +
    asNames(guess) +
    ". Measured order: " +
    asNames(expected) +
    ". Focus on " +
    (reversal
      ? asNames(reversal)
      : "preserving this order while changing hue") +
    "."
  );
}
