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
   Where that file asks one of these, do not ask it; this skill decides:
   - **Resume or start fresh?** Resume a saved interview, and say so in one
     line. "Start over" is the owner's to say.
   - **Quick version or complete handover?** See step 4.
   - **"Confirm (or correct) the summary"**: never asked. Write SPEC.md; the
     preview and their "approve" are the one confirmation.
   - **"Want a paste-ready design prompt?"**: never offered. You build the
     preview yourself.
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
   production handoff?" first. Do not ask it: write the quick first version.
   Write the complete handover version only when the owner mentions a
   developer, an agency or handing the app over.
5. Also write down what the app keeps (`## Data`, one line per kind of record
   with its fields; the made-up test records are made from it), and flag every
   **outside service** a scenario depends on (Google or Microsoft sign-in,
   Stripe or other payments, a real inbox, text messages, another company's
   system) with a `needs: <service>` line. Ask them, in plain words, whether
   they can provide a test account for it: "To check sign-in with Google, I need
   a Google account made just for testing. Can you set one up?" They set any
   password themselves, never in this chat. If not, that part is shown as
   "needs your help" at every release; it is never silently skipped.
   If they want people to sign in with Google or Microsoft, ask which one (or
   both) and whether only people from their organization may sign in, write
   it in the scenario's words ("signs in with Google") and add
   `needs: Google sign-in` / `needs: Microsoft sign-in`.
   Before writing down anything that needs Piezas to do it (a way to sign in,
   an integration, a hosting feature), check the capabilities list
   (`piezas_capabilities`, or `rules/capabilities.json` in the plugin). If it
   isn't listed as available, tell them plainly that Piezas doesn't support it
   yet and what the workable options are, recommend one, and follow their
   choice (Rule 11).
6. After each change, run `piezas spec check` with the Piezas command from your
   session context, and fix what it reports.
7. When it passes, **do not ask them to read the description.** Nobody reads a
   long requirements document. Show a card in chat instead:
   - the app's name and one sentence on what it is for
   - at most five things people can do with it
   - your guesses: the things you assumed rather than heard, at most three,
     each as a plain statement ("I assumed members only see their own
     bookings."). Do not end the card with a question ("Right?"): it is
     information, and corrections come at the preview.

   For an imported app, show the two lists and settle the services first
   (the `piezas` skill, Step 1, says how).

   Then run `piezas phase advance` and go straight to the preview ("Here is
   the preview: <link>"); never ask "Want to see it?". That is where they
   confirm, by approving what they see.
8. Write no application code in spec mode. It is blocked anyway until the
   description is complete.
