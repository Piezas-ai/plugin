// Piezas plugin: the PreToolUse check, for Claude Code and Codex.
//
// This file never writes to stdout, so it cannot approve a tool call. It ends
// in one of two ways:
//   - exit 0, silent: the host's normal permission flow decides;
//   - exit 2, with the reason on stderr: the tool call is refused, and the
//     reason is shown to the AI so it can do the work the Piezas way.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { phaseHook } from '../vendor/hooks.js';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let payload = null;
try {
  payload = JSON.parse(readFileSync(0, 'utf-8'));
} catch {
  process.exit(0);
}
if (payload?.hook_event_name !== 'PreToolUse') process.exit(0);

const out = await phaseHook(payload, {
  rulesDir: join(pluginRoot, 'rules'),
  cliPath: join(pluginRoot, 'vendor', 'piezas.mjs'),
});

let reason = '';
try {
  reason = JSON.parse(out.stdout || '{}')?.hookSpecificOutput?.permissionDecisionReason || '';
} catch {
  reason = '';
}
if (reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}
process.exit(0);
