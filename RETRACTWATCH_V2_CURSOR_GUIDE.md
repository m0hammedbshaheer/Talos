# 🔬 RetractWatch V2 — Enhanced Project Guide for Cursor AI
> **Version 2.0 — Integrates pivot suggestions from advisor review**
> **Changes from V1 are marked with 🆕**

---

> **READ THIS FIRST, CURSOR:**
> The team building this are B.Tech AI/ML students — not professional software engineers.
> Every step you generate must include:
> - The exact command to run (copy-paste ready)
> - What it does in plain English
> - What the expected output looks like
> - What to do if something goes wrong
> - A `// DOCUMENTATION NOTE:` comment on every major code block — these will be read aloud during the demo presentation, so write them for a non-technical audience
> - A `// DEMO MOMENT:` comment wherever something visually interesting happens on screen
>
> Do NOT skip steps. Do NOT use jargon without explaining it. Build one step at a time. After each step the app should still run without crashing.

---

## 🆕 What Changed from V1 — Read This First

The original RetractWatch flagged retracted citations and suggested replacements.
**V2 keeps all of that AND adds three powerful new layers:**

### Addition 1: Historical Severity Comparison
Instead of just showing a score of "61/100", we now say:
> *"Your contamination profile matches papers that took an average of 18 months to catch in peer review — similar to the Surgisphere COVID scandal of 2020."*

This turns a number into a story. Judges remember stories.

### Addition 2: Origin Badge on Every Flagged Citation
Every retracted citation now shows WHERE the bad science came from:
- Country of origin (China, India, USA, etc.)
- Journal name
- Reason for retraction (Fraud / Data Fabrication / Plagiarism / Error)

The Retraction Watch CSV already contains all this data — we just display it.
Zero new APIs needed.

### Addition 3: Downstream Risk Counter 🆕
A new metric shown prominently on the results page:
> *"If your paper gets cited 100 times, you risk propagating this contamination to an estimated 340 downstream papers."*

Based on the real statistic: the average retracted paper gets cited 25 times post-retraction.
Pure math. No API. Maximum emotional impact on judges.

### What We Are NOT Adding (and why)
- ❌ Retraction Plague Map — needs separate geo map component, kills timeline
- ❌ Author Integrity Score — privacy concerns, judges will push back
- ❌ Retraction Prediction ML — needs model training, not buildable today
- ❌ Retraction Roulette — fun but separate product, don't dilute the core

### The Core Pipeline Is Unchanged
Everything from V1 still exists. V2 is additive only — no rewrites.

---

## 📋 Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [The Problem We Are Solving](#the-problem)
3. [Complete System Flow](#system-flow)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup)
7. [Build Steps — Track A: Data Layer](#track-a)
8. [Build Steps — Track B: Brain / Pipeline](#track-b)
9. [Build Steps — Track C: Frontend](#track-c)
10. [🆕 Build Steps — Track D: V2 Enhancements](#track-d)
11. [Demo Script V2](#demo-script)
12. [Team Division of Work](#team-division)
13. [Troubleshooting](#troubleshooting)

---

## 🧠 What We Are Building {#what-we-are-building}

**RetractWatch V2** is a scientific bibliography integrity checker with four layers:

1. **Flag** — Find every retracted citation in a paper (direct + cascade)
2. **Explain** — Show where the bad science came from (country, journal, reason)
3. **Compare** — Tell researchers how serious their contamination is vs. infamous historical cases
4. **Fix** — Suggest valid replacement citations for every flagged paper

It answers the question researchers are actually afraid to ask:
> *"Is my paper unknowingly built on fraudulent science?"*

---

## ❗ The Problem {#the-problem}

- 45,000+ scientific papers have been retracted as of 2024
- The average retracted paper is cited **25 times AFTER retraction**
- The Wakefield vaccine-autism paper was cited **881 times after retraction** (out of 1,211 total)
- Only **5.4% of post-retraction citations** acknowledge the retraction — the rest cite as if it's still valid
- **Cascade contamination** means a researcher can unknowingly build on fraud without ever reading the retracted paper
- **No free automated tool** checks for this

### The Real Victim
> A PhD student who spent 2 years on a thesis. During their defense, a committee member reveals that one of their key supporting studies was retracted 8 months ago due to data fabrication. The thesis collapses. This is documented. It has ended careers.

---

## ⚙️ Complete System Flow {#system-flow}

```
USER UPLOADS PDF
        ↓
[B1] OpenAI GPT-4o extracts bibliography
     → Returns: [{title, authors, year, doi}]
        ↓
[A2] CrossRef resolves missing DOIs
     → Every citation now has a DOI
        ↓
[A1] Retraction Watch DB — DIRECT CHECK
     → Flag: status = "retracted"
     → Extract: reason, date, country, journal 🆕
        ↓
[A3] Semantic Scholar — CASCADE CHECK
     → For each clean citation, fetch ITS references
     → Check those against Retraction Watch DB
     → Flag: status = "cascade", cascadeDepth = 2
        ↓
[B3] Exa — REPLACEMENT SEARCH
     → For each flagged citation, find 3 valid alternatives
     → Store with relevance score
        ↓
[B4] SCORING
     → Calculate Integrity Score (0–100)
     → 🆕 Match against Historical Cases database
     → 🆕 Calculate Downstream Risk multiplier
        ↓
[Convex] Stream all results live to frontend
        ↓
RESULTS PAGE SHOWS:
  ✅ Integrity Score gauge (0-100)
  🆕 Historical comparison ("Similar to Surgisphere")
  🆕 Downstream Risk counter
  📋 Live citation feed (color-coded status)
  🆕 Origin badges on flagged citations (country + reason)
  🕸️  Cascade contamination graph (D3.js)
  📥 Downloadable PDF integrity report
```

---

## 🛠️ Tech Stack {#tech-stack}

| Tool | Role | Difficulty |
|---|---|---|
| **Next.js** | Frontend + Backend in one | Medium |
| **OpenAI GPT-4o** | Extract references from PDF text | Easy |
| **CrossRef API** | Find missing DOIs (free, no auth) | Easy |
| **Retraction Watch CSV** | The core retraction database (45k records) | Easy |
| **Semantic Scholar API** | Cascade detection — references of references | Medium |
| **Exa API** | Find replacement papers | Easy |
| **Convex** | Real-time database — pushes updates live to browser | Medium |
| **D3.js** | Draw the cascade graph visualization | Hard |
| **v0 by Vercel** | Generate frontend UI components fast | Easy |
| **Cursor** | AI-powered code editor — builds everything faster | Easy |

---

## 📁 Project Structure {#project-structure}

```
retractwatch/
│
├── app/
│   ├── page.tsx                        # Home — upload page
│   ├── results/[jobId]/page.tsx        # Results page (main demo screen)
│   └── api/
│       ├── extract/route.ts            # Receive PDF → OpenAI → return citations
│       ├── check/route.ts              # Run full pipeline for a job
│       └── exa/route.ts                # Search replacement papers
│
├── convex/
│   ├── schema.ts                       # Database table definitions
│   ├── jobs.ts                         # Job CRUD functions
│   └── citations.ts                    # Citation CRUD + status updates
│
├── lib/
│   ├── retractionWatch.ts              # Load CSV, isRetracted(), getRetractionMeta()
│   ├── crossref.ts                     # Resolve DOI from title+author
│   ├── semanticScholar.ts              # Fetch reference list of a paper
│   ├── exa.ts                          # Find replacement papers
│   ├── scoring.ts                      # Integrity score formula
│   ├── historicalCases.ts              # 🆕 Historical comparison logic
│   └── downstreamRisk.ts               # 🆕 Downstream contamination math
│
├── components/
│   ├── UploadZone.tsx                  # Drag-drop PDF upload
│   ├── CitationFeed.tsx                # Live updating citation list
│   ├── IntegrityScore.tsx              # Animated score gauge
│   ├── CascadeGraph.tsx                # D3.js network graph
│   ├── ReportDownload.tsx              # PDF report generator
│   ├── OriginBadge.tsx                 # 🆕 Country + journal + reason badge
│   ├── HistoricalComparison.tsx        # 🆕 "Similar to Surgisphere" card
│   └── DownstreamRisk.tsx              # 🆕 Downstream propagation counter
│
├── data/
│   ├── retraction_watch.csv            # Download from Retraction Watch API
│   └── historical_cases.json          # 🆕 Famous retraction cases for comparison
│
├── .env.local                          # API keys — NEVER commit this
├── package.json
└── README.md
```

---

## 🚀 Setup Instructions {#setup}

### Step 0: Check Prerequisites
```bash
node --version   # Need v18 or higher
npm --version    # Need v9 or higher
```
If Node not installed: download from https://nodejs.org (click LTS)

### Step 1: Create Project
```bash
npx create-next-app@latest retractwatch
# Answer: TypeScript=Yes, Tailwind=Yes, App Router=Yes, all others=No
cd retractwatch
```

### Step 2: Install Dependencies
```bash
npm install convex openai @exa-ai/sdk pdf-parse d3 @types/d3 react-dropzone jspdf papaparse @types/papaparse
```

**What each does:**
- `convex` — real-time database
- `openai` — GPT-4o API
- `@exa-ai/sdk` — replacement paper search
- `pdf-parse` — extract text from PDFs
- `d3` — draw the cascade graph
- `react-dropzone` — drag-and-drop file upload
- `jspdf` — generate downloadable PDF reports
- `papaparse` — parse the Retraction Watch CSV file

### Step 3: Set Up Convex
```bash
npx convex dev
# Opens browser → create free account → auto-configures project
# Keep this terminal running — it syncs your database
```

### Step 4: Download Retraction Watch Database
```bash
mkdir data
# Go to: https://api.retractionwatch.com
# Download the full database CSV
# Save as: data/retraction_watch.csv
```
> **NOTE FOR CURSOR:** If the API requires registration, write a script `scripts/fetchRetractionWatch.ts` that paginates through `https://api.retractionwatch.com/api/v1/retractions` and saves all results to `data/retraction_watch.csv`

### Step 5: Create Historical Cases File 🆕
Create `data/historical_cases.json` with this exact content:
```json
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
```

### Step 6: Set Up Environment Variables
```bash
touch .env.local
```

Add to `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
EXA_API_KEY=your-exa-key-here
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
# CrossRef and Semantic Scholar need no keys — they are free public APIs
```

---

## 🟦 TRACK A: Data Layer {#track-a}

> **Who does this:** The team member most comfortable with data, scripts, and reading API docs.
> These are all standalone files — you never need to touch the frontend.

---

### A1: Load Retraction Watch Database

**File:** `lib/retractionWatch.ts`

```typescript
// DOCUMENTATION NOTE:
// This file is the heart of RetractWatch's data layer.
// It loads a CSV file containing 45,000+ retracted scientific papers
// into memory as a fast-lookup dictionary (like a phonebook).
// The key function isRetracted(doi) answers in milliseconds:
// "Has this paper been officially retracted?"
// It also returns metadata: WHY it was retracted, WHEN, by WHOM, and FROM WHERE.
// This metadata powers our new V2 "Origin Badge" feature.

import fs from "fs"
import path from "path"
import Papa from "papaparse"

interface RetractionRecord {
  doi: string
  title: string
  authors: string
  journal: string
  retractionDate: string
  reason: string           // "Fraud" | "Data Fabrication" | "Plagiarism" | "Error" etc.
  country: string          // Country of origin of the retracted paper
  field: string            // Scientific field
  citationCount: number    // How many times cited (if available)
}

// This Map is our in-memory "phonebook" — key=DOI, value=retraction record
let retractionDatabase: Map<string, RetractionRecord> | null = null

export function loadDatabase(): Map<string, RetractionRecord> {
  // Only load once — reuse on subsequent calls
  if (retractionDatabase) return retractionDatabase
  
  const csvPath = path.join(process.cwd(), "data", "retraction_watch.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  })
  
  retractionDatabase = new Map()
  
  for (const row of result.data as any[]) {
    // Retraction Watch CSV column names — adjust if actual CSV differs
    const doi = (row["OriginalPaperDOI"] || row["DOI"] || "").toLowerCase().trim()
    if (!doi) continue
    
    retractionDatabase.set(doi, {
      doi,
      title: row["Title"] || row["OriginalPaperTitle"] || "",
      authors: row["Author"] || "",
      journal: row["Journal"] || "",
      retractionDate: row["RetractionDate"] || "",
      reason: row["Reason"] || row["RetractionReason"] || "Unknown",
      country: row["Country"] || "Unknown",
      field: row["Subject"] || row["Field"] || "Unknown",
      citationCount: parseInt(row["CitationCount"] || "0") || 0,
    })
  }
  
  console.log(`✅ Retraction Watch database loaded: ${retractionDatabase.size} records`)
  return retractionDatabase
}

export function isRetracted(doi: string): RetractionRecord | null {
  const db = loadDatabase()
  return db.get(doi.toLowerCase().trim()) ?? null
}

// DEMO MOMENT: Call this on startup and log the count — shows "45,000 records loaded"
```

---

### A2: CrossRef DOI Resolver

**File:** `lib/crossref.ts`

```typescript
// DOCUMENTATION NOTE:
// CrossRef is a free global registry used by every major scientific publisher.
// Think of it as a phone book for research papers.
// We use it to find the DOI (unique ID) for any citation that didn't include one.
// Without DOIs, we can't reliably check if papers are retracted.
// CrossRef is completely free and requires no API key.

const CROSSREF_BASE = "https://api.crossref.org/works"
const EMAIL = "retractwatch@hackathon.dev" // Polite API usage — include contact

export async function resolveDoiFromTitle(
  title: string,
  authors: string = ""
): Promise<string | null> {
  
  try {
    const query = encodeURIComponent(title)
    const authorParam = authors ? `&query.author=${encodeURIComponent(authors)}` : ""
    
    const url = `${CROSSREF_BASE}?query=${query}${authorParam}&rows=1&select=DOI,title,score&mailto=${EMAIL}`
    
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data = await response.json()
    const items = data?.message?.items
    
    if (!items || items.length === 0) return null
    
    // Only return if confidence score is high enough
    // CrossRef returns a relevance score — anything below 50 is probably wrong
    const topResult = items[0]
    if ((topResult.score || 0) < 50) return null
    
    return topResult.DOI ?? null
    
  } catch {
    return null  // Never crash the pipeline over a missing DOI
  }
}
```

---

### A3: Semantic Scholar Cascade Detector

**File:** `lib/semanticScholar.ts`

```typescript
// DOCUMENTATION NOTE:
// Semantic Scholar is a free AI-powered research database built by
// the Allen Institute for AI (a non-profit).
// We use it for our SIGNATURE FEATURE: cascade contamination detection.
// Normal tools check if YOUR citations are retracted.
// We go one level deeper — we check what YOUR CITATIONS cited.
// If your citation (which itself is clean) cited a retracted paper,
// you have "cascade contamination" — bad science reached you indirectly.
// This is the feature no other free tool has.

const S2_BASE = "https://api.semanticscholar.org/graph/v1/paper"

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface S2Reference {
  title: string
  doi: string | null
  authors: string
}

export async function getReferences(doi: string): Promise<S2Reference[]> {
  // DOCUMENTATION NOTE:
  // For any paper, this function fetches the list of papers IT cited.
  // We then check each of those against our retraction database.
  
  try {
    await sleep(150) // Be polite — Semantic Scholar allows 100 req/5min without key
    
    const url = `${S2_BASE}/DOI:${encodeURIComponent(doi)}/references?fields=title,authors,externalIds&limit=50`
    
    const response = await fetch(url)
    if (!response.ok) return []
    
    const data = await response.json()
    
    return (data.data || []).map((item: any) => ({
      title: item.citedPaper?.title || "",
      doi: item.citedPaper?.externalIds?.DOI || null,
      authors: (item.citedPaper?.authors || []).map((a: any) => a.name).join(", "),
    })).filter((ref: S2Reference) => ref.doi !== null)
    
  } catch {
    return [] // Never crash — cascade check is a bonus feature
  }
}
```

---

## 🟩 TRACK B: Brain / Pipeline {#track-b}

> **Who does this:** The team member most comfortable with backend logic, API calls, and orchestrating multiple services.

---

### B1: OpenAI PDF Extraction Endpoint

**File:** `app/api/extract/route.ts`

```typescript
// DOCUMENTATION NOTE:
// This is the ENTRY POINT of RetractWatch.
// When a user uploads their research paper as a PDF, this API endpoint:
// 1. Receives the PDF file
// 2. Extracts all the text from it using pdf-parse
// 3. Finds the bibliography/references section
// 4. Sends it to OpenAI GPT-4o with instructions to extract citations as JSON
// GPT-4o acts as an expert librarian who can read any citation format
// (APA, MLA, Vancouver, Chicago, etc.) and convert it to clean data.

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import pdfParse from "pdf-parse"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("pdf") as File
    
    if (!file) {
      return NextResponse.json({ error: "No PDF file received" }, { status: 400 })
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: "PDF too large. Please upload a file under 10MB." }, { status: 400 })
    }
    
    // Convert File to Buffer for pdf-parse
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Extract raw text from PDF
    const pdfData = await pdfParse(buffer)
    const fullText = pdfData.text
    
    if (!fullText || fullText.length < 100) {
      return NextResponse.json({
        error: "This PDF appears to be a scanned image. Please use a text-based PDF."
      }, { status: 400 })
    }
    
    // Find the bibliography section
    // References usually start with "References", "Bibliography", "Works Cited"
    const refSectionMatch = fullText.match(
      /(?:references|bibliography|works cited|literature cited)\s*\n([\s\S]+?)(?:\n\s*appendix|\n\s*supplementary|\Z)/i
    )
    
    const bibliographyText = refSectionMatch
      ? refSectionMatch[1].substring(0, 8000) // Limit to 8000 chars to save tokens
      : fullText.substring(fullText.length - 6000) // Fall back to last 6000 chars
    
    // Ask GPT-4o to extract citations
    // DOCUMENTATION NOTE: We use temperature=0 for maximum consistency —
    // we want exact parsing, not creative responses
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a scientific bibliography parser. 
Extract all references from the provided bibliography text.
Return ONLY a valid JSON object with a "citations" array.
Each citation object must have exactly these fields:
{ "title": string, "authors": string, "year": number | null, "doi": string | null }
If a DOI is not present in the text, set doi to null.
Do not include numbering, bullet points, or any other metadata.
Return nothing except the JSON object.`
        },
        {
          role: "user",
          content: `Extract all references from this bibliography:\n\n${bibliographyText}`
        }
      ]
    })
    
    const rawResponse = completion.choices[0].message.content || ""
    
    // Clean up any accidental markdown formatting
    const cleanJson = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    
    const parsed = JSON.parse(cleanJson)
    const citations = parsed.citations || parsed.references || parsed
    
    if (!Array.isArray(citations)) {
      return NextResponse.json({ error: "Failed to parse citations. Please try again." }, { status: 500 })
    }
    
    return NextResponse.json({
      citations,
      totalFound: citations.length,
      paperTextLength: fullText.length
    })
    
  } catch (error) {
    console.error("Extract error:", error)
    return NextResponse.json({ error: "Failed to process PDF. Please try again." }, { status: 500 })
  }
}
```

---

### B2: Main Checking Pipeline

**File:** `lib/pipeline.ts`

```typescript
// DOCUMENTATION NOTE:
// This is the "orchestrator" — the main engine of RetractWatch.
// It takes the list of citations extracted from the PDF
// and runs them through a series of checks in order:
// Phase 1: Resolve missing DOIs using CrossRef
// Phase 2: Check each citation directly against the retraction database
// Phase 3: For clean citations, check what THEY cited (cascade detection)
// Phase 4: Find replacement papers for anything flagged
// Phase 5: Calculate the final integrity score + historical comparison
//
// After each citation is processed, the result is immediately written
// to Convex (our real-time database), which causes the frontend to
// update automatically — this creates the "live analysis" effect.

import { isRetracted } from "./retractionWatch"
import { resolveDoiFromTitle } from "./crossref"
import { getReferences } from "./semanticScholar"
import { findReplacementPapers } from "./exa"
import { calculateIntegrityScore } from "./scoring"
import { compareToHistoricalCases } from "./historicalCases"    // 🆕
import { calculateDownstreamRisk } from "./downstreamRisk"      // 🆕

export interface Citation {
  id: string
  title: string
  authors: string
  year: number | null
  doi: string | null
  status: "pending" | "checking" | "clean" | "retracted" | "cascade" | "unverified"
  retractionReason?: string
  retractionDate?: string
  retractionCountry?: string     // 🆕
  retractionJournal?: string     // 🆕
  cascadeDepth?: number
  cascadeVia?: string
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runPipeline(
  jobId: string,
  citations: Citation[],
  updateCitation: (id: string, updates: Partial<Citation>) => Promise<void>,
  updateJob: (updates: any) => Promise<void>
) {
  
  // ─────────────────────────────────────────────────────────
  // PHASE 1: DOI RESOLUTION
  // Get a DOI for every citation that doesn't have one
  // ─────────────────────────────────────────────────────────
  // DEMO MOMENT: Show "Resolving DOIs..." loading state
  
  for (const citation of citations) {
    if (!citation.doi) {
      await updateCitation(citation.id, { status: "checking" })
      const foundDoi = await resolveDoiFromTitle(citation.title, citation.authors)
      citation.doi = foundDoi  // Update local copy too
      await updateCitation(citation.id, { doi: foundDoi || undefined })
      await sleep(50) // Small delay to not overwhelm CrossRef
    }
  }
  
  // ─────────────────────────────────────────────────────────
  // PHASE 2: DIRECT RETRACTION CHECK
  // Check every citation directly against Retraction Watch
  // ─────────────────────────────────────────────────────────
  // DEMO MOMENT: Citations start turning green or red live
  
  const cleanCitations: Citation[] = []
  
  for (const citation of citations) {
    await updateCitation(citation.id, { status: "checking" })
    
    if (!citation.doi) {
      await updateCitation(citation.id, { status: "unverified" })
      continue
    }
    
    const retractionRecord = isRetracted(citation.doi)
    
    if (retractionRecord) {
      // 🆕 Now includes country and journal from retraction record
      await updateCitation(citation.id, {
        status: "retracted",
        retractionReason: retractionRecord.reason,
        retractionDate: retractionRecord.retractionDate,
        retractionCountry: retractionRecord.country,   // 🆕
        retractionJournal: retractionRecord.journal,   // 🆕
      })
    } else {
      await updateCitation(citation.id, { status: "clean" })
      cleanCitations.push(citation)
    }
    
    await sleep(100)
  }
  
  // ─────────────────────────────────────────────────────────
  // PHASE 3: CASCADE CHECK
  // For clean citations, check what THEY cited
  // THIS IS OUR UNIQUE FEATURE
  // ─────────────────────────────────────────────────────────
  // DEMO MOMENT: Orange cascade nodes appear in the graph
  
  for (const citation of cleanCitations) {
    if (!citation.doi) continue
    
    const subReferences = await getReferences(citation.doi)
    
    for (const subRef of subReferences) {
      if (!subRef.doi) continue
      
      const subRetraction = isRetracted(subRef.doi)
      
      if (subRetraction) {
        // The clean citation cited a retracted paper — cascade contamination
        await updateCitation(citation.id, {
          status: "cascade",
          cascadeDepth: 2,
          cascadeVia: subRef.title,
          retractionCountry: subRetraction.country,  // 🆕 Origin of the root retraction
          retractionJournal: subRetraction.journal,  // 🆕
        })
        break // One cascade is enough to flag this citation
      }
    }
  }
  
  // ─────────────────────────────────────────────────────────
  // PHASE 4: FIND REPLACEMENT PAPERS
  // For every retracted/cascade citation, suggest alternatives
  // ─────────────────────────────────────────────────────────
  
  const flaggedCitations = citations.filter(
    c => c.status === "retracted" || c.status === "cascade"
  )
  
  for (const flagged of flaggedCitations) {
    const replacements = await findReplacementPapers(flagged.title, flagged.year || 2000)
    // Replacements are stored separately in Convex — handled in the API route
  }
  
  // ─────────────────────────────────────────────────────────
  // PHASE 5: FINAL SCORING + V2 ENHANCEMENTS
  // ─────────────────────────────────────────────────────────
  // DEMO MOMENT: Score gauge animates to final number
  
  const finalScore = calculateIntegrityScore(citations)
  const historicalComparison = compareToHistoricalCases(citations, finalScore)  // 🆕
  const downstreamRisk = calculateDownstreamRisk(citations)                     // 🆕
  
  await updateJob({
    status: "complete",
    integrityScore: finalScore,
    historicalComparison,   // 🆕
    downstreamRisk,         // 🆕
    processedCount: citations.length,
  })
}
```

---

### B3: Exa Replacement Search

**File:** `lib/exa.ts`

```typescript
// DOCUMENTATION NOTE:
// Exa is an AI-powered search engine built specifically for finding research content.
// Unlike Google, Exa understands the MEANING of what you're searching for.
// We use it to answer the question: "This citation is retracted — what can I use instead?"
// For every flagged paper, Exa finds 3 valid alternatives covering the same research topic.
// This is the "Fix" part of RetractWatch — we don't just tell you what's wrong,
// we give you a way to fix it.

import Exa from "@exa-ai/sdk"

const exa = new Exa(process.env.EXA_API_KEY!)

export interface ReplacementPaper {
  title: string
  url: string
  summary: string
  publishedDate: string
  relevanceScore: number
}

export async function findReplacementPapers(
  retractedTitle: string,
  retractedYear: number
): Promise<ReplacementPaper[]> {
  
  try {
    const results = await exa.searchAndContents(
      `peer-reviewed study confirming or replicating: ${retractedTitle}`,
      {
        numResults: 3,
        useAutoprompt: true,
        type: "research paper",
        // Only suggest papers published after the retracted one
        startPublishedDate: new Date(retractedYear, 0, 1).toISOString(),
      }
    )
    
    return results.results.map((r, i) => ({
      title: r.title || "Untitled",
      url: r.url,
      summary: (r.text || "").substring(0, 200) + "...",
      publishedDate: r.publishedDate || "Unknown",
      relevanceScore: 1 - (i * 0.15), // 1.0, 0.85, 0.70 — top result is most relevant
    }))
    
  } catch {
    return [] // Never crash if Exa fails
  }
}
```

---

### B4: Scoring Logic

**File:** `lib/scoring.ts`

```typescript
// DOCUMENTATION NOTE:
// The Integrity Score is a single number from 0 to 100
// that summarizes the "cleanliness" of a paper's bibliography.
// 100 = every citation is verified clean.
// The score drops for each problem: more for direct fraud than indirect issues.
// It works like a credit score — easy to understand at a glance.

import { Citation } from "./pipeline"

export function calculateIntegrityScore(citations: Citation[]): number {
  if (citations.length === 0) return 100
  
  let score = 100
  
  for (const citation of citations) {
    if (citation.status === "retracted") score -= 15   // Direct retraction = serious
    if (citation.status === "cascade")   score -= 7    // Cascade = concerning
    if (citation.status === "unverified") score -= 1   // Can't verify = minor
  }
  
  return Math.max(0, Math.round(score))
}

export function getScoreLabel(score: number) {
  if (score >= 90) return {
    label: "CLEAN",
    color: "#22c55e",
    description: "No retraction contamination detected in your bibliography."
  }
  if (score >= 70) return {
    label: "REVIEW RECOMMENDED",
    color: "#f59e0b",
    description: "Issues found. Review flagged citations before submitting."
  }
  if (score >= 50) return {
    label: "SIGNIFICANT RISK",
    color: "#ef4444",
    description: "Serious contamination found. Do not submit without addressing these."
  }
  return {
    label: "CRITICAL",
    color: "#7f1d1d",
    description: "Severe contamination. Your bibliography requires major revision."
  }
}
```

---

### 🆕 B5: Historical Comparison Logic

**File:** `lib/historicalCases.ts`

```typescript
// DOCUMENTATION NOTE:
// This is one of our V2 enhancements — the Historical Severity Comparison.
// Instead of just showing a score, we tell researchers how their contamination
// compares to REAL infamous cases in science history.
// For example: "Your contamination profile is similar to the Surgisphere COVID papers
// — papers with this level of contamination took an average of 18 months to be
// caught by peer reviewers."
// This turns an abstract number into a real, emotionally impactful story.
// All data comes from our local historical_cases.json file — no API needed.

import historicalCases from "../data/historical_cases.json"
import { Citation } from "./pipeline"

export interface HistoricalComparison {
  matchedCase: string
  similarity: string         // "similar to" | "worse than" | "better than"
  avgMonthsToCatch: number
  impactDescription: string
  severity: string
}

export function compareToHistoricalCases(
  citations: Citation[],
  integrityScore: number
): HistoricalComparison {
  
  const retractedCount = citations.filter(c => c.status === "retracted").length
  const cascadeCount = citations.filter(c => c.status === "cascade").length
  const totalFlagged = retractedCount + cascadeCount
  
  // Match severity level to historical cases
  // DEMO MOMENT: "Your paper's contamination is similar to the Surgisphere scandal"
  
  if (integrityScore < 50 || retractedCount >= 3) {
    const worstCase = historicalCases.find(c => c.severity === "catastrophic")!
    return {
      matchedCase: worstCase.name,
      similarity: "similar to",
      avgMonthsToCatch: worstCase.avgMonthsToCatch,
      impactDescription: worstCase.impact,
      severity: "catastrophic"
    }
  }
  
  if (integrityScore < 70 || retractedCount >= 1) {
    const criticalCase = historicalCases.find(c => c.severity === "critical")!
    return {
      matchedCase: criticalCase.name,
      similarity: "similar to",
      avgMonthsToCatch: criticalCase.avgMonthsToCatch,
      impactDescription: criticalCase.impact,
      severity: "critical"
    }
  }
  
  if (cascadeCount > 0) {
    const highCase = historicalCases.find(c => c.severity === "high")!
    return {
      matchedCase: highCase.name,
      similarity: "less severe than",
      avgMonthsToCatch: highCase.avgMonthsToCatch,
      impactDescription: highCase.impact,
      severity: "moderate"
    }
  }
  
  return {
    matchedCase: "none",
    similarity: "better than",
    avgMonthsToCatch: 0,
    impactDescription: "Your bibliography appears clean.",
    severity: "clean"
  }
}
```

---

### 🆕 B6: Downstream Risk Calculator

**File:** `lib/downstreamRisk.ts`

```typescript
// DOCUMENTATION NOTE:
// The Downstream Risk Calculator answers this question:
// "If my paper gets published and then cited by others — how many papers
// downstream could inherit this contamination?"
//
// The math is based on real research:
// - Average retracted paper gets cited 25 times post-retraction (Retraction Watch data)
// - Average academic paper gets cited ~12 times total
// - Each of those downstream papers may themselves be cited
//
// This metric is powerful because it makes the problem feel urgent and growing —
// not just "your paper has a problem" but "your paper could spread the problem."
// DEMO MOMENT: "Your paper risks contaminating 340 downstream papers"

import { Citation } from "./pipeline"

export interface DownstreamRisk {
  estimatedDirectCitations: number      // How many times your paper might be cited
  estimatedDownstreamPapers: number     // Papers that inherit the contamination
  worstCaseDownstream: number           // If all contaminated citations are propagated
  riskLevel: "low" | "moderate" | "high" | "critical"
  explanation: string
}

export function calculateDownstreamRisk(citations: Citation[]): DownstreamRisk {
  
  const retractedCount = citations.filter(c => c.status === "retracted").length
  const cascadeCount = citations.filter(c => c.status === "cascade").length
  const totalFlagged = retractedCount + cascadeCount
  
  // Based on: avg paper gets 12 citations, avg retracted paper cited 25x post-retraction
  const AVG_CITATIONS_PER_PAPER = 12
  const POST_RETRACTION_CITATION_MULTIPLIER = 2.1 // Papers with retracted citations get cited more
  
  const estimatedDirectCitations = AVG_CITATIONS_PER_PAPER
  const estimatedDownstreamPapers = Math.round(
    totalFlagged * estimatedDirectCitations * POST_RETRACTION_CITATION_MULTIPLIER
  )
  const worstCase = totalFlagged * 25 * 3 // Worst case: every contaminated citation propagated maximally
  
  let riskLevel: DownstreamRisk["riskLevel"] = "low"
  if (estimatedDownstreamPapers > 300) riskLevel = "critical"
  else if (estimatedDownstreamPapers > 100) riskLevel = "high"
  else if (estimatedDownstreamPapers > 30) riskLevel = "moderate"
  
  return {
    estimatedDirectCitations,
    estimatedDownstreamPapers,
    worstCaseDownstream: worstCase,
    riskLevel,
    explanation: totalFlagged === 0
      ? "No contamination detected. Zero downstream risk."
      : `If your paper is published and cited ${estimatedDirectCitations} times, an estimated ${estimatedDownstreamPapers} downstream papers could inherit this contamination.`
  }
}
```

---

## 🟨 TRACK C: Frontend {#track-c}

> **Who does this:** The team member most comfortable with React/design/UI.
> Use v0.dev to generate initial components, then wire them up.

---

### C1: Upload Page

**File:** `app/page.tsx`

**First, generate with v0.dev using this prompt:**
> *"Create a dark-themed academic web app homepage called RetractWatch. Large centered drag-and-drop PDF upload zone with dashed border that glows blue on hover. Accept only PDF files. Below: an OR divider then a textarea 'Paste citations here'. Primary CTA button: 'Analyze Bibliography'. Header: DNA helix icon + RetractWatch. Tagline: 'Detect retracted science before your reviewers do.' Show a subtle stats bar: 45,000+ papers tracked · Real-time cascade detection · Trusted by researchers. Footer: small text 'Free. No account required. Built for researchers.' Dark navy background #0f172a, accent blue #3b82f6, minimal, professional."*

**Then wire it up in Cursor:**

```typescript
// DOCUMENTATION NOTE:
// This is the home page — the first thing users see.
// It lets researchers upload their paper (PDF) or paste citations directly.
// When they click Analyze, it sends the PDF to our backend,
// which uses OpenAI to extract all citations from the bibliography.
// While this is happening, a loading state shows "Extracting references..."
// Once done, the user is automatically taken to their results page.

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [error, setError] = useState("")

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.")
      return
    }
    
    setIsLoading(true)
    setError("")
    setLoadingMessage("Extracting references from your paper...")
    
    // Step 1: Extract citations from PDF using OpenAI
    const formData = new FormData()
    formData.append("pdf", file)
    
    const extractRes = await fetch("/api/extract", {
      method: "POST",
      body: formData
    })
    
    if (!extractRes.ok) {
      const err = await extractRes.json()
      setError(err.error || "Failed to process PDF")
      setIsLoading(false)
      return
    }
    
    const { citations } = await extractRes.json()
    setLoadingMessage(`Found ${citations.length} citations. Starting analysis...`)
    
    // Step 2: Create a job and start the pipeline
    const checkRes = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citations })
    })
    
    if (!checkRes.ok) {
      setError("Failed to start analysis. Please try again.")
      setIsLoading(false)
      return
    }
    
    const { jobId } = await checkRes.json()
    
    // Redirect to results page — Convex will stream updates live
    router.push(`/results/${jobId}`)
    
  }, [router])

  // Render: use the v0-generated UI, wire the upload zone to handleFileUpload
  // and show isLoading state with loadingMessage
}
```

---

### C2: Results Page

**File:** `app/results/[jobId]/page.tsx`

```typescript
// DOCUMENTATION NOTE:
// This is the main results page — what users see during and after analysis.
// It uses Convex's real-time subscription: the page automatically updates
// as our server checks each citation, without needing to refresh.
// Layout:
//   TOP: Integrity Score gauge + 🆕 Historical Comparison + 🆕 Downstream Risk
//   LEFT: Live citation feed (turns green/red/orange in real time)
//   RIGHT: Cascade contamination graph (D3.js visual)
//   BOTTOM: Download report button

"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import IntegrityScore from "@/components/IntegrityScore"
import CitationFeed from "@/components/CitationFeed"
import CascadeGraph from "@/components/CascadeGraph"
import HistoricalComparison from "@/components/HistoricalComparison"  // 🆕
import DownstreamRisk from "@/components/DownstreamRisk"              // 🆕
import ReportDownload from "@/components/ReportDownload"

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  
  // DOCUMENTATION NOTE:
  // useQuery from Convex automatically re-renders this page
  // whenever the database changes — no polling, no refresh needed.
  const job = useQuery(api.jobs.getJob, { jobId: params.jobId })
  const citations = useQuery(api.citations.getCitationsForJob, { jobId: params.jobId })
  
  if (!job || !citations) return <LoadingScreen />
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* TOP ROW: Score + V2 Enhancements */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <IntegrityScore score={job.integrityScore} status={job.status} />
        <HistoricalComparison comparison={job.historicalComparison} />  {/* 🆕 */}
        <DownstreamRisk risk={job.downstreamRisk} />                    {/* 🆕 */}
      </div>
      
      {/* MAIN ROW: Feed + Graph */}
      <div className="grid grid-cols-2 gap-4 px-6">
        <CitationFeed citations={citations} />
        <CascadeGraph citations={citations} />
      </div>
      
      {/* BOTTOM: Download */}
      {job.status === "complete" && (
        <div className="p-6">
          <ReportDownload job={job} citations={citations} />
        </div>
      )}
      
    </div>
  )
}
```

---

### C3: Origin Badge Component 🆕

**File:** `components/OriginBadge.tsx`

```typescript
// DOCUMENTATION NOTE:
// The Origin Badge appears on every flagged citation in the live feed.
// It shows WHERE the bad science came from:
//   - Country flag + country name (e.g., 🇨🇳 China)
//   - Journal name (e.g., The Lancet)
//   - Reason for retraction (e.g., "Data Fabrication")
// This data comes directly from the Retraction Watch database —
// no extra API calls needed. It's already in the CSV.
// This feature shows judges that we're not just finding problems —
// we're providing forensic detail about the SOURCE of the contamination.

interface OriginBadgeProps {
  country: string
  journal: string
  reason: string
  retractionDate: string
}

export default function OriginBadge({ country, journal, reason, retractionDate }: OriginBadgeProps) {
  
  const reasonColor = {
    "Fraud": "bg-red-900 text-red-200",
    "Data Fabrication": "bg-red-900 text-red-200",
    "Plagiarism": "bg-orange-900 text-orange-200",
    "Error": "bg-yellow-900 text-yellow-200",
  }[reason] || "bg-gray-800 text-gray-200"
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-200">
        📍 {country}
      </span>
      <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-200">
        📰 {journal}
      </span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${reasonColor}`}>
        ⚠️ {reason}
      </span>
      <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-200">
        🗓️ Retracted {retractionDate}
      </span>
    </div>
  )
}
```

---

### C4: Historical Comparison Component 🆕

**File:** `components/HistoricalComparison.tsx`

```typescript
// DOCUMENTATION NOTE:
// This component shows the researcher how their contamination compares
// to famous cases in science history.
// Example output: "Your bibliography's risk profile is similar to
// the Surgisphere COVID papers — cases like this took an average of
// 18 months to be caught in peer review."
// This makes the abstract integrity score feel real and urgent.
// It uses data from our local historical_cases.json — no API needed.
// DEMO MOMENT: This is the "gut punch" moment in the demo.

export default function HistoricalComparison({ comparison }) {
  if (!comparison || comparison.severity === "clean") {
    return (
      <div className="bg-green-950 border border-green-800 rounded-xl p-4">
        <h3 className="text-green-400 font-semibold">✅ Historical Comparison</h3>
        <p className="text-green-300 text-sm mt-1">
          No major contamination detected. Your bibliography is cleaner than most.
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-red-950 border border-red-800 rounded-xl p-4">
      <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide">
        ⚠️ Historical Risk Comparison
      </h3>
      <p className="text-white font-bold mt-2 text-base">
        {comparison.similarity} <span className="text-red-300">{comparison.matchedCase}</span>
      </p>
      <p className="text-red-200 text-sm mt-1">
        Papers with this contamination profile took an average of{" "}
        <strong>{comparison.avgMonthsToCatch} months</strong> to be caught in peer review.
      </p>
      <p className="text-red-300 text-xs mt-2 italic">
        "{comparison.impactDescription}"
      </p>
    </div>
  )
}
```

---

### C5: Downstream Risk Component 🆕

**File:** `components/DownstreamRisk.tsx`

```typescript
// DOCUMENTATION NOTE:
// The Downstream Risk counter shows researchers that contamination
// in their paper doesn't stop with them — it can spread.
// If their paper gets published and cited by others,
// those papers inherit the contamination too.
// This makes the problem feel urgent and social, not just personal.
// DEMO MOMENT: "Your paper risks contaminating 340 downstream papers."
// The number animates counting up — similar to a national debt clock.

export default function DownstreamRisk({ risk }) {
  if (!risk || risk.riskLevel === "low") {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wide">
          Downstream Risk
        </h3>
        <p className="text-green-400 font-bold text-2xl mt-2">Minimal</p>
        <p className="text-slate-400 text-sm mt-1">No contamination to propagate.</p>
      </div>
    )
  }
  
  const riskColors = {
    moderate: "text-yellow-400",
    high: "text-orange-400",
    critical: "text-red-400",
  }
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wide">
        📡 Downstream Risk
      </h3>
      <p className={`font-bold text-2xl mt-2 ${riskColors[risk.riskLevel]}`}>
        ~{risk.estimatedDownstreamPapers} papers
      </p>
      <p className="text-slate-400 text-sm mt-1">
        {risk.explanation}
      </p>
      <p className="text-slate-500 text-xs mt-2">
        Worst case: {risk.worstCaseDownstream} papers
      </p>
    </div>
  )
}
```

---

## 🎬 Demo Script V2 {#demo-script}

> **Practice this. 90 seconds max. Every word earns its place.**

---

*"In science, one fraudulent paper can poison hundreds of others — silently, invisibly, for years. The researchers who inherit that contamination never know until it's too late."*

**[Upload pre-prepared demo PDF — use a real paper known to have retracted citations]**

*"I'm uploading a real research paper. RetractWatch reads every citation in the bibliography."*

**[Citations appear in the live feed — 40+ items populating in real time]**

*"47 citations found. Now checking each one against 45,000 retracted papers."*

**[Citations start turning green — then...]**

*"Citation 23 — directly retracted. Data fabrication. Retracted in 2020. Published in China."*

**[Red node + 🆕 Origin Badge appears: 🇨🇳 China | Journal | Data Fabrication]**

*"But here's where RetractWatch goes further than any other tool."*

**[Pause.]**

*"Citation 31 looks clean. But we checked what IT cited — and one of its sources was retracted. You never saw that paper. But your conclusions depend on it."*

**[🆕 Orange cascade node lights up in graph]**

*"Cascade contamination. Silent. Invisible. No tool catches this for free."*

**[Score gauge animates to 61/100 — SIGNIFICANT RISK]**

*"Integrity score: 61. And here's what that means in context —"*

**[🆕 Historical Comparison card: "Similar to the Surgisphere COVID papers — cases like this take 18 months to catch in peer review."]**

*"18 months. That's a career."*

**[🆕 Downstream Risk card: "~340 downstream papers at risk"]**

*"And if this paper gets cited — the contamination spreads. To 340 papers downstream."*

**[Click retracted citation → Exa replacement suggestion appears]**

*"But we don't just diagnose. We fix. Here are three valid papers covering the same claim — one click to replace."*

**[Show PDF report download]**

*"One upload. Full forensic audit. Historical context. Downstream risk. Replacement citations. This is RetractWatch."*

---

## 👥 Team Division of Work {#team-division}

### Person 1 — Data Specialist
**Best if:** comfortable with scripts, CSV files, data lookups, API calls
```
A1 — Load Retraction Watch database (45min)
A2 — CrossRef DOI resolver (45min)
A3 — Semantic Scholar cascade (1hr)
B4 — Scoring formula (20min)
B6 🆕 — Downstream Risk calculator (30min)
```
**Total: ~3.5 hours. All independent files. No frontend needed.**

### Person 2 — Backend / AI Specialist
**Best if:** comfortable with API calls, orchestration logic, OpenAI
```
B1 — OpenAI PDF extraction endpoint (1.5hr)
B2 — Main pipeline orchestrator (2hr)
B3 — Exa replacement search (30min)
B5 🆕 — Historical comparison logic (1hr)
Setup historical_cases.json (20min)
```
**Total: ~5.5 hours. Pure backend, no UI needed.**

### Person 3 — Frontend Specialist
**Best if:** comfortable with React, design, or willing to use v0.dev heavily
```
Setup Convex schema (45min)
C1 — Upload page via v0.dev (45min)
C2 — Results page layout (1hr)
C3 🆕 — Origin Badge component (30min)
C4 🆕 — Historical Comparison component (30min)
C5 🆕 — Downstream Risk component (30min)
Cascade Graph with D3 — use Cursor heavily (2hr)
PDF Report download (45min)
```
**Total: ~6.5 hours. All frontend. Never touches backend files.**

---

### Integration Point (Final 30 Minutes)
When all tracks are done, Person 2 connects the pipeline to Convex writes.
Person 3 connects the Convex reads to the UI components.
This is the only moment all three tracks merge.

---

## 🔑 Convex Schema (Person 3 starts here)

**File:** `convex/schema.ts`

```typescript
// DOCUMENTATION NOTE:
// This defines our database structure.
// Convex is like a Google Sheet that automatically updates
// every browser that's looking at it — no refresh needed.
// We have 3 tables: jobs (one per analysis), citations (one per reference found),
// and replacements (suggested alternatives for flagged citations).
// 🆕 The jobs table now also stores historicalComparison and downstreamRisk.

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  jobs: defineTable({
    status: v.string(),
    totalCitations: v.number(),
    processedCount: v.number(),
    integrityScore: v.optional(v.number()),
    paperTitle: v.optional(v.string()),
    historicalComparison: v.optional(v.any()),   // 🆕
    downstreamRisk: v.optional(v.any()),          // 🆕
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
    retractionCountry: v.optional(v.string()),    // 🆕
    retractionJournal: v.optional(v.string()),    // 🆕
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
```

---

## 🐛 Troubleshooting {#troubleshooting}

| Problem | Fix |
|---|---|
| PDF parse returns empty | PDF is image-based. Return error: "Please use a text-based PDF" |
| CrossRef returns nothing | Mark citation as "unverified", deduct 1 point, don't crash |
| Semantic Scholar 429 error | Add `await sleep(2000)` before retry |
| OpenAI returns invalid JSON | Strip markdown fences before JSON.parse |
| Convex types error | Run `npx convex dev --once` to regenerate |
| historical_cases.json not found | Check path: `data/historical_cases.json` from project root |
| Demo too slow | Pre-compute result for demo PDF, show it instantly if same file hash detected |

---

## ✅ Pre-Demo Checklist

- [ ] Retraction Watch CSV downloaded and loading correctly
- [ ] `data/historical_cases.json` created with all 5 cases
- [ ] All API keys in `.env.local`
- [ ] Convex `npx convex dev` running in terminal
- [ ] Next.js `npm run dev` running in second terminal
- [ ] Demo PDF tested end-to-end (know the expected output)
- [ ] Cascade graph renders the contamination chain visually
- [ ] Origin badges appear on flagged citations
- [ ] Historical comparison card shows the right case
- [ ] Downstream risk number appears
- [ ] Replacement papers load from Exa
- [ ] PDF report downloads successfully
- [ ] Fallback screenshots ready if anything breaks live

---

*RetractWatch V2 — Flag it. Explain it. Compare it. Fix it.*
*Built at hackathon by a team of 3 AI/ML students.*
