#!/usr/bin/env bash
# One hook launcher for Claude Code AND Codex.
#
# Both tools send the event as JSON on stdin and read the same contract back:
# exit 2 + stderr blocks a tool call; stdout JSON adds context. The launcher
# finds the plugin from its own location, so it does not depend on which
# plugin-root variable the host sets (CLAUDE_PLUGIN_ROOT vs PLUGIN_ROOT).
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT="$(cat)"
# Debugging aid: PIEZAS_HOOK_LOG=/path appends every raw event (never set in normal use).
if [ -n "${PIEZAS_HOOK_LOG:-}" ]; then printf '%s\n' "$INPUT" >> "$PIEZAS_HOOK_LOG"; fi

if ! command -v node >/dev/null 2>&1; then
  # Without Node nothing can be checked. Say so once, at session start, in
  # words the user can act on; stay out of the way on every other event.
  case "$INPUT" in
    *'"SessionStart"'*)
      printf '%s\n' '{"systemMessage":"Piezas needs Node.js to check your app as it is built. Install the LTS version from nodejs.org, then restart this app.","hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Node.js is not installed, so Piezas checks are OFF. Before building anything, ask the user to install Node.js (LTS) from nodejs.org and restart. Explain it in one plain sentence."}}'
      ;;
  esac
  exit 0
fi

printf '%s' "$INPUT" | node "$ROOT/vendor/piezas.mjs" phase hook \
  --rules-dir "$ROOT/rules" --cli "$ROOT/vendor/piezas.mjs"
