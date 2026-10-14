# Piezas plugin for Claude Code and Codex

One folder, two hosts. A business owner says "I want an app for my yoga studio's
bookings", and the plugin turns that into a guided, plain-language build:

1. **Set up.** Piezas creates the app, writes the project's instruction
   files, and installs the SDK. If they already have an app, it is copied in
   and checked first.
2. **Describe the app.** Spec mode interviews them one question at a time.
3. **Preview the design.** A clickable version runs on sample data. Only the
   customer's own typed "approve" accepts it.
4. **Build it.** The agent writes the real Piezas code.
5. **Go live.** `piezas deploy`.

**Signing in.** The first time, the plugin signs you in to your Piezas account:
your browser opens a Piezas page, you check the code and click Approve. That one
sign-in covers creating the app, its settings and going live. Want to try first
without an account? Ask for practice mode: everything runs on a simulated Piezas
and nothing is created or published.

## Install

**Claude Code** (CLI, desktop Code tab or IDE extension):

```
/plugin marketplace add Piezas-ai/plugin
/plugin install piezas@piezas
```

**Codex:**

```
codex plugin marketplace add Piezas-ai/plugin
codex plugin add piezas@piezas
```

Codex asks once to trust the plugin's hooks; open `/hooks` to review them. After
installing, just describe what you want to build. In Claude Code, `/piezas:start`
also works. Already have an app (for example from Lovable)? Say so, or use
`/piezas:import`: Piezas copies it into a new folder and never changes the
original.

Requirements: **Node.js** (LTS). The plugin's checks run with Node.js; if it is
missing, the AI tells you in one sentence how to install it before building.

## What the user sees, and what they never see

They see four steps, plain sentences, one question at a time, and a local preview
link. When the design is right, they type **approve**.

They never see phases, gates, rule codes, file names, `npx`, or JSON. Every
session starts with that instruction. When a guard blocks something, the agent
fixes the cause and explains it in one plain sentence.

## How the rules hold over a long session

Rules in a long instruction file fade as a session grows. A rule is followed at
the start and forgotten by turn forty. The plugin stops depending on the model
remembering:

| Layer | What | When |
|---|---|---|
| Short core rules | ~2.7 KB of non-negotiables (`rules/core.md`) plus the current step | Every session start **and after every compaction** (`SessionStart` hook) |
| Per-turn reminder | One line: current step plus the four never-rules | Every user message (`UserPromptSubmit` hook) |
| Topic rules | `rules/<topic>.md` (entities, users, integrations, calendar, documents, deploy, testing, patterns) | Read on demand before using that service |
| Deterministic guards | Block the write *before it happens*, in every step. See the list below | Every Write/Edit/MultiEdit, Codex `apply_patch`, and shell command (`PreToolUse` hook) |
| End-of-turn check | Offline doctor, limited to the Hard No findings; holds the turn once | `Stop` hook (preview/build/go-live steps) |
| Server | Deploy attestation | At deploy (unchanged) |

The deterministic guards block:

- **A local database.** That means local-DB imports in app code, raw `CREATE TABLE`, local-DB packages in `package.json`, `npm/pnpm/yarn/bun install` of them, and `npx prisma` and similar tools.
- **`PIEZAS_API_KEY` reaching the browser.** That means a `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_` prefix, or the key read in a `'use client'` file.
- **A literal `sk_live_`/`sk_test_` key** anywhere outside `.env`.
- **Out-of-step work.** No app code before the description is complete. No API routes or `@piezas/sdk` during the preview.
- **Any write to the project's state file,** including shell redirects and `node -e`.
- **The agent recording the customer's approval.** Only the customer's own typed "approve" counts. The `UserPromptSubmit` hook records it, so the AI cannot fake it.
- **The agent deciding for the owner on an imported app.** What Piezas takes over is recorded only from the owner's own reply to each question. "Use your judgment" is not a choice.

Shell commands that write files (`>`, `>>`, `tee`) get the same file rules.
Blocks are returned as a structured `deny`, which both hosts show cleanly and pass
to the model as the reason.

## Layout

```
.claude-plugin/plugin.json, marketplace.json   Claude Code manifest + marketplace
.codex-plugin/plugin.json                       Codex manifest
.agents/plugins/marketplace.json                Codex marketplace
skills/piezas/SKILL.md                          front door: the four steps, plain language
skills/piezas-pm/SKILL.md                       the requirements interview
skills/piezas-spec/SKILL.md                     spec mode (runs the spec command init installed)
commands/*.md                                   Claude Code slash commands (Codex uses the skills)
hooks/hooks.json, hooks/hook.mjs                one hook entry for both hosts
vendor/piezas.mjs, vendor/*.js                  the Piezas CLI, bundled (its source modules)
rules/*.md                                      the Piezas rules, by topic
```

## What the plugin runs, sends and stores

**Runs on your computer.** The hooks run `hooks/hook.mjs` with Node.js. It
passes each event to the bundled Piezas checks (`vendor/hooks.js`) and only
ever refuses a tool call or adds context; it never approves one. `vendor/` is
the readable source of the open `piezas` command-line tool (its modules, plus
the `vendor/piezas.mjs` entry), copied in so nothing is downloaded at run time. The checks on each change run entirely on your
computer; your code is not sent anywhere for them.

**Talks to these Piezas addresses, and nothing else of its own:**

| Address | When | What is sent |
| --- | --- | --- |
| `app.piezas.ai`, `api.piezas.ai` | Sign-in, creating the app, checking settings | Your sign-in code, the app's name, and the names (never the values) of settings |
| `apps.piezas.ai` | Only when you deploy | The built app. `.env` files are never included. |
| `mcp.piezas.ai` | When a project is set up | Nothing; it downloads the current Piezas rules |
| `registry.npmjs.org` | Before a deploy | Nothing; it checks the latest Piezas SDK version |
| The `staging.piezas.ai` equivalents | Only after `piezas login --staging` | The same as above |

Problem reports from an app's Report a problem button go to that app's own
records on Piezas, sent by the app itself, not by this plugin.

**Stores on your computer:** your sign-in at `~/.piezas/credentials.json`
(readable only by you), the staging choice at `~/.piezas/target.json` if you
made one, and the project's own progress in its `.piezas/` folder.

**Keys:** the only key it uses is your app's Piezas key (`PIEZAS_API_KEY`),
read from the project's `.env` or your environment, and it is sent only to
Piezas. No analytics or tracking. Secrets you paste into the chat are stopped
before the AI sees them.

## Honest limits

- **Hooks are local.** A user can turn them off, and an agent outside these
  two hosts never sees them. The final gate is still the server-side deploy
  attestation.
- **Plain chat can't build.** Claude.ai web chat and ChatGPT chat cannot write
  files, so they cannot build. Building needs Claude Code (including the desktop
  app's Code tab) or Codex.

## Support

Questions or a check that looks wrong: support@piezas.ai.

## License

MIT. See `LICENSE`.
