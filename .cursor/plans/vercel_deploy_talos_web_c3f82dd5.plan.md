---
name: Vercel deploy Talos web
overview: Summarize what was read from `D:\python_projects\git\Talos\web`, deployment risks (monorepo root, serverless limits, Convex), and a minimal/no-code-change Vercel setup. Per your rules, STEP 2 assumes **zero edits** to `lib/`, `components/`, and `convex/` unless you later approve optional non-app files.
todos:
  - id: vercel-root
    content: "In Vercel: connect Git repo, set Root Directory to `web`, default Install `npm install` / Build `npm run build`"
    status: completed
  - id: vercel-env
    content: Add env vars in Vercel (NEXT_PUBLIC_CONVEX_URL, LLM_*, EXA_*, optional SEMANTIC_SCHOLAR_API_KEY)
    status: completed
  - id: convex-prod
    content: Ensure Convex production deployment exists and URL matches NEXT_PUBLIC_CONVEX_URL; adjust Convex dashboard origins if needed
    status: completed
  - id: hobby-limits
    content: If /api/check times out on Hobby, upgrade plan or accept smaller bibliographies
    status: completed
isProject: false
---

# Vercel deployment plan — Talos `web` app

## STEP 1 — What was read (from `D:\python_projects\git\Talos\web`)

### `[web/package.json](D:\python_projects\git\Talos\web\package.json)`

- **Build command (script):** `next build` (via `npm run build`).
- **Dev / start:** `next dev`, `next start`.
- **Convex tooling:** `convex dev`, `convex codegen` (local; production Convex is deployed separately with the Convex CLI / dashboard, not via this `build` script).

### `[web/next.config.ts](D:\python_projects\git\Talos\web\next.config.ts)`

- `**serverExternalPackages: ["pdf-parse"]`** — appropriate for server-side PDF parsing on Vercel.
- `**outputFileTracingRoot`** set to the directory containing this config (`web/`) — helps when the Git repo has **multiple** `package.json` / lockfiles so file tracing resolves from the correct subtree. **Not inherently a Vercel blocker** when Vercel’s **Root Directory** is `web`.

### `[web/convex/schema.ts](D:\python_projects\git\Talos\web\convex\schema.ts)`

- **Yes, it exists** (schema defines `jobs`, `citations`, `replacements`, etc.).

### `[web/.env.local](D:\python_projects\git\Talos\web\.env.local)`

**Variable names present** (values omitted here — treat file as secret):

- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`
- `NEXT_PUBLIC_CONVEX_URL`
- `EXA_API_KEY`
- `CONVEX_DEPLOYMENT` (Convex CLI / dev)
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `INTERNAL_JOB_SECRET` (not referenced by app code under `web/` in a quick scan — README mentions optional Convex hardening only)

**Code-derived env usage** (from grep under `web/`, excluding generated Convex files):

- **Required for core flows:** `NEXT_PUBLIC_CONVEX_URL` (`[app/api/check/route.ts](D:\python_projects\git\Talos\web\app\api\check\route.ts)`, `[lib/pipeline.ts](D:\python_projects\git\Talos\web\lib\pipeline.ts)`, client `[ConvexClientProvider](D:\python_projects\git\Talos\web\components\ConvexClientProvider.tsx)`).
- **LLM (PDF / extraction path):** `[lib/llmExtractConfig.ts](D:\python_projects\git\Talos\web\lib\llmExtractConfig.ts)` — `LLM_API_KEY` or `OPENAI_API_KEY`, optional `LLM_BASE_URL` / `OPENAI_BASE_URL`, `LLM_MODEL` / `OPENAI_MODEL`, optional `LLM_JSON_MODE`, `LLM_MAX_COMPLETION_TOKENS`, `LLM_REASONING_EFFORT`.
- **Exa:** `EXA_API_KEY` (`[lib/exa.ts](D:\python_projects\git\Talos\web\lib\exa.ts)`).
- **Semantic Scholar (optional key):** `SEMANTIC_SCHOLAR_API_KEY` (`[lib/semanticScholar.ts](D:\python_projects\git\Talos\web\lib\semanticScholar.ts)`) — may run without key depending on API behavior/limits.

**Data on disk:** Retraction Watch CSV exists at `[web/data/retraction_watch.csv](D:\python_projects\git\Talos\web\data\retraction_watch.csv)` (and a duplicate under parent `Talos/data/`). With Root Directory `web`, the path used at runtime should stay consistent with how `[lib/retractionWatch.ts](D:\python_projects\git\Talos\web\lib\retractionWatch.ts)` resolves `data/` (no change proposed per your constraints).

---

## What could block or break Vercel deployment?


| Risk                                   | Why                                                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wrong Vercel Root Directory**        | Parent repo `[Talos/package.json](D:\python_projects\git\Talos\package.json)` is a **different** Next app (e.g. Next 16). If Vercel builds repo root instead of `web/`, you get the wrong project or install/build failures.                                                   |
| **Missing env vars**                   | No `NEXT_PUBLIC_CONVEX_URL` → API returns 503 / UI shows backend missing. Missing LLM/Exa keys → extraction or replacement features fail at runtime.                                                                                                                           |
| **Serverless duration**                | `[app/api/check/route.ts](D:\python_projects\git\Talos\web\app\api\check\route.ts)` sets `maxDuration = 300` and comments that **Hobby** often caps around **60s**. Large bibliographies may **time out** on Hobby; Pro (or equivalent) may be needed for long runs.           |
| **Convex not deployed / URL mismatch** | Next talks to Convex via `NEXT_PUBLIC_CONVEX_URL`. You must have a **production** Convex deployment whose URL matches what you set on Vercel, and usual Convex dashboard settings (e.g. allowed origins) should include your Vercel domain if required by your Convex project. |
| **No `vercel.json` in `web/`**         | Not a failure by itself; Vercel auto-detects Next.js.                                                                                                                                                                                                                          |


---

## Vercel Root Directory (your question)

- Vercel’s **Root Directory** is the path **relative to the Git repository root**, not an absolute Windows path.
- If the connected repo root is `**Talos`** (folder that contains `web/`), set Root Directory to `**web**` — **not** `Talos/web` (there is no `Talos` segment above repo root on Vercel).
- If your Git repo were **only** the `web` folder (unlikely here given parent `package.json`), Root Directory would be `**.**` (default).

---

## STEP 2 — Files to change (minimum, respecting your rules)

**Default recommendation: change no files** — configure everything in the Vercel UI (Root Directory `web`, env vars, install/build defaults).

- **Do not modify** `[lib/](D:\python_projects\git\Talos\web\lib)`, `[components/](D:\python_projects\git\Talos\web\components)`, `[convex/](D:\python_projects\git\Talos\web\convex)` per your instructions.
- **Optional later (only if you approve):** add a small **non-app** file such as root `[web/README.md](D:\python_projects\git\Talos\web\README.md)` deployment notes, or a root `[web/vercel.json](D:\python_projects\git\Talos\web\vercel.json)` for non-default settings — **not required** for a first deploy.

---

## STEP 3 — Environment variables to add in Vercel (manual)

Add at least:


| Variable                                                 | Scope on Vercel                            | Notes                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CONVEX_URL`                                 | Production (+ Preview if you use previews) | Must match your **production** Convex deployment URL.                                                              |
| `LLM_API_KEY` *or* `OPENAI_API_KEY`                      | Server                                     | Whichever your `[lib/llmExtractConfig.ts](D:\python_projects\git\Talos\web\lib\llmExtractConfig.ts)` path expects. |
| `LLM_BASE_URL` / `LLM_MODEL` (or `OPENAI_*` equivalents) | Server                                     | If using Groq or non-default OpenAI host.                                                                          |
| `EXA_API_KEY`                                            | Server                                     | If replacement search should work in production.                                                                   |
| `SEMANTIC_SCHOLAR_API_KEY`                               | Server                                     | Optional; add if you hit limits without a key.                                                                     |


**Usually not required for Next on Vercel** (Convex CLI / local dev): `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_SITE_URL` — keep them in local `.env.local` for `convex dev` / deploy from your machine.

`**INTERNAL_JOB_SECRET`:** Only if you implement Convex-side checks; not required by current Next-only grep.

---

## STEP 4 — Your approval

No repo changes will be made until you reply **proceed**. After approval, any edits would stay limited to **non-`**lib`/**non-`**components`/**non-**`convex` files only if you still want them (otherwise deployment remains dashboard-only).