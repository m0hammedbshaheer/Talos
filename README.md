# RetractWatch

> **You can't catch what you can't see. RetractWatch finds the retracted science hiding in your bibliography — including the papers you never knew you were citing.**

---

## The Problem

### Science Has a Silent Contamination Crisis

Every year, thousands of researchers publish work unknowingly built on retracted science. Not because they are lazy. Not because they are bad scientists. Because the infrastructure of academic publishing was never designed to warn them.

Here is how the contamination spreads, and why it is almost impossible to catch manually:

```
  2003                    2011                    2019                    2024
   │                       │                       │                       │
   ▼                       ▼                       ▼                       ▼
Paper X published  ──►  Retracted quietly  ──►  Paper A cites X  ──►  You cite Paper A
                         (database updated)      (author didn't know)    (you never saw X)

                                                                            │
                                                                            ▼
                                                               Your conclusions rest
                                                               on Paper X.
                                                               You have no idea.
```

This is not a hypothetical. It has ended careers. It has harmed patients. It has shaped government policy. The documented cases are harrowing:

- **The Wakefield Vaccine-Autism Paper (1998)** — Retracted in 2010, it had already been cited thousands of times. Post-retraction citations continued for over a decade. The downstream effect: global measles outbreaks and a generation of vaccine hesitancy lasting to this day.
- **The Surgisphere COVID-19 Studies (2020)** — Fabricated data, retracted within weeks. But in those weeks, the WHO halted hydroxychloroquine trials globally and drug policy changed in over a dozen countries based entirely on that invented data.
- **The Cornell Food Lab (Brian Wansink)** — Over 50 papers retracted. His work on portion sizes, food labeling, and eating behavior had directly influenced dietary guidelines used by schools and hospitals across the United States for years.

### The Numbers Are Worse Than You Think

- The average retracted paper continues to receive **25 citations after retraction**
- Only **5.4%** of those post-retraction citations acknowledge that the paper was retracted
- The Retraction Watch database now tracks over **69,000 retracted papers** — and grows every week
- Most citation managers will tell you a paper has been retracted only **if you already have it in your library**. They cannot check papers you cited indirectly.

### The Gap That No Tool Has Closed

Every existing tool — Scite, Zotero alerts, RetractoBot, CrossMark — solves the same problem: **checking your direct citations**. If Paper A is in your bibliography and it has been retracted, these tools will flag it.

But science does not contaminate in one hop.

```
Your Paper
    │
    ├──► Paper A  ────────────────────────────────►  (clean)
    │
    ├──► Paper B  ──►  cites Paper X internally  ──►  Paper X is RETRACTED
    │                            ▲
    │                            │
    │              You cited Paper B in good faith.
    │              Paper B's conclusions rely on Paper X.
    │              Paper X was retracted years ago.
    │              You never cited Paper X directly.
    │              No existing tool warned you about this.
    │
    └──► Paper C  ────────────────────────────────►  (clean)

Result: Your work depends on fraudulent data
        through a citation chain you never saw.
        This is called cascade contamination.
        No consumer tool detects this automatically.
        Until now.
```

**This is the problem RetractWatch was built to solve.**

---

## What RetractWatch Does

RetractWatch is a bibliography integrity scanner. You give it your paper (as a PDF) or your reference list (pasted as text). It runs a five-phase automated pipeline that:

1. Extracts and structures every citation in your bibliography using an LLM
2. Resolves DOIs for every reference using CrossRef
3. Checks every DOI against the Retraction Watch database (69,000+ records, loaded locally — no API round-trip, instant lookup)
4. Fetches the reference lists of every clean citation using Semantic Scholar, then checks *those* DOIs against the retraction database — this is the cascade check
5. Scores your bibliography, estimates downstream contamination risk, compares to historical scandal cases, and suggests replacement papers for anything flagged

The output is a visual contamination map, an integrity score from 0–100, and a downloadable report.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                              USER                                   │
│                                                                     │
│             PDF Upload   ──or──   Paste References                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS FRONTEND                              │
│                         (web/app/)                                  │
│                                                                     │
│   ┌──────────────────────┐       ┌───────────────────────────────┐  │
│   │     Home Page        │       │       Results Page            │  │
│   │  app/page.tsx        │       │  /results/[jobId]             │  │
│   │                      │       │                               │  │
│   │  · PDF dropzone      │       │  · IntegrityScore (dial)      │  │
│   │  · Paste textarea    │       │  · CascadeGraph (SVG map)     │  │
│   │  · Loading overlay   │       │  · CitationFeed (per-item)    │  │
│   │  · Demo preview      │       │  · HistoricalComparison       │  │
│   └──────────┬───────────┘       │  · DownstreamRisk estimate    │  │
│              │                   │  · ReportDownload (PDF)       │  │
│              │                   └───────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────────────┘
               │
               ├──── POST /api/extract   ←── PDF file
               │
               └──── POST /api/check    ←── citations array
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ROUTES  (Next.js)                            │
│                                                                     │
│  ┌───────────────────────────┐   ┌───────────────────────────────┐  │
│  │   /api/extract            │   │   /api/check                  │  │
│  │                           │   │                               │  │
│  │  1. pdf-parse             │   │  Calls runPipeline()          │  │
│  │     (bytes → text)        │   │  Runs all 5 phases            │  │
│  │  2. Regex: isolate        │   │  Returns full JSON result     │  │
│  │     bibliography section  │   │  synchronously                │  │
│  │  3. LLM: bib text →       │   │                               │  │
│  │     structured JSON       │   └───────────────┬───────────────┘  │
│  │     citations array       │                   │                  │
│  └───────────────────────────┘                   ▼                  │
│                                  ┌───────────────────────────────┐  │
│                                  │      PIPELINE ENGINE          │  │
│                                  │    lib/pipeline.ts            │  │
│                                  │    runPipeline()              │  │
│                                  └───────────────┬───────────────┘  │
└──────────────────────────────────────────────────┼──────────────────┘
                                                   │
                    ┌──────────────────────────────┼─────────────────────────────┐
                    │                              │                             │
            Phase 1 ▼                     Phase 2 ▼                     Phase 3 ▼
  ┌──────────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
  │    CrossRef API      │     │  Retraction Watch    │     │  Semantic Scholar API  │
  │                      │     │  (Local CSV)         │     │                        │
  │  Title + authors     │     │                      │     │  DOI →                 │
  │  → DOI resolution    │     │  69,414 records      │     │  reference list        │
  │                      │     │  In-memory Map       │     │  (up to 50 refs)       │
  │  Free, no auth       │     │  O(1) DOI lookup     │     │                        │
  │  Confidence ≥ 50     │     │  Instant, offline    │     │  Then: check each      │
  │  required            │     │                      │     │  ref DOI against CSV   │
  └──────────────────────┘     └──────────────────────┘     └────────────────────────┘
                                                                        │
                                                               Phase 3 continued:
                                                               If any ref is retracted
                                                               → parent = "cascade"
                                                                 cascadeVia = title
                    ┌──────────────────────────────────────────────────┘
                    │
            Phase 4 ▼
  ┌──────────────────────────────────────────────┐
  │           Exa API  (optional)                │
  │                                              │
  │  For each retracted or cascade citation:     │
  │  Search for 3 replacement papers             │
  │  Returns title, url, summary, date, score    │
  │  Skipped silently if EXA_API_KEY not set     │
  └──────────────────────────────────────────────┘
                    │
            Phase 5 ▼
  ┌──────────────────────────────────────────────┐
  │         Scoring + Analytics                  │
  │                                              │
  │  lib/scoring.ts       → integrity score      │
  │  lib/downstreamRisk.ts → contagion estimate  │
  │  lib/historicalCases.ts → scandal match      │
  └──────────────────────────────────────────────┘
```

### The Pipeline in Detail

```
Input: PipelineCitation[]
       { id, title, year?, doi?, authors?, status: "pending" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 1 — DOI Resolution  (CrossRef)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  For each citation without a DOI:
    → Query: api.crossref.org/works?query.title=<title>&query.author=<authors>
    → Accept only if top result confidence score ≥ 50
    → Attach resolved DOI to citation object
    → If no confident match: status = "unverified", skip remaining phases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 2 — Direct Retraction Check  (Local CSV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  For each citation with a DOI:
    → Normalize: lowercase, strip "https://doi.org/" prefix
    → O(1) lookup in in-memory Map<string, RetractionRecord>
       (69,414 records loaded once at startup via PapaParse)
    → HIT:  status = "retracted"
            attach { reason, date, country, journal }
    → MISS: status = "clean" (provisional — cascade check follows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 3 — Cascade Detection  (Semantic Scholar + CSV)   ◄── NOVEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  For each citation with status = "clean":
    → Fetch: api.semanticscholar.org/graph/v1/paper/DOI:<doi>/references
             fields: title, authors, externalIds
             limit: 50 references
             delay: 150ms between calls (rate limit courtesy)
    → On failure or empty result: retry once after 2s
    → If API unavailable: status = "cascade-unknown"

    For each returned reference that has a DOI:
      → Normalize and check against Retraction Watch Map
      → First retracted reference found:
            parent citation status = "cascade"
            cascadeVia = retracted paper's title
            break inner loop (one hit is enough)

  Result: "cascade" citations are papers you cited that themselves
          cite retracted work — contamination you had no way to see.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 4 — Replacement Suggestions  (Exa, optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  For each citation with status = "retracted" or "cascade":
    → Search Exa (category: "research paper") for 3 alternatives
    → Returns: { title, url, summary, publishedDate, relevanceScore }
    → Skipped silently if EXA_API_KEY is not configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 5 — Scoring + Analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → calculateIntegrityScore()  → 0–100
  → calculateDownstreamRisk()  → contagion estimate
  → compareToHistoricalCases() → scandal similarity

Output: { integrityScore, citations[], historicalComparison,
          downstreamRisk, replacements[] }
```

### Repo Structure

```
Talos/
│
├── web/                               ← Main application (run this)
│   │
│   ├── app/
│   │   ├── page.tsx                   ← Landing page: upload + paste
│   │   ├── layout.tsx                 ← Root layout, fonts, metadata
│   │   ├── globals.css                ← Global styles
│   │   └── results/[jobId]/
│   │       ├── page.tsx               ← Results route (server component)
│   │       ├── ResultsPageClient.tsx  ← Client router: Convex vs session
│   │       ├── ResultsLayout.tsx      ← Full dashboard layout
│   │       └── ResultsConvexView.tsx  ← Real-time Convex subscriber
│   │
│   ├── app/api/
│   │   ├── extract/route.ts           ← POST: PDF → structured citations
│   │   └── check/route.ts             ← POST: citations → full scan result
│   │
│   ├── components/
│   │   ├── CascadeGraph.tsx           ← SVG contamination map (demo centerpiece)
│   │   ├── IntegrityScore.tsx         ← Circular score dial widget
│   │   ├── CitationFeed.tsx           ← Per-citation live status feed
│   │   ├── HistoricalComparison.tsx   ← Scandal comparison panel
│   │   ├── DownstreamRisk.tsx         ← Contagion estimate panel
│   │   ├── ReportDownload.tsx         ← PDF export button
│   │   ├── AnalysisLoadingOverlay.tsx ← Animated loading steps UI
│   │   ├── SiteHeader.tsx             ← Nav header
│   │   ├── OriginBadge.tsx            ← Retraction origin label
│   │   └── ConvexClientProvider.tsx   ← Convex React provider wrapper
│   │
│   ├── lib/
│   │   ├── pipeline.ts                ← Core 5-phase engine (runPipeline)
│   │   ├── pipeline-types.ts          ← Shared TypeScript types
│   │   ├── retractionWatch.ts         ← CSV loader + O(1) DOI Map lookup
│   │   ├── semanticScholar.ts         ← Cascade reference fetcher + retry
│   │   ├── crossref.ts                ← DOI resolution from title/authors
│   │   ├── scoring.ts                 ← Integrity score algorithm
│   │   ├── downstreamRisk.ts          ← Forward contamination estimator
│   │   ├── historicalCases.ts         ← Scandal comparison engine
│   │   ├── exa.ts                     ← Replacement paper search
│   │   ├── llmExtractConfig.ts        ← LLM provider config loader
│   │   ├── mockData.ts                ← Demo mode static payloads
│   │   ├── citationRow.ts             ← Frontend citation type normalizer
│   │   ├── citationStatus.ts          ← Status helpers + display labels
│   │   ├── convexEnv.ts               ← Convex URL presence check
│   │   ├── jobViewModel.ts            ← Job state shape for UI
│   │   └── scoreBands.ts              ← Score → label/color/description
│   │
│   ├── convex/
│   │   ├── schema.ts                  ← jobs, citations, replacements tables
│   │   ├── jobs.ts                    ← Job CRUD mutations and queries
│   │   ├── citations.ts               ← Citation CRUD + by_job index
│   │   └── replacements.ts            ← Replacement paper storage
│   │
│   └── data/
│       ├── retraction_watch.csv       ← 69,414 retracted papers (local)
│       └── historical_cases.json      ← Wakefield, Surgisphere, Cornell data
│
├── scripts/                           ← Standalone pipeline test runners
│   ├── testCascade.ts                 ← End-to-end cascade detection test
│   ├── testCrossref.ts                ← CrossRef DOI resolution test
│   ├── testDatabase.ts                ← Local CSV lookup test
│   └── testScoring.ts                 ← Integrity scoring unit test
│
└── README.md
```

### PDF Processing Flow

```
User drops a PDF file
         │
         ▼
POST /api/extract
         │
         ├─► pdf-parse
         │     Converts PDF bytes to raw text string
         │     Fails on scanned/image PDFs → returns clear error
         │
         ├─► Regex extraction
         │     Pattern: /references|bibliography|works cited.../i
         │     Captures everything after the heading
         │     Fallback: last 6,000 chars if no heading found
         │     Cap: 8,000 chars passed to LLM (cost + latency control)
         │
         └─► LLM (OpenAI-compatible Chat Completions)
               System prompt: bibliography parser, JSON only
               User message: <extracted bibliography text>
               Output: { citations: [{ title, authors, year, doi }] }
               Strips markdown fences if model wraps response
                         │
                         ▼
               POST /api/check
               → runPipeline(jobId, citations, updateFns)
               → returns full result JSON synchronously
                         │
                         ▼
               Stored in sessionStorage by jobId
               Browser redirects to /results/[jobId]
               ResultsLayout renders from sessionStorage
```

---

## Tech Stack

### Core

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 15–16 | App router, API routes, SSR |
| Language | TypeScript | ^5 | Full-stack type safety |
| UI Styling | Tailwind CSS | ^4 | Utility-first styling, no component library |
| Runtime | Node.js | 18+ | Server-side pipeline execution |
| Visualization | Custom SVG | — | Contamination graph (no D3 dependency in web/) |

### External APIs

| API | Auth Required | Cost | Used For |
|---|---|---|---|
| CrossRef Works API | None (mailto param) | Free | Resolving DOIs from paper titles |
| Semantic Scholar Graph API | None | Free, rate-limited | Fetching reference lists for cascade detection |
| OpenAI Chat Completions | `OPENAI_API_KEY` | Pay-per-use | Extracting structured citations from PDF text |
| Exa Search API | `EXA_API_KEY` | Optional | Finding replacement papers for flagged citations |
| Convex | `NEXT_PUBLIC_CONVEX_URL` | Optional | Real-time job streaming to results page |

### Local Data

| File | Size | Records | How It Is Used |
|---|---|---|---|
| `retraction_watch.csv` | ~61 MB | 69,414 rows | Parsed once at startup by PapaParse into an in-memory `Map<doi, RetractionRecord>`. All retraction lookups are O(1) with no network call. |
| `historical_cases.json` | ~2 KB | 3 entries | Wakefield, Surgisphere, Cornell — used by `compareToHistoricalCases()` to match the scan's severity tier to a real-world scandal with context. |

### Key Dependencies

```
next          — framework, routing, API routes
react         — UI rendering
openai        — LLM API client (bibliography extraction from PDF text)
pdf-parse     — PDF bytes → raw text extraction
papaparse     — CSV parsing for the 69k-record retraction database
exa-js        — Semantic web search for replacement paper suggestions
convex        — optional real-time job state streaming
tailwindcss   — styling
typescript    — type safety across frontend and pipeline
```

### LLM Provider Flexibility

The extraction step is OpenAI-compatible and works with any provider that implements the Chat Completions API:

```
Provider           LLM_BASE_URL                              Suggested Model
─────────────────────────────────────────────────────────────────────────────
OpenAI (default)   (omit)                                    gpt-4o
Groq               https://api.groq.com/openai/v1            llama-3.1-8b-instant
NVIDIA NIM         https://integrate.api.nvidia.com/v1       llama-3.1-8b-instruct
xAI Grok           https://api.x.ai/v1                       grok-beta
Local (Ollama)     http://localhost:11434/v1                  any local model
```

---

## Setup

### Prerequisites

- Node.js 18 or higher
- An API key for any OpenAI-compatible LLM provider

### 1. Clone and Install

```bash
git clone https://github.com/m0hammedbshaheer/Talos.git
cd Talos/web
npm install
```

### 2. Environment Variables

Create `web/.env.local`:

```bash
# ── Required: LLM for PDF bibliography extraction ──────────────────────────
OPENAI_API_KEY=sk-...

# ── Optional: use a non-OpenAI provider ────────────────────────────────────
# LLM_BASE_URL=https://api.groq.com/openai/v1
# LLM_MODEL=llama-3.1-8b-instant
# LLM_JSON_MODE=true
# LLM_MAX_COMPLETION_TOKENS=8192

# ── Optional: replacement paper suggestions (Phase 4) ──────────────────────
# EXA_API_KEY=exa-...

# ── Optional: real-time streaming to results page ──────────────────────────
# NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

> The core scan pipeline runs fully without Convex. Convex enables real-time streaming updates to the results page while the scan runs. For local development and demos, it is not required — results are passed through sessionStorage instead.

### 3. Run

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Optional: Enable Convex Real-time Mode

```bash
# From web/ directory
npx convex dev   # links your Convex deployment, keep terminal open

# Add to .env.local:
# NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Restart dev server
npm run dev
```

---

## Pipeline Tests

From the repo root (`Talos/`, not `Talos/web/`):

```bash
npm install

# Verify the local retraction database loads correctly
npm run test:db

# Test CrossRef DOI resolution from paper titles
npm run test:crossref

# Test cascade detection end-to-end against live APIs
npm run test:cascade

# Test the integrity scoring algorithm with known inputs
npm run test:scoring
```

---

## The Scoring Model

The integrity score is not a simple retraction count. It accounts for what was retracted and when it was retracted.

```
Score = 100 − retractedPenalty − cascadePenalty

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
retractedPenalty = Σ (1/N) × 60 × severityMult × recencyMult
                   for each retracted citation

N = total number of citations in bibliography

Severity multipliers  (parsed from retraction reason text):
  "fraud" / "fabricat"    → 1.5×   worst
  "misconduct"            → 1.4×
  "plagiar" / "duplicat"  → 1.2×
  "error" / "mistake"     → 0.8×   most forgivable
  anything else           → 1.0×

Recency multipliers  (based on retraction date):
  Retracted < 2 years ago → 0.8×   harder to have caught
  Retracted 2–5 years ago → 1.0×
  Retracted ≥ 5 years ago → 1.3×   should have caught this

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cascadePenalty = (cascadeCount / N) × 25

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hard score ceilings  (applied after formula):
  ≥ 1 direct retraction   → score ≤ 85
  ≥ 3 direct retractions  → score ≤ 65
  ≥ 5 direct retractions  → score ≤ 40

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score bands:
  90–100   ✅  CLEAN                  No flags detected
  70–89    ⚠️   REVIEW RECOMMENDED    Issues worth checking
  50–69    🚨  SIGNIFICANT RISK       Address before submission
  0–49     ❌  CRITICAL               Major revision needed
```

---

## Citation Status Reference

| Status | What It Means |
|---|---|
| `pending` | Queued, not yet processed |
| `checking` | Currently being scanned in the active pipeline phase |
| `clean` | DOI resolved, not in retraction database, no retracted upstream references found |
| `retracted` | DOI matched directly in the Retraction Watch database |
| `cascade` | Not retracted itself, but its own reference list contains a retracted paper |
| `cascade-unknown` | Semantic Scholar could not return a reference list; cascade status cannot be determined |
| `unverified` | CrossRef could not resolve a DOI for this citation with sufficient confidence |

---

## The Contamination Graph

The `CascadeGraph` component renders an SVG visualization showing your manuscript as the hub, with flagged citations as labeled nodes and all clean citations as small dots:

```
                ┌──────────────────────┐
                │    Your Manuscript   │
                └──────────┬───────────┘
                           │  (spine)
              ─────────────┴───────────────── (bus)
             /              |                  \
      ┌──────────┐    ┌──────────┐    ┌──────────────────┐
      │🔴Retracted│    │🟠Cascade │    │ 🟠Cascade        │
      │ Paper A  │    │ Paper B  │    │  Paper C         │
      │ Fraud    │    │Via: X    │    │  Via: Paper Y    │
      └──────────┘    └──────────┘    └──────────────────┘

      · · · · · · · · · · · · · · · · · · · · · · (clean)
      · · · · · · ○ · · · · · · · · · · · · · · (unverified)

      Legend filters: [🟢 Clean] [🔴 Retracted] [🟠 Cascade] [⚪ Unverified]
```

For bibliographies with more than 10 citations, the view switches automatically to a summary mode — counts by category plus a scrollable flagged-items list — to keep rendering performant.

The graph includes toggle filters so judges, reviewers, or users can isolate just the retracted, just the cascade, or just the clean citations independently.

---

## Downstream Risk Estimate

When your paper contains contaminated citations, RetractWatch estimates the forward spread: how many papers could inherit this contamination if your work gets cited.

```
estimatedDirectCitations  = flaggedCount × 12   (avg citations per academic paper)
estimatedDownstreamPapers = flaggedCount × 12 × 2.1
worstCaseDownstream       = flaggedCount × 25 × 3

Risk levels:
  > 300 downstream papers → CRITICAL
  > 100                   → HIGH
  > 30                    → MODERATE
  ≤ 30                    → LOW
```

These are forward-looking estimates for communication purposes, not precise forecasts.

---

## Historical Comparison

The scan maps your severity level to the closest documented retraction scandal:

| Severity Tier | Matched Case | Avg Time to Catch |
|---|---|---|
| Score < 50 or ≥ 3 retractions | Wakefield Vaccine-Autism Paper | 144 months (12 years) |
| Score < 70 or ≥ 1 retraction | Surgisphere COVID-19 Studies | 2 months |
| Cascade only | Cornell Food Lab (Brian Wansink) | 48 months |
| Clean | No match | — |

---

## Deployment

RetractWatch is a standard Next.js application. It deploys to any Node.js host.

**Vercel (recommended):**

```bash
cd web
npx vercel deploy
```

Set all environment variables in the Vercel dashboard. The 61MB CSV is bundled server-side and loaded into memory at startup — allocate at least 512MB RAM for your deployment.

**Environment variables required in production:**
- `OPENAI_API_KEY` (or equivalent `LLM_*` vars)
- `EXA_API_KEY` (optional — Phase 4 replacement suggestions)
- `NEXT_PUBLIC_CONVEX_URL` (optional — real-time mode)

---

## Known Limitations

- **Scanned PDFs are not supported.** The pipeline requires machine-readable text. Scanned image PDFs return an error with a clear message directing users to try a text-based version.
- **Cascade detection is one level deep.** The pipeline checks your citations' reference lists. It does not recurse further. This is by design — a second-level cascade is a warning signal, not a definitive finding.
- **Semantic Scholar coverage is not universal.** Older papers, conference proceedings, and regional journals may not have indexed reference lists. These receive `cascade-unknown` status rather than a false `clean`.
- **The Retraction Watch CSV is a snapshot.** It reflects the database at the time of the last pull. New retractions will not appear until the CSV is refreshed.
- **Replacement suggestions require Exa.** If `EXA_API_KEY` is absent, Phase 4 is skipped. The scan completes normally without it.

---

## Who This Is For

**PhD students** — Run your bibliography before your thesis defense, not after your committee finds it.

**Journal authors** — Submit with confidence that your reference list has been checked two levels deep.

**Research labs** — Audit your team's in-progress papers before they go out.

**Science journalists** — Verify the papers you cite in evidence-based reporting before publication.

**Systematic reviewers** — Screen large reference lists for contaminated sources efficiently.

---

## Data Source

Retraction data is provided by the [Retraction Watch Database](https://retractionwatch.com/), maintained by the Center for Scientific Integrity. The database is the most comprehensive public record of retracted academic papers, with over 69,000 entries spanning every scientific discipline.

---

*RetractWatch · Built for researchers · Zero data retention · Your PDF is never stored*
