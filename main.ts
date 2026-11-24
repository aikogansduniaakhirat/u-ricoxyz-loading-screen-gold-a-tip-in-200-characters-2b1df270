/**
 * Loading Screen Gold — make.fun bounty entry (program/v1).
 *
 * Brief: one loading-screen tip, at most 200 characters, for stressed
 * developers and AI coding agents. Judged pairwise, most important first:
 * (1) it is really a loading-screen tip and not a slogan or a status line,
 * (2) it earns a real laugh from someone tired at a keyboard, through a turn
 * rather than a pun, (3) it lands in a glance on one short line, (4) it speaks
 * to the developer and to the agent at once so both feel it is about them,
 * (5) it is fresh — not the coffee, deadline or "compiling" joke everyone has
 * already read ten thousand times.
 *
 * The tip is built from its two halves here rather than pasted whole, because
 * criterion 4 is the one most entries miss: a tip aimed only at the developer
 * is a joke about the tool, and a tip aimed only at the agent is a joke about
 * the user. This one hands the same fault to both of them and lets the last
 * three words pay it off.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIN_CHARS = 1;
const MAX_CHARS = 200; // the bounty's published gate
const HARD_STOP = 180; // local budget: a loading screen has no room to scroll

/**
 * The tip's three parts, kept apart so each one can be argued with on its own:
 * the register (a tip must open like a tip), the fault shared by both parties,
 * and the turn that closes it.
 */
type Tip = {
  register: string;
  fault: string;
  turn: string;
};

/**
 * Criterion 5 rejects the worn subjects outright. These are diagnostics, not a
 * filter: the shipped line simply must not lean on any of them.
 */
const WORN = [
  "coffee",
  "deadline",
  "compiling",
  "compiler",
  "stack overflow",
  "have you tried",
  "restart",
  "rubber duck",
  "it works on my machine",
];

const TIP: Tip = {
  register: "Tip:",
  fault: "'done' means the agent stopped typing, 'definitely done' means it stopped reading, and you believe both",
  turn: "Open the file anyway.",
};

/**
 * Render the tip. The shape is deliberate: the register first, so it opens like
 * a tip and not a slogan; then the two-step distinction that is the joke (the
 * agent's two words for the same non-event, and the human who believes both);
 * then an imperative that hands the work back to the reader in four words.
 *
 * The full line: "Tip: 'done' means the agent stopped typing, 'definitely done'
 * means it stopped reading, and you believe both. Open the file anyway."
 *
 * Why it clears criterion 5: it is not a coffee, deadline or compile joke, and
 * it is not the generic "AI hallucinates" gag. The specific observation is the
 * escalation in the agent's own vocabulary — the more emphatic the claim, the
 * less reading behind it — which is recognisable to anyone who has asked an
 * agent to finish something twice.
 */
function render(t: Tip): string {
  return `${t.register} ${t.fault}. ${t.turn}`;
}

function refuse(reason: string): never {
  process.stderr.write(`refused: ${reason}\n`);
  process.exit(1);
}

/** Code points, the unit the site's gate counts. */
function chars(text: string): number {
  return Array.from(text).length;
}

function gate(text: string): void {
  const n = chars(text);

  if (n < MIN_CHARS || n > MAX_CHARS) {
    refuse(`${n} characters; the gate allows ${MIN_CHARS} to ${MAX_CHARS}`);
  }
  if (n > HARD_STOP) refuse(`${n} characters is over the local budget of ${HARD_STOP}`);
  if (text.trim().length === 0) refuse("white space only");
  if (text !== text.trim()) refuse("leading or trailing white space");
  if (/[\r\n]/.test(text)) refuse("more than one line; a loading screen shows one");

  const lower = text.toLowerCase();
  for (const worn of WORN) {
    if (lower.includes(worn)) refuse(`"${worn}" is a worn subject criterion 5 rejects`);
  }

  // Criterion 1: it must open like a loading-screen tip, not like a slogan.
  if (!/^tip:/i.test(text)) refuse("does not open as a tip");

  // Criterion 4: both parties must be addressed. The agent and the reader are
  // each named once; a tip that names only one of them loses that criterion.
  if (!/\bagent\b/i.test(text)) refuse("criteria 4: the agent is never addressed");
  if (!/\b(you|your)\b/i.test(text)) refuse("criteria 4: the reader is never addressed");

  if (/\bundefined\b|\bNaN\b|\[object Object\]/.test(text)) {
    refuse("template hole in the rendered tip");
  }
}

function main(): void {
  const text = render(TIP);
  gate(text);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  // No trailing newline: the Size column counts bytes, so every byte is budget.
  writeFileSync(outPath, text, "utf8");

  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== text) refuse("disk differs from the rendered tip");

  process.stderr.write(
    `wrote ${chars(onDisk)} characters / ${Buffer.byteLength(onDisk, "utf8")} bytes\n`,
  );
}

main();
