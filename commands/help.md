---
description: Build an escalation bundle to send to Piezas support
---

The user is stuck, or wants a human to take over. The handoff *is* the project
state — no ticket, no context transfer. Gather it and hand it to them.

Run these (Bash) and keep the raw output:

1. `npx piezas phase status --json`
2. `npx piezas spec check`
3. `npx piezas spec coverage`
4. `npx piezas doctor` — include it only if the project is in `build` or `ship`.

Then print ONE fenced block the user can copy into an email to
support@piezas.ai, in exactly this shape:

```
PIEZAS ESCALATION
project: <directory name>
phase: <phase> (approvals: <gate@timestamp, or none>)
gate: <the gate they are stuck on>
blocking gaps:
<the gap lines, verbatim>
what we were doing: <one sentence>
what went wrong: <one or two sentences, plain language, no stack traces>
spec: SPEC.md (<n> requirements, <m> scenarios)
```

Rules for the bundle:

- Verbatim gap lines. The rule IDs (`SPEC04`, `COVERAGE`) are what an engineer
  reads first — do not paraphrase them.
- Never include `.env` contents, API keys, or anything matching `sk_live_` /
  `sk_test_`. If you catch one in the output, drop that line.
- Say what you tried in one sentence. No transcript.

Tell the user: the spec, the scenarios and the phase are the whole handoff, so an
engineer can pick this up cold. Transferring the driver's seat in-session (a
Piezas engineer joining the project directly) is not wired up yet — for now the
bundle goes to support and a human replies.
