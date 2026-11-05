// Piezas plugin: the PreToolUse check, for Claude Code and Codex.
//
// This file never writes to stdout, so it cannot approve a tool call. It ends
// in one of two ways:
//   - exit 0, silent: the host's normal permission flow decides;
//   - exit 2, with the reason on stderr: the tool call is refused, and the
//     reason is shown to the AI so it can do the work the Piezas way.
//
// The check itself is runHookEntry in ../vendor/hookentry.js (the same code a
// project's own hooks run). It fails closed: if the event cannot be read or
// the check cannot run (bad input, a crash, an answer it cannot read), the
// step is refused with a short reason. Exit 1 (an uncaught error) would count
// as non-blocking in both hosts and let the tool run unchecked, so every path
// below ends in 0 or 2. Only an event that is plainly not a PreToolUse exits 0.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FAILED = 'Piezas check could not run; refusing this step. (For the AI: run `npx piezas doctor` to see why.)';

let code = 2;
let reason = FAILED;
try {
  const payload = JSON.parse(readFileSync(0, 'utf-8'));
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const { runHookEntry } = await import('../vendor/hookentry.js');
  const out = await runHookEntry(payload, {
    entry: 'plugin',
    kind: 'pre-tool-use',
    rulesDir: join(pluginRoot, 'rules'),
    cliPath: join(pluginRoot, 'vendor', 'piezas.mjs'),
  });
  if (out?.code === 0) code = 0;
  else reason = String(out?.stderr || '').trim() || FAILED;
} catch {
  code = 2;
  reason = FAILED;
}
if (code === 0) process.exit(0);
process.stderr.write(`${reason}\n`);
process.exit(2);
