---
name: piezas-spec
description: Piezas spec mode — interview the user one question at a time and write SPEC.md before any code. Use when the user says /piezas-spec, "spec mode", or when a Piezas project needs its description written or changed.
---

# Piezas spec mode

This runs the same spec mode that `piezas init` installed in the project. Using
it through the plugin means it works straight away, even in the session where
the project was just initialized.

1. Read the project's spec-mode instructions and follow them. They are in
   `.claude/commands/piezas-spec.md`, or `.codex/prompts/piezas-spec.md` in
   Codex. They make `.piezas/spec-builder.md` the source of truth for the
   format of `SPEC.md`. If neither file exists, the project has not been
   initialized yet, so use the `piezas` skill to start it.
2. **Imported app** (the session context says it was imported): run
   `piezas import scan` and read the code. Draft the full description from what
   the app actually does, marking each requirement
   "(found in your code: `<file>`)". Then ask only about what the code cannot
   tell you, one question at a time. Skip step 3.
3. Otherwise, interview the way the `piezas-pm` skill describes:
   - Read their files first.
   - Propose a full draft.
   - Then ask only about what is wrong or missing, one question at a time.
4. Talk in plain business language. The spec-mode file asks "rough MVP or
   production handoff?" first. Put that to the user as: "Do you want a quick
   first version to try out, or a complete version ready to hand over?"
5. After each change, run `piezas spec check` with the Piezas command from your
   session context, and fix what it reports.
6. When it passes, **do not ask them to read the description.** Nobody reads a
   long requirements document. Show a card in chat instead:
   - the app's name and one sentence on what it is for
   - at most five things people can do with it
   - your guesses: the things you assumed rather than heard, at most three,
     each as a short question ("I assumed members only see their own
     bookings. Right?")

   For an imported app, show the two lists and ask about customer data
   before this question (the `piezas` skill, Step 1, says how).

   Then ask: "Want to see it?" If yes, move to the preview. That is where
   they confirm, by approving what they see.
7. Write no application code in spec mode. It is blocked anyway until the
   description is complete.
