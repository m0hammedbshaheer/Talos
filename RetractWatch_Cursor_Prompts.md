# 🚀 RetractWatch V2 — Cursor Prompts for All 3 Team Members

> Copy-paste your prompt directly into Cursor Chat (Ctrl+L or Cmd+L).
> Each person works independently. Do NOT touch each other's files.

---

---

# 🟦 PERSON 1 — DATA SPECIALIST
### Your job: Build the data engine. All files go in `/lib/`. No frontend needed.

---

## PROMPT 1-A — Project Setup (Do this FIRST, only one person does this)

```
We are building a Next.js app called RetractWatch V2 — a scientific bibliography
integrity checker. Help me set up the project from scratch.

Run these commands one by one and confirm each works before the next:

1. npx create-next-app@latest retractwatch
   - TypeScript = Yes
   - Tailwind = Yes
   - App Router = Yes
   - All other options = No

2. cd retractwatch

3. npm install convex openai @exa-ai/sdk pdf-parse d3 @types/d3 react-dropzone jspdf papaparse @types/papaparse

4. Create the folder: mkdir data

5. Create this file at data/historical_cases.json with exactly this content:
[
  {
    "name": "Wakefield Vaccine-Autism Paper",
    "journal": "The Lancet",
    "year": 1998,
    "retractionYear": 2010,
    "reason": "Fraud and data fabrication",
    "citationsAfterRetraction": 881,
    "totalCitations": 1211,
    "field": "Medicine",
    "country": "United Kingdom",
    "severity": "catastrophic",
    "impact": "Caused measles outbreaks globally by discouraging vaccination",
    "avgMonthsToCatch": 144
  },
  {
    "name": "Surgisphere COVID-19 Studies",
    "journal": "The Lancet / NEJM",
    "year": 2020,
    "retractionYear": 2020,
    "reason": "Data fabrication — fake patient database",
    "citationsAfterRetraction": 340,
    "totalCitations": 340,
    "field": "Medicine / COVID-19",
    "country": "United States",
    "severity": "critical",
    "impact": "Halted global hydroxychloroquine trials, affected WHO policy",
    "avgMonthsToCatch": 2
  },
  {
    "name": "Stapel Social Psychology Fraud",
    "journal": "Multiple journals",
    "year": 2011,
    "retractionYear": 2011,
    "reason": "Fabricated data across 58 papers",
    "citationsAfterRetraction": 2400,
    "totalCitations": 2400,
    "field": "Psychology",
    "country": "Netherlands",
    "severity": "critical",
    "impact": "Undermined public trust in social psychology research",
    "avgMonthsToCatch": 36
  },
  {
    "name": "Hwang Woo-suk Stem Cell Cloning",
    "journal": "Science",
    "year": 2004,
    "retractionYear": 2006,
    "reason": "Fabricated human stem cell cloning results",
    "citationsAfterRetraction": 900,
    "totalCitations": 900,
    "field": "Stem Cell Biology",
    "country": "South Korea",
    "severity": "catastrophic",
    "impact": "Set stem cell research back by years globally",
    "avgMonthsToCatch": 24
  },
  {
    "name": "Cornell Food Lab (Wansink)",
    "journal": "Multiple journals",
    "year": 2018,
    "retractionYear": 2018,
    "reason": "Data manipulation and p-hacking across 13 papers",
    "citationsAfterRetraction": 3800,
    "totalCitations": 3800,
    "field": "Nutrition / Behavioral Science",
    "country": "United States",
    "severity": "high",
    "impact": "Influenced government dietary guidelines and school lunch policies",
    "avgMonthsToCatch": 48
  }
]

6. Create .env.local and add these lines (I will fill in the keys):
OPENAI_API_KEY=sk-your-key-here
EXA_API_KEY=your-exa-key-here
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

7. Run: npx convex dev
   This opens a browser — create a free Convex account and link the project.
   Keep this terminal running always.

8. In a second terminal run: npm run dev
   The app should open at http://localhost:3000

After each step tell me: what ran, what the output was, and if anything went wrong.
Do NOT skip any step.
```

---

## PROMPT 1-B — Retraction Watch Database Loader

```
I am building RetractWatch V2. My job is the Data Layer.

Create the file lib/retractionWatch.ts with this exact content and explain each part:

This file must:
1. Load a CSV file from data/retraction_watch.csv into memory as a JavaScript Map
   (key = DOI string, value = retraction record object)
2. Export a function isRetracted(doi: string) that returns the record if found, or null
3. The retraction record must include: doi, title, authors, journal, retractionDate,
   reason, country, field, citationCount
4. Only load the CSV once — reuse it on subsequent calls (cache in memory)
5. Log to console: "Retraction Watch database loaded: X records" on first load
6. Handle these CSV column name variations since the actual file may differ:
   - DOI: "OriginalPaperDOI" or "DOI"
   - Title: "Title" or "OriginalPaperTitle"
   - Reason: "Reason" or "RetractionReason"
   - Country: "Country"
   - Journal: "Journal"
7. Use the papaparse library to parse the CSV (already installed)
8. If the CSV file doesn't exist yet, return an empty Map and log a warning —
   do NOT crash the app

Add a // DOCUMENTATION NOTE: comment at the top explaining what this file does
in plain English for a non-technical audience.

After creating the file, write a quick test: create scripts/testDatabase.ts
that loads the database and logs how many records it found.
Tell me how to run this test.
```

---

## PROMPT 1-C — CrossRef DOI Resolver

```
I am building RetractWatch V2. Create the file lib/crossref.ts.

This file must:
1. Export an async function resolveDoiFromTitle(title: string, authors?: string)
   that returns a DOI string or null
2. Call the CrossRef free public API at https://api.crossref.org/works
   - No API key needed
   - Include mailto=retractwatch@hackathon.dev in every request (polite usage)
   - Build the query URL using encodeURIComponent on the title
3. Return null (never crash) if:
   - The API call fails
   - No results come back
   - The confidence score of the top result is below 50
4. The confidence score is in data.message.items[0].score
5. Return data.message.items[0].DOI if the score is 50 or above

Add a // DOCUMENTATION NOTE: comment explaining what CrossRef is and why we need it,
written for someone who has never heard of it.

After writing the file, write 3 test calls in a small test script
scripts/testCrossref.ts using these titles:
- "Retracted paper: Ileal-lymphoid-nodular hyperplasia" (the Wakefield paper)
- "A completely made up title that will not match anything 12345"
- "CRISPR-Cas9 genome editing in human embryos"

Show me what DOIs are returned.
```

---

## PROMPT 1-D — Semantic Scholar Cascade Detector

```
I am building RetractWatch V2. Create the file lib/semanticScholar.ts.

This file must:
1. Export an async function getReferences(doi: string) that returns an array
   of reference objects: { title: string, doi: string | null, authors: string }
2. Call the Semantic Scholar free API:
   https://api.semanticscholar.org/graph/v1/paper/DOI:{doi}/references
   with fields=title,authors,externalIds and limit=50
3. Map the response: item.citedPaper.title, item.citedPaper.externalIds.DOI,
   item.citedPaper.authors[].name joined with ", "
4. Filter out results where DOI is null
5. Return empty array [] on any error — never crash
6. Add a sleep(150) delay before every API call — Semantic Scholar rate limits
   at 100 requests per 5 minutes without an API key

Add a // DOCUMENTATION NOTE: at the top explaining what cascade contamination is
in plain English. Explain that this is RetractWatch's unique feature —
no other free tool checks what your citations cited.

Also add a // DEMO MOMENT: comment on the line where cascade nodes are detected —
this is where the orange graph node appears during the live demo.

After writing, create scripts/testCascade.ts that calls getReferences on this DOI:
10.1016/S0140-6736(97)11096-0 (a known paper)
and prints the first 5 references with their DOIs.
```

---

## PROMPT 1-E — Integrity Scoring + Downstream Risk

```
I am building RetractWatch V2. Create two files:

FILE 1: lib/scoring.ts
This must export:
- calculateIntegrityScore(citations: Citation[]): number
  - Start at 100
  - Subtract 15 for each citation with status "retracted"
  - Subtract 7 for each citation with status "cascade"
  - Subtract 1 for each citation with status "unverified"
  - Return Math.max(0, Math.round(score))
  - Return 100 if citations array is empty

- getScoreLabel(score: number): { label, color, description }
  - 90-100: CLEAN, green #22c55e
  - 70-89: REVIEW RECOMMENDED, amber #f59e0b
  - 50-69: SIGNIFICANT RISK, red #ef4444
  - 0-49: CRITICAL, dark red #7f1d1d

The Citation interface is:
interface Citation {
  id: string
  title: string
  authors: string
  year: number | null
  doi: string | null
  status: "pending" | "checking" | "clean" | "retracted" | "cascade" | "unverified"
  retractionReason?: string
  retractionDate?: string
  retractionCountry?: string
  retractionJournal?: string
  cascadeDepth?: number
  cascadeVia?: string
}

FILE 2: lib/downstreamRisk.ts
This must export:
- calculateDownstreamRisk(citations: Citation[]): DownstreamRisk

interface DownstreamRisk {
  estimatedDirectCitations: number
  estimatedDownstreamPapers: number
  worstCaseDownstream: number
  riskLevel: "low" | "moderate" | "high" | "critical"
  explanation: string
}

The math:
- totalFlagged = count of retracted + cascade citations
- AVG_CITATIONS_PER_PAPER = 12
- estimatedDownstreamPapers = totalFlagged * 12 * 2.1 (rounded)
- worstCaseDownstream = totalFlagged * 25 * 3
- riskLevel: critical if >300, high if >100, moderate if >30, else low
- If totalFlagged = 0: explanation = "No contamination detected. Zero downstream risk."
- Otherwise: "If your paper is cited X times, ~Y downstream papers could inherit this contamination."

Add // DOCUMENTATION NOTE: and // DEMO MOMENT: comments where the downstream number
is calculated — this is the big reveal moment in the demo.

Write a test at scripts/testScoring.ts that simulates 3 scenarios:
1. Clean paper (0 retracted, 0 cascade)
2. One retracted citation
3. Three retracted + two cascade citations
Print the score and downstream risk for each.
```

---

---

# 🟩 PERSON 2 — BACKEND / AI SPECIALIST
### Your job: Build the AI pipeline and API endpoints. Files go in `/app/api/` and `/lib/`. No frontend needed.

---

## PROMPT 2-A — OpenAI PDF Extraction Endpoint

```
I am building RetractWatch V2. Create the API route app/api/extract/route.ts.

This is a Next.js App Router POST endpoint. It must:

1. Accept a multipart/form-data request with a field named "pdf"
2. Return error if no file received: { error: "No PDF file received" } status 400
3. Return error if file > 10MB: { error: "PDF too large. Please upload under 10MB." } status 400
4. Convert the File to a Buffer using file.arrayBuffer()
5. Extract text using pdf-parse: const pdfData = await pdfParse(buffer)
6. If text is empty or under 100 chars, return:
   { error: "This PDF appears to be a scanned image. Please use a text-based PDF." } status 400
7. Find the bibliography section using this regex:
   /(?:references|bibliography|works cited|literature cited)\s*\n([\s\S]+?)(?:\n\s*appendix|\n\s*supplementary|\Z)/i
8. If regex doesn't match, fall back to the last 6000 characters of the full text
9. Limit bibliography text to 8000 characters to save OpenAI tokens

10. Send to OpenAI GPT-4o with:
    - model: "gpt-4o"
    - temperature: 0
    - response_format: { type: "json_object" }
    - System prompt: "You are a scientific bibliography parser. Extract all references from the provided bibliography text. Return ONLY a valid JSON object with a 'citations' array. Each citation must have: { title: string, authors: string, year: number | null, doi: string | null }. If DOI not present, set to null. Return nothing except the JSON object."
    - User prompt: "Extract all references from this bibliography:\n\n{bibliographyText}"

11. Strip any markdown code fences from response before JSON.parse
12. Return: { citations: [...], totalFound: citations.length }
13. Wrap everything in try/catch — return status 500 on any error

Use: import OpenAI from "openai" and import pdfParse from "pdf-parse"
The OPENAI_API_KEY is in process.env.OPENAI_API_KEY

Add a // DOCUMENTATION NOTE: at the top explaining what this endpoint does
in plain English — it is the entry point of RetractWatch.

After creating it, tell me how to test it manually using curl or a tool like Postman.
```

---

## PROMPT 2-B — Exa Replacement Search

```
I am building RetractWatch V2. Create the file lib/exa.ts.

This file must:
1. Import Exa from "@exa-ai/sdk" — the key is in process.env.EXA_API_KEY
2. Export an interface ReplacementPaper:
   { title: string, url: string, summary: string, publishedDate: string, relevanceScore: number }

3. Export async function findReplacementPapers(retractedTitle: string, retractedYear: number):
   Promise<ReplacementPaper[]>
   - Search query: "peer-reviewed study confirming or replicating: {retractedTitle}"
   - numResults: 3
   - useAutoprompt: true
   - type: "research paper"
   - startPublishedDate: new Date(retractedYear, 0, 1).toISOString()
   - Map results to ReplacementPaper: title, url, text as summary (first 200 chars + "..."),
     publishedDate, relevanceScore as (1 - index * 0.15) so: 1.0, 0.85, 0.70
   - Return [] on any error — never crash

Add // DOCUMENTATION NOTE: explaining what Exa is and why we chose it over Google.
Add // DEMO MOMENT: on the line where replacement results are returned —
this is when the "Fix" suggestions appear in the live demo.

After writing, test it by calling findReplacementPapers with:
title: "Ileal-lymphoid-nodular hyperplasia, non-specific colitis"
year: 1998
Print what 3 replacement papers come back.
```

---

## PROMPT 2-C — Historical Comparison Logic

```
I am building RetractWatch V2. Create the file lib/historicalCases.ts.

This file must:
1. Import data/historical_cases.json (already created by the team)
2. Export this interface:
   interface HistoricalComparison {
     matchedCase: string
     similarity: string  // "similar to" | "worse than" | "less severe than" | "better than"
     avgMonthsToCatch: number
     impactDescription: string
     severity: string
   }

3. Export function compareToHistoricalCases(citations: Citation[], integrityScore: number): HistoricalComparison

   Logic:
   - Count retractedCount = citations with status "retracted"
   - Count cascadeCount = citations with status "cascade"
   
   - If integrityScore < 50 OR retractedCount >= 3:
     Match the "catastrophic" case from the JSON
     Return: { matchedCase: case.name, similarity: "similar to",
     avgMonthsToCatch: case.avgMonthsToCatch, impactDescription: case.impact,
     severity: "catastrophic" }

   - If integrityScore < 70 OR retractedCount >= 1:
     Match the first "critical" case from the JSON
     Same return shape, severity: "critical"

   - If cascadeCount > 0:
     Match the "high" case
     Return similarity: "less severe than", severity: "moderate"

   - Otherwise: return { matchedCase: "none", similarity: "better than",
     avgMonthsToCatch: 0, impactDescription: "Your bibliography appears clean.",
     severity: "clean" }

The Citation interface:
interface Citation {
  status: "pending" | "checking" | "clean" | "retracted" | "cascade" | "unverified"
}

Add // DOCUMENTATION NOTE: explaining how historical comparison turns a number into
a story that judges will remember.
Add // DEMO MOMENT: on the line where the matched case name is returned.

After writing, test 4 scenarios and print the output:
1. Score 95, 0 retracted
2. Score 65, 1 retracted
3. Score 80, 0 retracted, 2 cascade
4. Score 30, 4 retracted
```

---

## PROMPT 2-D — Main Pipeline Orchestrator

```
I am building RetractWatch V2. This is the most important backend file.
Create lib/pipeline.ts — the main orchestrator that connects all data layer files.

This file must export:
- The Citation interface (defined below)
- async function runPipeline(jobId, citations, updateCitation, updateJob)

Citation interface:
interface Citation {
  id: string
  title: string
  authors: string
  year: number | null
  doi: string | null
  status: "pending" | "checking" | "clean" | "retracted" | "cascade" | "unverified"
  retractionReason?: string
  retractionDate?: string
  retractionCountry?: string
  retractionJournal?: string
  cascadeDepth?: number
  cascadeVia?: string
}

The runPipeline function takes:
- jobId: string
- citations: Citation[]
- updateCitation: (id: string, updates: Partial<Citation>) => Promise<void>
- updateJob: (updates: any) => Promise<void>

It must run FIVE phases in order:

PHASE 1 — DOI RESOLUTION
For each citation without a doi, call resolveDoiFromTitle from lib/crossref.ts
Set status to "checking" while resolving, then save the found doi.
Add sleep(50) between calls.

PHASE 2 — DIRECT RETRACTION CHECK
For each citation:
- Set status to "checking"
- If no doi: set status "unverified", skip
- Call isRetracted(doi) from lib/retractionWatch.ts
- If retracted: set status "retracted", plus retractionReason, retractionDate,
  retractionCountry, retractionJournal from the record
- If clean: set status "clean", add to cleanCitations array
- sleep(100) between each

PHASE 3 — CASCADE CHECK (THE SIGNATURE FEATURE)
For each clean citation with a doi:
- Call getReferences(doi) from lib/semanticScholar.ts
- For each sub-reference with a doi, call isRetracted
- If any sub-reference is retracted: update the parent citation to status "cascade",
  cascadeDepth: 2, cascadeVia: retracted sub-reference title,
  retractionCountry and retractionJournal from the sub-retraction record
- break after the first cascade hit — one is enough

PHASE 4 — REPLACEMENT SEARCH
For all citations with status "retracted" or "cascade":
Call findReplacementPapers(title, year) from lib/exa.ts
Store the results — pass them to updateCitation or log them for now

PHASE 5 — SCORING AND FINAL UPDATE
- Call calculateIntegrityScore(citations) from lib/scoring.ts
- Call compareToHistoricalCases(citations, score) from lib/historicalCases.ts
- Call calculateDownstreamRisk(citations) from lib/downstreamRisk.ts
- Call updateJob with: { status: "complete", integrityScore, historicalComparison,
  downstreamRisk, processedCount: citations.length }

Add a helper: function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

Add // DOCUMENTATION NOTE: at the top explaining all 5 phases in plain English.
Add // DEMO MOMENT: comments at phase 2 (citations turn red), phase 3 (cascade nodes
appear), and phase 5 (score gauge animates).

Do NOT import Convex directly — the updateCitation and updateJob functions are
passed in from outside. This keeps the pipeline testable.

After writing, create a mock test in scripts/testPipeline.ts that passes in
5 fake citations and mock updateCitation/updateJob functions that just console.log
what they receive. Run it and show me the output.
```

---

## PROMPT 2-E — Check API Route (Connects Pipeline to Convex)

```
I am building RetractWatch V2. Create app/api/check/route.ts.

This is a Next.js App Router POST endpoint. It must:

1. Accept JSON body: { citations: Citation[] }
2. Create a new job in Convex using the mutation api.jobs.createJob with:
   { status: "running", totalCitations: citations.length, processedCount: 0,
     createdAt: Date.now() }
3. Get back a jobId
4. Return { jobId } immediately (status 200) — do NOT wait for the pipeline
5. Start runPipeline in the background (no await on the outer call)

Inside the background pipeline call, pass these as updateCitation and updateJob:

updateCitation = async (citationId, updates) => {
  await convex.mutation(api.citations.updateCitation, { citationId, updates })
}

updateJob = async (updates) => {
  await convex.mutation(api.jobs.updateJob, { jobId, updates })
}

Also before running the pipeline, save all citations to Convex:
For each citation call api.citations.createCitation with the citation data + jobId

Import ConvexHttpClient from "convex/browser"
Use: const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

Add // DOCUMENTATION NOTE: explaining why we return jobId immediately (non-blocking)
and why Convex streams results live to the frontend without polling.

NOTE: The Convex mutations (api.jobs.createJob etc.) will be created by Person 3.
For now, add a comment // TODO: Person 3 creates these Convex functions
and stub them out so the file compiles cleanly.
```

---

---

# 🟥 PERSON 3 — FRONTEND SPECIALIST
### Your job: Build the UI, components, and Convex database. Files in `/convex/`, `/components/`, `/app/`. Never touch `/lib/`.

---

## PROMPT 3-A — Convex Database Schema

```
I am building RetractWatch V2. My first task is setting up Convex — our real-time database.

Create convex/schema.ts with this exact content:

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  jobs: defineTable({
    status: v.string(),
    totalCitations: v.number(),
    processedCount: v.number(),
    integrityScore: v.optional(v.number()),
    paperTitle: v.optional(v.string()),
    historicalComparison: v.optional(v.any()),
    downstreamRisk: v.optional(v.any()),
    createdAt: v.number(),
  }),

  citations: defineTable({
    jobId: v.id("jobs"),
    title: v.string(),
    authors: v.string(),
    year: v.optional(v.number()),
    doi: v.optional(v.string()),
    status: v.string(),
    retractionReason: v.optional(v.string()),
    retractionDate: v.optional(v.string()),
    retractionCountry: v.optional(v.string()),
    retractionJournal: v.optional(v.string()),
    cascadeDepth: v.optional(v.number()),
    cascadeVia: v.optional(v.string()),
  }),

  replacements: defineTable({
    citationId: v.id("citations"),
    title: v.string(),
    url: v.string(),
    summary: v.string(),
    publishedDate: v.string(),
    relevanceScore: v.number(),
  }),
})

Then create convex/jobs.ts with these functions:
- createJob(args): insert into jobs table, return new _id as jobId
- getJob(args: { jobId }): return the job record by id
- updateJob(args: { jobId, updates }): patch the job record with updates

Then create convex/citations.ts with these functions:
- createCitation(args): insert into citations table, return new _id
- getCitationsForJob(args: { jobId }): return all citations where citation.jobId == jobId
- updateCitation(args: { citationId, updates }): patch the citation with updates

After writing all three files, run: npx convex dev --once
This regenerates the type-safe API. Tell me if it succeeds or show me the error.

Add a // DOCUMENTATION NOTE: at the top of schema.ts explaining:
"Convex is like a Google Sheet that automatically updates every browser
looking at it — no page refresh needed. We have 3 tables:
jobs (one per analysis), citations (one per reference found),
and replacements (valid alternatives for flagged citations)."
```

---

## PROMPT 3-B — Upload Page (Home Page)

```
I am building RetractWatch V2. Create the home page app/page.tsx.

Design requirements (dark academic theme):
- Dark navy background: #0f172a
- Accent blue: #3b82f6
- Font: clean sans-serif, professional
- Large centered drag-and-drop PDF upload zone with dashed border, glows blue on hover
- Accept only .pdf files
- Below the drop zone: "OR" divider then a textarea "Paste citations here"
- Primary CTA button: "Analyze Bibliography" — large, blue
- Header: 🧬 RetractWatch  (DNA emoji + name)
- Tagline below header: "Detect retracted science before your reviewers do."
- Stats bar: "45,000+ papers tracked · Real-time cascade detection · Trusted by researchers"
- Footer: "Free. No account required. Built for researchers."

Behavior (wire up in code):
1. Use react-dropzone (already installed) for the drop zone
2. On file drop or file select: call handleFileUpload(file)
3. Show loading state: "Extracting references from your paper..."
4. On extract success: show "Found X citations. Starting analysis..."
5. After check API call succeeds: router.push(`/results/${jobId}`)
6. Show error message in red if anything fails
7. "Analyzing Bibliography" button shows a spinner when isLoading = true

The handleFileUpload function must:
- POST the file as FormData to /api/extract
- Parse the { citations, totalFound } response
- POST the citations as JSON to /api/check
- Parse the { jobId } response
- Call router.push with the jobId

Use "use client" at the top. Use useRouter from next/navigation.
Use useState for: isLoading, loadingMessage, error.
Use Tailwind CSS for all styling.

Add // DOCUMENTATION NOTE: at the top explaining what this page does.
Add // DEMO MOMENT: on the line where router.push is called —
this is the transition to the live results during demo.
```

---

## PROMPT 3-C — Results Page

```
I am building RetractWatch V2. Create app/results/[jobId]/page.tsx.

This is the main demo screen — the page that shows live analysis results.

Layout (dark theme, bg-slate-950):
TOP ROW (3 equal columns):
  - Column 1: IntegrityScore component
  - Column 2: HistoricalComparison component
  - Column 3: DownstreamRisk component

MAIN ROW (2 equal columns):
  - Left: CitationFeed component
  - Right: CascadeGraph component

BOTTOM (full width, only shown when job.status === "complete"):
  - ReportDownload component

Data (use Convex real-time queries):
- const job = useQuery(api.jobs.getJob, { jobId: params.jobId })
- const citations = useQuery(api.citations.getCitationsForJob, { jobId: params.jobId })

Import components from:
@/components/IntegrityScore
@/components/CitationFeed
@/components/CascadeGraph
@/components/HistoricalComparison
@/components/DownstreamRisk
@/components/ReportDownload

Show a loading spinner if job or citations are undefined (still loading from Convex).

Show a status bar at the top:
- While running: "🔍 Analyzing {job.processedCount} / {job.totalCitations} citations..."
- When complete: "✅ Analysis complete — {job.totalCitations} citations checked"

Use "use client" at the top.
Add // DOCUMENTATION NOTE: explaining how useQuery from Convex makes the page
update live without any page refresh.
```

---

## PROMPT 3-D — CitationFeed + OriginBadge Components

```
I am building RetractWatch V2. Create two React components:

COMPONENT 1: components/CitationFeed.tsx
Props: { citations: Citation[] }
- Render a scrollable list of all citations
- Each row shows: citation title (truncated to 60 chars), authors, year
- Color-code by status:
  - "clean" → green left border, ✅ icon
  - "retracted" → red left border, 🚨 icon, bold "RETRACTED" badge
  - "cascade" → orange left border, ⚠️ icon, "CASCADE" badge
  - "pending" / "checking" → grey, animated pulse
  - "unverified" → grey, dashed border
- For "retracted" and "cascade" citations: render the OriginBadge component below the title
- If citations array is empty: show "Waiting for citations..."
- Add // DEMO MOMENT: on the map that renders each citation row

COMPONENT 2: components/OriginBadge.tsx
Props: { country?: string, journal?: string, reason?: string }
- Small inline badge component
- Show three pills in a row:
  - 🌍 + country name (or "Unknown") — grey pill
  - 📰 + journal (truncated to 30 chars) — blue pill
  - Reason pill — color by reason:
    - "Fraud" or "Data Fabrication" → red pill
    - "Plagiarism" → orange pill
    - "Error" → yellow pill
    - Anything else → grey pill
- Small font size (text-xs), rounded-full, px-2 py-0.5
- If all props are undefined: return null (don't render anything)

Use Tailwind CSS for styling. Both must be "use client" components.
Add // DOCUMENTATION NOTE: to OriginBadge explaining it is a V2 feature that shows
WHERE bad science came from — turning a database record into a visual story.
```

---

## PROMPT 3-E — IntegrityScore Gauge Component

```
I am building RetractWatch V2. Create components/IntegrityScore.tsx.

Props: { score: number | undefined, status: string }

This component shows an animated circular gauge (like a speedometer or donut chart).

Design:
- Dark card background: bg-slate-800, rounded-xl, p-6
- Large circular SVG gauge in the center
  - Background ring: grey stroke
  - Filled arc: colored stroke based on score
    - 90-100: green (#22c55e)
    - 70-89: amber (#f59e0b)
    - 50-69: red (#ef4444)
    - 0-49: dark red (#7f1d1d)
  - Big number in the center of the gauge: the score (or "--" if undefined)
  - Small label below the number: "INTEGRITY SCORE"
- Label below the gauge: "CLEAN" / "REVIEW RECOMMENDED" / "SIGNIFICANT RISK" / "CRITICAL"
- Description text below label (one sentence)
- If status is NOT "complete": show "Analyzing..." with a subtle pulse animation

The gauge must be built with pure SVG — no chart libraries needed:
- Use a circle with stroke-dasharray and stroke-dashoffset to draw the arc
- When score changes, animate the dashoffset with CSS transition: 1s ease-out
- Full circle = circumference of the ring (2 * Math.PI * radius)
- Fill fraction = score / 100

Add // DOCUMENTATION NOTE: explaining what the integrity score means.
Add // DEMO MOMENT: on the line where stroke-dashoffset is set — 
this is where the gauge needle sweeps dramatically in the demo.
```

---

## PROMPT 3-F — HistoricalComparison + DownstreamRisk Components

```
I am building RetractWatch V2. Create two V2 enhancement components:

COMPONENT 1: components/HistoricalComparison.tsx
Props: { comparison: { matchedCase, similarity, avgMonthsToCatch, impactDescription, severity } | undefined }

Design (dark card: bg-slate-800, rounded-xl, p-4):
- Header: "📚 Historical Context" in small uppercase grey text
- If severity is "clean": show "✅ No historical matches — your bibliography looks clean."
- Otherwise:
  - Large line: "Similar to: {matchedCase}" in bold white
  - Sub-line: "Papers like this took an average of {avgMonthsToCatch} months to catch in peer review"
  - Impact description in smaller grey text
  - Severity badge: color by severity
    - catastrophic → red
    - critical → orange
    - moderate → yellow
    - clean → green
- If comparison is undefined: show a grey pulsing placeholder (skeleton loader)

COMPONENT 2: components/DownstreamRisk.tsx
Props: { risk: { estimatedDownstreamPapers, worstCaseDownstream, riskLevel, explanation } | undefined }

Design (dark card: bg-slate-800, rounded-xl, p-4):
- Header: "📡 Downstream Risk" in small uppercase grey text
- Large number: "~{estimatedDownstreamPapers} papers" colored by riskLevel:
  - low → green
  - moderate → yellow
  - high → orange
  - critical → red
- Explanation text in grey below
- Small text: "Worst case: {worstCaseDownstream} papers"
- If risk is undefined: show grey skeleton loader

Both must be "use client" components using Tailwind CSS.
Add // DOCUMENTATION NOTE: on DownstreamRisk explaining this turns a score
into an emotional, growing threat number — maximum impact for judges.
Add // DEMO MOMENT: on the line that renders estimatedDownstreamPapers —
this is the "340 papers at risk" moment in the demo.
```

---

## PROMPT 3-G — CascadeGraph with D3.js

```
I am building RetractWatch V2. Create components/CascadeGraph.tsx.

This is the most visually impressive component — a network graph showing
contamination chains between citations using D3.js force simulation.

Props: { citations: Citation[] }

Each citation is a node. Color the nodes:
- Green (#22c55e) → status "clean"
- Red (#ef4444) → status "retracted"
- Orange (#f97316) → status "cascade"
- Grey (#475569) → status "pending" or "checking" or "unverified"

Node size: 12px radius for retracted/cascade, 8px for clean, 6px for others.

Draw edges (lines):
- For every cascade citation, draw a grey dashed line from that node
  to a central "Your Paper" node (a special white node in the center)
- For retracted citations, draw a solid red line to the center node

Labels: show shortened title (first 3 words) on hover only — use SVG title element.

Use D3 force simulation:
- forceCenter() to keep nodes from flying off screen
- forceCollide(20) to prevent overlap
- forceLink() for edges
- forceManyBody(-50) for slight repulsion between nodes

The SVG must fill its container (width 100%, height 400px).
On each simulation tick, update node cx/cy and line x1/y1/x2/y2 positions.

Add a legend at the bottom:
🟢 Clean  🔴 Retracted  🟠 Cascade (depth 2)

Use useEffect and useRef from React to initialize D3 after mount.
Use "use client" at the top.
Import * as d3 from "d3"

Add // DOCUMENTATION NOTE: explaining what the graph shows to a non-technical judge.
Add // DEMO MOMENT: on the simulation tick function — this is where the live
animated graph moves during the demo.

If D3 throws any errors, wrap the entire useEffect in try/catch and show
a simple fallback table of flagged citations instead.
```

---

## PROMPT 3-H — PDF Report + Final Polish

```
I am building RetractWatch V2. Two final tasks:

TASK 1: Create components/ReportDownload.tsx
Props: { job: any, citations: Citation[] }

A button that generates and downloads a PDF report using jsPDF (already installed).

The PDF must contain:
Page 1 — Summary:
  - Title: "RetractWatch V2 — Integrity Report"
  - Date generated
  - Integrity Score (large)
  - Historical comparison summary (one line)
  - Downstream risk estimate (one line)

Page 2 — Flagged Citations:
  - Table with columns: Title, Status, Country, Journal, Reason
  - Only show retracted and cascade citations
  - Each row in red (retracted) or orange (cascade)

Page 3 — Replacement Suggestions:
  - For each flagged citation: "Replace: [title]" then list 3 suggested papers

Button design: full-width, bg-blue-600, white text, "⬇️ Download Integrity Report"

Use "use client", import jsPDF dynamically:
const { jsPDF } = await import("jspdf") (do this inside the click handler)

Add // DOCUMENTATION NOTE: explaining that this report is the deliverable researchers
can attach to grant submissions or share with supervisors.

TASK 2: Final App Testing Checklist
After both components are done, check that these work end-to-end:
1. Upload page loads at localhost:3000
2. Dropping a PDF triggers extraction
3. Results page loads at /results/[jobId]
4. Citations appear in the feed in real time (even if slowly)
5. Integrity Score gauge shows a number
6. Historical comparison card shows text
7. Downstream risk shows a number
8. Download button generates a PDF

If any of these fail, show me the exact error and fix it.
```

---

## ⚡ FINAL INTEGRATION PROMPT (All 3 Together — Last 30 Minutes)

```
We are doing the final integration of RetractWatch V2. Three tracks built in parallel
now need to connect.

Person 2: Open app/api/check/route.ts and replace all TODO stubs with real Convex
mutations from convex/jobs.ts and convex/citations.ts (built by Person 3).
The mutations to call are:
- api.jobs.createJob — create a job, get jobId
- api.citations.createCitation — one call per citation, save jobId with it
- api.jobs.updateJob — update when pipeline completes
- api.citations.updateCitation — update as each citation is processed

Person 3: Confirm that the Convex queries in the results page match the exact
function names in convex/jobs.ts and convex/citations.ts:
- api.jobs.getJob({ jobId })
- api.citations.getCitationsForJob({ jobId })

Run the full end-to-end test:
1. Start both terminals: npx convex dev AND npm run dev
2. Open localhost:3000
3. Upload the demo PDF
4. Watch the results page and confirm:
   - Citations appear live in the feed ✅
   - At least one citation turns red (retracted) ✅
   - At least one citation turns orange (cascade) ✅
   - Score gauge shows a number ✅
   - Historical card shows a case name ✅
   - Downstream risk shows a number ✅
   - PDF download works ✅
5. If anything is broken, show me the browser console error and we will fix it.

We have 30 minutes. Prioritize in this order:
1. Citations appearing in the feed (most visible in demo)
2. Score gauge (most impressive)
3. Historical card + Downstream risk (V2 wow factor)
4. PDF download (last)
```

---

*RetractWatch V2 — Flag it. Explain it. Compare it. Fix it.*
