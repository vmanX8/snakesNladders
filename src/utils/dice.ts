// Emoji faces in order. `as const` keeps literal types.
export const diceValues = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"] as const;

export type DicePips = 1 | 2 | 3 | 4 | 5 | 6;

/** Convert a pip value (1–6) to its emoji face. */
export function getDiceFace(value: DicePips): string {
  return diceValues[value - 1];
}

/** Roll a fair six-sided die. You can pass a custom RNG for tests. */
export function rollDice(rng: () => number = Math.random): DicePips {
  const pip = Math.floor(rng() * 6) + 1;
  return pip as DicePips;
}

/** Generate a short animation sequence of dice values for UI. */
export function generateRollSequence(
  durationMs = 600,
  fps = 24,
  rng: () => number = Math.random
): DicePips[] {
  const frames = Math.max(1, Math.round((durationMs / 1000) * fps));
  const seq: DicePips[] = [];
  for (let i = 0; i < frames; i++) seq.push(rollDice(rng));
  // Ensure the final frame is the actual result
  const final = rollDice(rng);
  seq[seq.length - 1] = final;
  return seq;
}
