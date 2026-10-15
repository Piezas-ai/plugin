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

### Claude (desktop app, Claude Code)

1. Open **Plugins**, choose **Add marketplace**, and enter `Piezas-ai/plugin`.
2. Install **Piezas**.
3. Start a new chat in an empty folder and say "Set up this folder for a new
   Piezas app".

In a terminal: `/plugin marketplace add Piezas-ai/plugin`, then
`/plugin install piezas@piezas`.

### Codex (desktop app, Codex CLI)

1. In the desktop app, choose **Add → Add a Marketplace**. For the source, enter
   `https://github.com/Piezas-ai/plugin`; leave Git ref and sparse paths empty.
2. Click **+** next to **Piezas** to install it.
3. **Turn on the Piezas checks (required).** Codex does not run a plugin's
   checks until you trust them. Open **Settings → Hooks → From Plugins →
   Piezas** and choose **Trust all**. In the Codex CLI, open `/hooks` instead.
4. Start a **new** chat in an empty folder and say "Set up this folder for a
   new Piezas app".

Without step 3, Piezas can still guide the AI, but nothing stops a
rule-breaking change while it is written, and the AI will remind you to turn
the checks on. Codex asks you to trust the checks again only when an update
changes them.

In a terminal: `codex plugin marketplace add Piezas-ai/plugin`, then
`codex plugin add piezas@piezas`, then `/hooks` in Codex.

### After installing

Describe what you want to build. Already have an app (for example from
Lovable)? Say so: Piezas copies it into a new folder and never changes the
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

**Runs on your computer.** The hooks run with Node.js. Before each tool call,
`hooks/pre-tool-use.mjs` runs the Piezas checks; it never writes an answer, so
it can only refuse (exit code 2, with the reason) or stay silent and leave the
decision to the normal permission prompt. It never approves a tool call. The
other events run `hooks/hook.mjs`, which only adds context for the AI. `vendor/` is
the readable source of the open `piezas` command-line tool (its modules, plus
the `vendor/piezas.mjs` entry), copied in so nothing is downloaded at run time. The checks on each change run entirely on your
computer; your code is not sent anywhere for them.

**Talks to these Piezas addresses, and nothing else of its own:**

| Address | When | What is sent |
| --- | --- | --- |
| `app.piezas.ai`, `api.piezas.ai` | Sign-in, creating the app, checking settings, reading problem reports | Your sign-in code, the app's name, and the names (never the values) of settings |
| `apps.piezas.ai` | Only when you deploy | The built app. `.env` files are never included. |
| `mcp.piezas.ai` | When a project is set up | Nothing; it downloads the current Piezas rules |
| `registry.npmjs.org` | Before a deploy | Nothing; it checks the latest Piezas SDK version |
| `*.amazonaws.com` | When you save problem reports | Nothing; it downloads a report's screenshot through a temporary link from Piezas |
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

## Security

- **Your credentials go only to Piezas.** The plugin uses two credentials,
  both issued by Piezas: your sign-in (`~/.piezas/credentials.json`) and your
  app's key (`PIEZAS_API_KEY` in the project's `.env`). They are sent only to
  Piezas, to act on your account and your app.
- **One gate for every request.** All network requests go through
  `vendor/net.js`, which allows only `https` addresses on `piezas.ai`. The two
  downloads in the table above that leave `piezas.ai` carry no credential.
  Nothing, including a setting or environment variable, can widen that list.
- **Checks can only refuse.** As described above, the check before each tool
  call can refuse it or stay silent; it can never approve.
- **Readable code.** Everything in `vendor/` and `hooks/` is unminified source
  under the MIT license.

## Honest limits

- **Hooks are local.** A user can turn them off or, in Codex, not trust them,
  and an agent outside these two hosts never sees them. The final gate is still
  the server-side deploy check.
- **Not a security boundary.** A check that fails or times out lets the action
  through, and some actions are not checked at all (for example web searches,
  or input typed into an already-running command). The checks keep an AI tool
  on track; they do not replace review.
- **Codex's public plugin directory** does not accept plugins with hooks yet,
  so in Codex this plugin is installed from this repository (see Install).
- **Plain chat can't build.** Claude.ai web chat and ChatGPT chat cannot write
  files, so they cannot build. Building needs Claude Code (including the desktop
  app's Code tab) or Codex.

## Privacy

How Piezas handles your information: [Privacy Policy](https://piezas.ai/privacy).

## Support

Questions or a check that looks wrong: support@piezas.ai.

## License

MIT. See `LICENSE`.
