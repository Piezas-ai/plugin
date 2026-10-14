// Piezas plugin hook entry, for Claude Code and Codex.
//
// The host sends one lifecycle event as JSON on stdin (SessionStart,
// UserPromptSubmit, PreToolUse, Stop). This file passes it to the Piezas checks
// (phaseHook in ../vendor/hooks.js) and prints the answer.
//
// What it can answer, and nothing else:
//   - PreToolUse is NOT handled here: it runs hooks/pre-tool-use.mjs, which
//     never writes to stdout. If it is sent here anyway, any permission
//     decision is dropped below, so this file can never approve a tool call.
//   - SessionStart / UserPromptSubmit: plain-language context for the AI, or a
//     refusal of a message that contains a secret ({ decision: "block" }).
//   - Stop: at most one hold for a broken never-rule ({ decision: "block" }).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { phaseHook } from '../vendor/hooks.js';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let payload = null;
try {
  payload = JSON.parse(readFileSync(0, 'utf-8'));
} catch {
  process.exit(0); // not a hook event: do nothing
}

const out = await phaseHook(payload, {
  rulesDir: join(pluginRoot, 'rules'),
  cliPath: join(pluginRoot, 'vendor', 'piezas.mjs'),
});

let stdout = out.stdout || '';
if (stdout) {
  // Defense in depth: this hook only ever refuses. Drop any decision other than
  // "deny" so it can never approve a tool call on the user's behalf.
  try {
    const answer = JSON.parse(stdout);
    const decision = answer?.hookSpecificOutput?.permissionDecision;
    if (decision !== undefined) {
      delete answer.hookSpecificOutput.permissionDecision;
      delete answer.hookSpecificOutput.permissionDecisionReason;
      stdout = JSON.stringify(answer);
    }
  } catch {
    stdout = '';
  }
}
if (stdout) process.stdout.write(`${stdout}\n`);
if (out.stderr) process.stderr.write(`${out.stderr}\n`);
process.exit(out.exitCode === 2 ? 2 : 0);
