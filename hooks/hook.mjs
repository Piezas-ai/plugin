// Piezas plugin hook entry, for Claude Code and Codex.
//
// The host sends one lifecycle event as JSON on stdin (SessionStart,
// UserPromptSubmit, Stop). This file passes it to the Piezas hook entry
// (runHookEntry in ../vendor/hookentry.js, the same code a project's own hooks
// run) and prints the answer.
//
// What it can answer, and nothing else:
//   - PreToolUse is NOT handled here: it runs hooks/pre-tool-use.mjs, which
//     never writes stdout. If it is sent here anyway, any permission decision
//     is dropped, so this file can never approve a tool call.
//   - SessionStart / UserPromptSubmit: plain-language context for the AI, or a
//     refusal of a message that contains a secret ({ decision: "block" }).
//   - Stop: at most one hold for a broken never-rule ({ decision: "block" }).
//
// These events only add context or hold a turn, so a failure here (bad input,
// a crash in the checks) must not stop the user's session: it exits 0 with a
// short note on stderr, never with an uncaught error. PreToolUse, which must
// fail closed, has its own entry (pre-tool-use.mjs).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let payload = null;
try {
  payload = JSON.parse(readFileSync(0, 'utf-8'));
} catch {
  process.exit(0); // not a hook event: do nothing
}

let out;
try {
  const { runHookEntry } = await import('../vendor/hookentry.js');
  out = await runHookEntry(payload, {
    entry: 'plugin',
    kind: 'context',
    rulesDir: join(pluginRoot, 'rules'),
    cliPath: join(pluginRoot, 'vendor', 'piezas.mjs'),
  });
} catch (error) {
  process.stderr.write(`piezas hook: ${error?.message || error}\n`);
  process.exit(0);
}

if (out?.stdout) process.stdout.write(`${out.stdout}\n`);
if (out?.stderr) process.stderr.write(`${out.stderr}\n`);
process.exit(out?.code === 2 ? 2 : 0);
