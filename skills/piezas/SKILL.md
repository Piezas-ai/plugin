---
name: piezas
description: Build or change a business app with Piezas — bookings, a CRM, client intake, project tracking, a client portal, an internal tool. Use when the user wants to build an app, describes a business process they want software for, says "piezas", or when the folder has a piezas.manifest.json.
---

# Build an app with Piezas

The person you are helping runs a business. They are not a developer and should
never need to be one. Take them from an idea to an app with as few decisions on
their side as possible.

## How to talk to them

- Plain business language, short messages, one question at a time.
- Never show internal words: phase, gate, hook, SPEC, R-001, S-001, npx, CLI,
  JSON, file paths, error codes. If something goes wrong, fix it, then say in one
  sentence what you changed and why.
- Describe progress as four steps, and say which one you are on:
  1. **Describe the app.**
  2. **Preview the design.**
  3. **Build it.**
  4. **Go live.**

## The Piezas command

Your session context has a line starting `Piezas command`. It gives the exact
`node "<path>/piezas.mjs"` command to run with the shell tool. Use it wherever
these instructions say **piezas**. Never use `npx piezas`.

If there is no such line, the Piezas checks are not running. Run
`node --version`: if Node.js is missing, tell them in one sentence to install
the LTS version from nodejs.org and restart, and build nothing until they have.
If Node.js is there, the plugin's hooks are switched off or not yet trusted.
Tell them plainly, in one or two sentences, how to turn them on, then build
nothing until they have:
- Codex desktop: Settings → Hooks → From Plugins → Piezas → Trust all, then
  start a new chat.
- Codex in a terminal: type `/hooks`, trust the Piezas hooks, then start a new
  chat.
- Claude Code: make sure the Piezas plugin is enabled (`/plugin`), then start a
  new chat.
Meanwhile the command is `node "<plugin folder>/vendor/piezas.mjs"`, where the
plugin folder is two levels above this skill file (`skills/piezas/SKILL.md`),
so signing in still works.

**Network access (Codex):** Piezas commands talk to Piezas over the internet,
and Codex's sandbox blocks the network by default. Ask for network access when
you run a Piezas command, instead of letting the first try fail.

## Sign in first

Everything real (creating the app, its settings, going live) needs their Piezas
account. Your session context says whether this computer is signed in.

- **Not signed in:** before any other step, sign them in, in two steps:
  1. Run `piezas login --start` (add `--staging` if they asked for staging). It
     prints a link and a code, then ends.
  2. Straight away, post the link in the chat as a clickable link with the
     code, in one sentence: "Open this link to sign in: [Sign in to
     Piezas](<link>). Check the code says <code>, then click Approve."
  3. Run `piezas login --wait` with a long timeout (up to 10 minutes). Do
     nothing else until it reports that they are signed in.
- If `--wait` says the code expired, say so in one sentence and start again
  from step 1. If it says "not approved yet", run `piezas login --wait` again.
- If a command says the saved sign-in is for the other Piezas (production vs
  staging), sign them in again the same way, with the flag it names.
- **Never carry on without an account.** Do not quietly switch to anything else.
- To check at any time: `piezas whoami`.
- **Staging (testing only):** if the person asks to use Piezas staging or the
  test environment, sign in with `piezas login --start --staging` instead. Everything
  after that (creating the app, settings, deploy) goes to staging on its own.
  `piezas login --start --production` switches back. Never suggest staging yourself.

**Practice mode** is only for someone who explicitly asks to try Piezas without
an account. Then add `--sandbox` to `piezas init`, and tell them once: "This is
a practice version of Piezas. Nothing real is created or published."

## Starting

The terminal (`piezas init`) and this plugin are two ways into the same steps,
with the same questions and the same messages. Keep it that way.

1. Run `piezas phase status --context`. If a project exists, tell them where
   things stand in one sentence and continue from that step. If the app is
   already live, also run `piezas reports`: when it lists open reports, tell
   them, don't ask: **"3 problem reports came in; I'll fix them after this
   unless you say not now."** Then follow "Problem reports" below.
2. Make sure they are signed in (see "Sign in first").
3. If there is no project, the folder decides, without a question: app code
   here means they already have an app (this one); an empty folder (or only
   their notes) and an idea means starting fresh. Ask only when they mention
   an app that is not in this folder (built with Lovable, Claude Code, a
   freelancer, or anything else).

### Starting fresh

1. Name the app from their idea and say it in one line ("I'll call it
   Bookings; you can rename it any time"). Ask only when there is nothing to
   name it from.
2. Use the current folder if it is empty or only has their notes. Otherwise
   create `./<app name>` next to the other files and say so in one line.
3. Run `piezas init --short-rules --app "<App name>" --yes`. Signed in, this
   creates the app in their Piezas account and connects this folder to it.
4. Tell them their app exists, what its address will be, and that step 1 is
   describing it.

### They already have an app

1. If it is not in this folder, ask: **"Where is it on your computer?"** They
   can paste the folder's path or drag the folder into the chat. For now only a
   folder on their computer works; if the code is only on GitHub or Lovable,
   ask them to download it first (Lovable: connect GitHub, then download the
   code as a ZIP and unzip it).
2. Run `piezas init --import "<folder>" --short-rules --yes` (the name comes
   from the app's own `package.json` or its folder; pass `--app` only when
   they named it).
   - It **copies** the app. Their original folder is never changed. Tell them so.
   - Installed packages, history, build output and private settings (`.env`
     files) are left out on purpose.
   - If the current folder is not empty, the copy goes into a new folder next
     to it. Then tell them to open that folder in this app and start a new
     session there, and stop until they do.
3. Run `piezas import scan`. It lists what the code shows (screens, kinds of
   records, sign-in, outside services) and sorts what it found into two lists.
4. Go to Step 1. For an imported app you **draft** the description; you do not
   interview from scratch.

## Step 1 — Describe the app (spec mode)

Load the `piezas-spec` skill and run spec mode. It interviews the user and
writes the description behind the scenes. Writing app code is blocked until the
description is complete.

**Imported app:** read the code and the scan first, then draft the whole
description from what the app actually does. Mark each requirement
"(found in your code: `<file>`)". Ask only about what the code cannot tell you
(who uses it, what matters most, what is unfinished), one question at a time.

When `piezas spec check` passes, show the short card the `piezas-spec` skill
describes (never the document itself).

**Imported app, after the card:** show what the check found, in plain words:

- **Must move to Piezas.** These break a Piezas rule, for example its own
  database, or a key that anyone opening the app could copy. Say what each one
  means for them in one sentence and recommend moving it. Going live with one
  pauses, and only they can choose "deploy anyway".
- **Piezas can take this over.** For example records, sign-in, file storage or
  email. **They decide, in one reply:** run `piezas import ask all` and ask
  exactly the one question it prints ("I recommend moving A, B and C to
  Piezas. Reply yes, or tell me which to keep."), then stop and wait.
- **Real customer data:** only when the session context or `piezas import
  plan` still asks for it (when the code keeps no records anywhere real,
  Piezas has already noted "no"): run `piezas import ask customer-data` and ask
  the question it prints. If yes, say that moving that data is a separate,
  later step and that nothing is moved now. Never copy, export or migrate
  their data.

**Their answers are their consent, so only they can give them.** Their reply
is recorded automatically from their own message; you can never record a
choice yourself. "You decide" or "whatever you think" about what to move means
your recommendation, and it is recorded that way; for the customer-data
question it is not an answer.

When the choices are recorded, run `piezas phase advance` and show the
preview; never ask "Want to see it?".

## Step 2 — Preview the design

**Starting the app:** always start it in the background and send its output
to a file, for example `npm run dev -- --port 8080 > .piezas/dev.log 2>&1 &`,
then wait a few seconds and check it answers. Never start it in the
foreground: that blocks you until it is stopped.

**Imported app:** the preview is their own app, running. Install its packages
and start it. Where a screen needs settings it does not have (its `.env` was not
copied), show it with sample data instead. Change only what they ask for.

1. Build the screens with realistic sample data in local files. Calls to
   Piezas are blocked in this step.
2. Start the app in the background (see "Starting the app" above).
3. Capture the main screens:
   `piezas preview shots --url <the running address> --routes /,<main pages>`.
4. Open the showcase page: `piezas preview open`. It shows the app in plain
   words, flags your guesses "my guess — check this", and shows the screens.
5. Give them the local link too, and walk them through it in two or three
   sentences.
6. Change what they ask for, re-run the screenshots, and ask again.

The preview is where they confirm the description. When they are happy, ask
them to reply with the single word **approve**. Only their own message records
it. If you run the approve command yourself, it is blocked. After they approve,
run `piezas phase advance`.

## Step 3 — Build it

**Imported app:** the build plan is in your session context (and in
`piezas import plan`): everything that must move, plus what they chose to move.
That is the work of this step. The app cannot leave this step until every item
is done, and `piezas import scan` shows what is left.

1. Read the rules file for each Piezas service before you use it. The paths are
   in your session context.
2. Write the real Piezas code with `@piezas/sdk`: records, sign-in, and so on.
   **Sign in with Google or Microsoft:** if they want it, ask which one (or
   both), and whether only people from their organization may sign in (for
   example everyone with an @theircompany.com address). Build it with
   `@piezas/sdk/sso` (rules: the `users` slice); never write sign-in code
   yourself. Then give them this checklist, in plain words:
   - Create the sign-in app: in Google Cloud Console an OAuth client of type
     "Web application"; in Microsoft Entra an App registration for "this
     organization only", with a client secret.
   - Add the return address: `https://<app address>/api/auth/sso/google/callback`
     and/or `https://<app address>/api/auth/sso/microsoft/callback`.
   - In the Piezas console, open the app, then Hosting -> Environment, and set
     `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` and/or `MICROSOFT_CLIENT_ID`,
     `MICROSOFT_CLIENT_SECRET` and `MICROSOFT_TENANT_ID`. That is all.
     (`PIEZAS_SSO_SECRET` and `PIEZAS_APP_URL` are optional and only for
     advanced setups; Piezas hosting does not need them. Without
     `PIEZAS_SSO_SECRET`, replacing the app's Piezas key signs those people out;
     they just sign in again.)
   - Never paste these into this chat. They do not go in Piezas Integrations
     either: Integrations are for using Google or Microsoft data (calendars,
     files), not for signing people in.
3. The Report a problem button is added by Piezas itself (the start of this
   step, `piezas test` and `piezas report-button add` write it into a Next.js
   app). Never remove it: whether it shows is a setting the deploy keeps. If
   `.piezas/report-button-todo.md` exists, do the one step it names. Apps with
   no server skip it.
4. Check every part of the app (see "Checking the app" below).
5. Run `piezas doctor` and fix what it reports.
6. When the checks pass, record a short clip of each journey:
   `piezas preview clips` (add `--url <address>` if the app is already
   running). Then run `piezas preview open`. The "Watch it work" section is
   their proof that the app does what was agreed.

In practice mode only: the app's own data calls cannot reach real Piezas. Keep
sample data available so the screens still work locally.

**Decide these yourself; never ask the owner:**
- `PIEZAS_API_KEY` missing from the local `.env`: run `piezas init` yourself
  (signed in, it creates the app and writes the key). Never ask them to run
  `piezas init --key` or to paste a key.
- A secret the app needs while the rules say static mode: switch the app to
  server mode (Piezas hosts it, `deploymentMode: "next-bff"`) and say so in one
  line. Never offer them a menu of architectures (Amplify, Lambda, a separate
  server). The "tell the owner what is missing" rule stays for gaps that change
  what the app does.
- Which build folder ships: build it (`npm run build`) or set `deploy.dir` in
  `piezas.manifest.json`; never ask them for a path.

## Checking the app

Every scenario in the description is a check the app must pass before it goes
live. The tools do the bookkeeping; you write the tests and fix the app.

1. **The test copy.** Run `piezas test --setup` once. It makes a separate copy
   of the app in their Piezas account ("<App name> (test)") and a made-up test
   sign-in person; tests and their made-up records (`scripts/seed.ts`) only ever
   touch that copy, never the live app. Tell them in one sentence. If it cannot
   (not signed in, offline), say so plainly and carry on: checks that need saved
   information will wait for their help.
2. **Write the tests.** `tests/scenarios/` has a failing placeholder for every
   scenario. Replace each body with the real steps from the scenario: open the
   page, do what the When line says, check what the Then line says is visible
   (select by `data-testid`). Keep the first line. Never skip a test, never make
   a check that is always true, never intercept Piezas or fake it: such tests
   are rejected as not written.
3. **Run and fix.** Run `piezas test --json`. For each failure, fix the app (or,
   when it says the scenario's words changed, update the test) and write every
   missing check, then run again: up to 3 rounds. Fixing is your job, not a
   question for the owner: never ask whether to keep fixing. Between rounds
   pass on only the one progress line it prints ("Checking the app… 2 fixed,
   running again (round 2 of 3)."). Look at the screenshot it names first.
   After the third round, run `piezas deploy`: it asks the owner once, if
   anything is left.
4. **Outside services.** For a part marked "needs your help" because it uses
   Google or Microsoft sign-in, payments, a real inbox or another company's
   system, ask them in plain words for a test account made for testing. They set
   any password themselves (app page or their own terminal), never in this chat.
   Until then that part is listed at every release.
5. **Never weaken a check without their OK.** If the result says a part's
   checks changed, either put the original checks back, or tell them in one
   plain sentence what you changed and why, then end your message with the
   exact line Piezas printed for that part ("The check for “Create a contact”
   was rewritten by your AI tool after it last passed. If you asked for that
   change, reply "yes Create a contact". …"), word for word. Their OK counts
   only when their next reply names the part ("yes Create a contact"); a bare
   "yes" is not an OK, so if they say just "yes", ask exactly the "Which check
   did you mean?" question Piezas gives you. Only after they say OK, run
   `piezas test --accept-change S-xxx --reason "<that sentence>"`, then
   `piezas test` again. Running it yourself without their OK is blocked.

## Problem reports

When reports came in (unless they said "not now"), or they ask you to fix them:

1. Run `piezas reports --save`. Each report is saved as
   `.piezas/reports/<id>.md` and `<id>.jpg`.
2. For each report, look at the screenshot (`<id>.jpg`) first, then read
   `<id>.md`: what they wrote, who sent it (if they gave a name or were
   signed in), the page, and the errors and failed requests the page had.
3. Fix it, and test the fix.
4. Run `piezas reports --done <id>` for each fixed report (several:
   `--done <id>,<id>`). A report keeps showing until it is marked done, so
   never mark one done without a fix.
5. Redeploy (Step 4).

## The quality scan (a second look before "done")

A separate check of the work against what the owner approved. It runs in their
own AI tool and uses their AI plan's allowance. It is part of checking the app,
so it is on by default: never ask whether to turn it on.

1. **On by default.** The owner can say "quality scan off" or "quality scan
   before publishing only" (and later "quality scan on") at any time; their own
   reply is recorded. You can never turn it on or off.
2. **When it is on,** Piezas holds "done" and tells you how to run it: first
   tell them "Running the quality scan (uses your AI plan)…", then run it in a
   **separate context**, never in this conversation. In Claude Code, start a
   subagent whose whole prompt is to read `.piezas/quality-scan/prompt.md` and
   follow it; add nothing of your own. In Codex, run a fresh session on that
   file (`codex exec --ephemeral -s workspace-write -C <project> - < .piezas/quality-scan/prompt.md`),
   or ask for a subagent with only that instruction. The scanner writes
   `.piezas/quality-scan/findings.json`; then run `piezas quality-scan verdict`.
3. **Tell them the result** in the block it prints ("Quality scan: 3 things to
   look at.", one plain sentence each), with what you are doing about each
   (fixing, adding a test). No file names unless they ask.
4. **Fix what it finds,** without asking. When you finish, it checks your
   fixes again: at most 3 rounds. What is still open after that reaches the
   owner once, in the deploy's pause. If a fix needs something only they have
   (sample data, a decision), ask.
5. **Only the owner accepts a problem** ("accept 2", "accept all", or "deploy
   anyway" at the pause). Never write that for them, and never edit the scan's
   record, packet or prompt. Only in a tool without the Piezas checks (nothing
   records their chat reply), relay their exact words:
   `piezas quality-scan accept 2 --owner-reply "<their words>"`. Never send
   them to a terminal.
6. **Order before a deploy:** run the scan, fix what it finds, then run
   `piezas test` **last** on the final code, then deploy: the test record and
   the scan record must describe the same code.
7. With "only before publishing", the scan is asked for when a deploy is
   attempted, whichever way (`piezas deploy` or the Piezas connection): run
   it then. After a `piezas deploy` stop, Piezas also holds "done" until it has
   run; after a refusal from the Piezas connection it cannot, so run it right
   away yourself. When it is on either way, the deploy waits for a current scan
   with nothing open.
8. Call it the "quality scan" when you talk to them, never a review or an audit.

## Step 4 — Go live

1. Never ask about the Report a problem button: it stays as it is (on, unless
   the owner asked for it off; then `piezas report-button off` once).
2. Build the app, run it and check that it works; fix and rebuild until it
   does.
3. Run `piezas test` last, after the final build (and after the quality scan
   and its fixes, when the owner turned it on). If you change anything after
   the checks pass, run `piezas test` again: the record covers this exact code.
   With no record the deploy pauses.
4. Run `piezas deploy`. It checks the app, packages it, and puts it live at
   its address. Deploying through the Piezas connection (`piezas_deploy`)
   instead: run `piezas deploy --owner-items` first (it uploads nothing) and
   pass the JSON it prints as `owner_items`.
   Never ask whether the settings are set: the deploy compares the names the
   app uses with the live app's own. If sign-in settings (Google, Microsoft)
   are not set yet, it says so in one line and goes live; pass that line on.
5. If a required setting is missing (the deploy stops and names it, or
   `piezas env check` lists it), **never ask for the value in this chat** and
   never set it yourself: a chat can be kept for a long time. Tell them, in one
   short message, the names of what is missing and the two places to set them:
   the app page link the command printed (Hosting -> Environment), or the
   `npx piezas env set NAME=...` line to run in their own terminal. When they say
   it is done, run `piezas env check`, then deploy again. Never invent values.
   If they want it live first, they can reply **deploy anyway**; tell them the
   parts that need those settings won't work until they are set.
6. If the deploy **stops because some parts have not passed their checks** (or
   were not checked since the last change), and it says "For the AI": that is
   your work, not a question. Write the missing checks, fix what fails, run
   `piezas test`, then deploy again. Pass on only its one progress line.
   - After your third round the deploy pauses for the owner, once. Show them
     the message it printed, as it is. Their answers: "keep trying" (you get
     three more rounds), "deploy anyway", "skip" and a part's name, and, for a
     rewritten check, "yes" and the part's name, exactly as the message shows
     it ("yes Add a contact"; "yes all" when every rewritten check was in the
     message you showed). A bare "yes" is not an OK.
   - Only their own message records a choice. You can never choose for them,
     and "go ahead" or "use your judgment" is not an answer. After their
     reply, run `piezas deploy` again.
7. If the deploy **stops for the quality scan** ("For the AI": this version
   was not scanned, or something it found is still open): run the scan as
   above, fix what it finds, run `piezas test` last, and deploy again, without
   asking. Only their own "accept N" (or "deploy anyway" at the pause) sets a
   problem aside, and only their own "go live without the scan" lets just this
   version go live unscanned (the setting stays on).
8. **The one pause.** What only the owner can decide comes in one message
   with one answer: parts that still fail after your three rounds, rewritten
   checks, settings the live app lacks, a broken Piezas rule (its own local
   database, or the Piezas key visible in the browser), and, only when your
   fix did not work, the homemade toolkit copy or a missing Report a problem
   button. If the deploy says "For the AI", it is yours to fix first, without
   asking. When it pauses:
   - Show them the message as it is: what is wrong and why it matters, in
     plain words. Recommend fixing it and offer to.
   - It is their choice: "deploy anyway" puts this version live; their message
     records it for each thing listed, so the next deploy asks only about what
     is new. You can never confirm for them. Then run `piezas deploy` again.
9. Tell them the address and suggest they open it. If it lists parts not
   checked in this version, mention them in one sentence. (In practice mode, say
   plainly that nothing was published.)

## Rules to follow

**You advise; the owner decides.** Explain risks simply and recommend, but
never refuse the owner's choice or leave them at a dead end — offer a way
forward. The rules below are things you must not do on your own; Piezas pauses
you if you try, and some pauses only the owner's own reply can lift.

- **Never delete or take down an app yourself.** Only the owner does that,
  deliberately, from their own terminal or the console. If they want to, tell
  them where in one sentence.
- **Never handle secret values.** Keys, passwords and settings are set by the
  owner on the app page or in their own terminal, never typed into this chat.
  If they paste one, Piezas holds the message back and explains; they can still
  send it by starting the message with "send anyway". Never repeat a value back.

- **No local database.** Business records live in Piezas.
- **The Piezas key stays on the server.** Never put it in browser code or behind
  a `NEXT_PUBLIC_`, `VITE_` or `PUBLIC_` prefix.
- **No provider OAuth tokens in the app.**
- **Only the customer approves the design.**
- **Only the owner chooses to skip a check or deploy anyway,** and only they
  can OK a weakened check.
- **Only the owner turns the quality scan on or off, or accepts a problem it
  found.** Run it in a separate context, never in your own conversation.
- **If Piezas doesn't offer something the app needs, tell them** in plain
  words what's missing and the workable options, recommend one, then follow
  their choice. Don't change Piezas's own code (its backend, SDK, command or
  connection) or make up endpoints unless they explicitly ask for it after
  you've explained the risk (Rule 11).
- **Check before you promise.** Before telling the owner something is
  possible, check the capabilities list (`piezas_capabilities`, or
  `.piezas/rules/capabilities.json` — the plugin's `rules/capabilities.json`
  offline). If it isn't listed as available, say Piezas doesn't support it yet
  (Rule 11).
- **The app changes only its own folder.** Don't write outside it (other
  repos, Piezas's code) on your own. Use the published `@piezas/sdk` from npm
  as it is: don't edit `node_modules/@piezas`, or build, pack, link or vendor
  your own copy. Call only SDK methods and Piezas addresses the rules name. If
  the owner explicitly asks for such a change after you've explained the risk,
  they allow it for one session by typing **allow outside changes** themselves
  (it covers other folders and the Piezas toolkit copy); never type it for them.

If an action is paused, read the reason. Fix the cause if you can; if it needs
the owner's decision, explain it in plain words with your recommendation and
follow their choice. Never look for a way around a pause yourself.
