# Entrepalooza

Entrepalooza is the workbook app for [Build Otherwise](https://buildotherwise.org), founded by Ashley Zeck in Houston. It is an adult education pilot, and it has not been run with a group yet. People use it to look at what they could build or do next. Starting a business is one option among many.

The app was built on Base44 and is moving to Vercel (project `entrepalooza-workbook`) and Supabase. One codebase runs both. The client uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are both set. With those unset, it uses the Base44 SDK.

## What is in the app

Signed-in people work through Getting Started and the modules. A module is a set of short lessons.

The Conversation Journal keeps notes, including lesson responses. The reflection partner is optional. It only sees the entries someone chooses to send, and nothing is sent until they send it. A reply is saved with that conversation. It is not written into the journal or the Life Map.

The Discovery Record is a place to keep discoveries on your own account.

AI runs only when someone asks for it:

- Journal reflection partner. On Vercel the route is `api/journalReflection.js` and the work is in `api/_lib/reflection.js`. The function does not read the journal. The person sends the entries they choose. It saves that conversation on their own `reflection_conversation` row. On Base44 it is the `conversation_journal_reflection` agent.
- Answer feedback, from the Get feedback button on one answer or one Discovery Record entry. On Vercel the route is `api/answerFeedback.js` and the work is in `api/_lib/feedback.js`. The reply comes from Gemini. On Base44 the `answerFeedback` function still calls Claude.
- Discovery companion. Admin only, and not wired to a page. On Vercel the route is `api/discoveryCompanion.js` and the work is in `api/_lib/companion.js`. On Base44 it is `base44/functions/discoveryCompanion`.

On Vercel those three features call Google Gemini from one file, `api/_lib/gemini.js`. They need `GEMINI_API_KEY` on the server. The older name `Gemini_key` also works. `GEMINI_MODEL` and `GEMINI_THINKING_LEVEL` are optional. Unset, the model is `gemini-3.5-flash-lite`. Unset, the thinking level is `low` for the companion and the reflection partner. Answer feedback uses `minimal` when `GEMINI_THINKING_LEVEL` is unset, because that is the lowest level Gemini 3.5 Flash-Lite supports. Accepted thinking levels are `minimal`, `low`, `medium`, `high`, and `off`. `off` sends no thinking setting. `minimal` is sent as `minimal`. If Gemini rejects a request that included a thinking level, it is tried once more without one.

Prompts are copied from the existing program files by `migration/scripts/extract-prompts.mjs` into `api/_lib/prompts.js`. Do not edit that file by hand. Program background for the companion and the reflection partner comes from `knowledge/knowledge.json`, which `migration/scripts/build-knowledge.mjs` builds from the program files.

An account with role `admin` can open the course review copy at `/preview`. The discovery companion checks that same role.

## Run it locally

```bash
npm install
```

Put local values in `.env.local`. That file is gitignored. Use the variable names below. Do not commit values.

### Base44

Leave the Supabase variables unset. Install the [Base44 CLI](https://docs.base44.com/developers/references/cli/get-started/overview.md) and [Deno](https://docs.deno.com/runtime/getting_started/installation/). The local Base44 backend runs on Deno.

```bash
npm install -g base44@latest
base44 login
base44 link
base44 dev
```

`base44 login` is once per machine. `base44 link` is once per clone. It writes `base44/.app.jsonc`, which is gitignored.

`base44 dev` starts the local backend and the frontend. The frontend command is `npm run dev`, from `site.serveCommand` in `base44/config.jsonc`. Open the URL it prints.

`base44 dev --remote` points the frontend at the hosted Base44 backend. Writes in that mode go to the hosted app. Plain `base44 dev` keeps entity data local, in memory, and that data is gone when the process stops.

`npm run dev` on its own, with no Supabase variables, serves the UI with no Base44 proxy. Use `base44 dev` for Base44 work.

The UI under `base44 dev` loads app settings from the hosted app, so the app has to have been published once.

### Vercel and Supabase

Set both of these. The client switches only when both are set. `VITE_SUPABASE_URL` alone turns the Base44 Vite plugin off, and the client still does not use Supabase.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Vercel functions read `SUPABASE_URL` and `SUPABASE_ANON_KEY`, and fall back to the `VITE_` names. AI calls need `GEMINI_API_KEY` (`Gemini_key` is an older name for the same key). `GEMINI_MODEL` and `GEMINI_THINKING_LEVEL` are optional. `submitInquiry` also reads `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` when a notification email should go out. `INQUIRY_FROM` and `INQUIRY_TO` are optional.

```bash
npm run dev
npm run build
npm run test:all
```

`npm run dev` is the Vite frontend on port 5173. It does not start the functions in `api/`. Those run on Vercel.

`npm run build` is the production build (`vite build`). Vercel uses that same command.

`npm run test:all` runs the tests in `src/lib` and `api/_lib`. `package.json` also has smaller scripts for one area (`test:journal`, `test:discovery-record`, `test:api`, and the others). `npm run lint` and `npm run typecheck` are the other checks.

## Deploy

The Vercel project is `entrepalooza-workbook`. `vercel.json` builds with `npm run build`, serves `dist`, and sends non-API routes to `index.html`. The database is Supabase.

Schema and seed live in `migration/supabase/schema.sql` and `migration/supabase/seed.sql`. Regenerate them from the Base44 entities and the content export:

```bash
node migration/scripts/generate-supabase-schema.mjs
node migration/scripts/generate-seed.mjs
```

`migration/supabase/reflection.sql` adds `reflection_conversation`. It is hand-written, not produced by the generator above. Run it once on the Supabase database before the reflection partner can save a conversation there.

`migration/content/` is that content export. Facilitator-only notes (`internal_notes`, and `full_text_uri` on library resources) are stored in `admin_fields`, which only an admin can read. That is why this repo is private.

Preview deployments are for review. A live release waits for Ashley's approval.

Pushes still sync to the Base44 builder. Publish that copy from the dashboard:

```bash
base44 dashboard open
```

`base44 deploy` ships the local tree and skips that sync, so the deployed Base44 app can drift from the repo.

Get Involved calls `api/submitInquiry.js` on Vercel (`api/_lib/inquiry.js`). It saves the message when `SUPABASE_SERVICE_ROLE_KEY` is set. Email goes out through Resend when `RESEND_API_KEY` is set. Without the service role key, the visitor is asked to email directly. The general `SendEmail` integration is still not available on the Supabase client.

## Still off on Vercel

These still exist on Base44. They do not run on the Vercel build.

- Notion import (`base44/functions/notionSourceRead`).
- Research-brief import (`base44/functions/researchBriefImport`).
- File upload (`integrations.Core.UploadFile`).
- Connect your AI assistant. `/connect` shows `/api/mcp`. That MCP server belongs to Base44. There is no Vercel function for it.

## Privacy

What someone writes is saved to their account. Other people in the workbook cannot see it. It stays private unless they choose to share it. Build Otherwise runs the app, so the team has technical access to what is stored.

Send real writing only through Gemini's paid tier.

`GEMINI_API_KEY` stays on the server. Do not put it, or any other secret, in a `VITE_` variable or in client code. Vite copies every `VITE_` variable into the browser bundle. `VITE_SUPABASE_ANON_KEY` is the public anon key, and the client is supposed to have it.
