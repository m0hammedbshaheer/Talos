// DOCUMENTATION NOTE:
// This simulates the full AI pipeline without external dependencies.

// -----------------------------------------------------------------------------
// Mock helpers (no imports from other lib modules)
// -----------------------------------------------------------------------------

async function resolveDoiFromTitle(title: string): Promise<string> {
  return "mock-doi-" + Math.random().toString(36).slice(2);
}

async function isRetracted(doi: string) {
  if (Math.random() < 0.2) {
    return {
      reason: "Simulated fraud",
      date: "2022",
      country: "Unknown",
      journal: "Mock Journal",
    };
  }
  return null;
}

async function getReferences(_doi: string) {
  return Array.from({ length: 5 }).map((_, i) => ({
    title: "Reference " + i,
    doi: "ref-" + i,
    authors: "Author",
  }));
}

async function findReplacementPapers(title: string, year: number | string | undefined) {
  return [
    {
      title: "Better Study 1",
      url: "#",
      summary: "Replacement",
      publishedDate: "2021",
      relevanceScore: 1,
    },
    {
      title: "Better Study 2",
      url: "#",
      summary: "Replacement",
      publishedDate: "2022",
      relevanceScore: 0.85,
    },
  ];
}

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------

function calculateIntegrityScore(
  citations: { status?: string }[],
): number {
  let score = 100;
  citations.forEach((c) => {
    if (c.status === "retracted") score -= 15;
    if (c.status === "cascade") score -= 7;
  });
  return Math.max(0, score);
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type RetractionInfo = {
  reason: string;
  date: string;
  country: string;
  journal: string;
};

export type PipelineCitation = {
  id: string;
  title: string;
  year?: number | string;
  doi?: string;
  authors?: string;
  status?: "retracted" | "cascade" | "clean";
  retraction?: RetractionInfo | null;
  references?: Array<{ title: string; doi: string; authors: string }>;
  replacements?: Array<{
    title: string;
    url: string;
    summary: string;
    publishedDate: string;
    relevanceScore: number;
  }>;
};

// -----------------------------------------------------------------------------
// Pipeline
// -----------------------------------------------------------------------------

export type CitationUpdateHandler = (
  id: string,
  updates: unknown,
) => void | Promise<void>;

export type JobUpdateHandler = (updates: unknown) => void | Promise<void>;

/**
 * Phase 1 — Resolve DOIs
 * Phase 2 — Check retractions (demo: red when hit)
 * Phase 3 — Cascade detection
 * Phase 4 — Replacement suggestions
 * Phase 5 — Score calculation (demo: numeric output)
 */
export async function runPipeline(
  jobId: string,
  citations: PipelineCitation[],
  onCitationUpdate?: CitationUpdateHandler,
  onJobUpdate?: JobUpdateHandler,
): Promise<{ citations: PipelineCitation[]; integrityScore: number }> {
  const emitCitation = (
    phase: string,
    data: Record<string, unknown> & { id: string },
  ) => {
    if (onCitationUpdate) {
      void Promise.resolve(onCitationUpdate(data.id, { phase, ...data }));
    } else {
      console.log("[updateCitation]", phase, data);
    }
  };

  const emitJob = (payload: Record<string, unknown>) => {
    if (onJobUpdate) {
      void Promise.resolve(onJobUpdate({ jobId, ...payload }));
    } else {
      console.log("[updateJob]", jobId, payload);
    }
  };

  emitJob({ event: "pipeline_started", total: citations.length });

  // Phase 1 — Resolve DOIs
  emitJob({ phase: 1, name: "resolve_dois" });
  for (const c of citations) {
    const doi = c.doi ?? (await resolveDoiFromTitle(c.title));
    c.doi = doi;
    emitCitation("doi_resolved", { id: c.id, title: c.title, doi });
  }

  // Phase 2 — Check retractions
  emitJob({ phase: 2, name: "retraction_check" });
  for (const c of citations) {
    const info = await isRetracted(c.doi!);
    if (info) {
      c.retraction = info;
      c.status = "retracted";
      // DEMO MOMENT — Phase 2 → red (retracted)
      console.log(
        "\x1b[31m[PHASE 2 — RETRACTED]\x1b[0m",
        c.id,
        c.title,
        info,
      );
      emitCitation("retracted", { id: c.id, retraction: info });
    } else {
      c.retraction = null;
      emitCitation("clear", { id: c.id });
    }
  }

  // Phase 3 — Cascade detection
  emitJob({ phase: 3, name: "cascade_detection" });
  for (const c of citations) {
    if (c.status === "retracted") continue;

    const refs = await getReferences(c.doi!);
    c.references = refs;

    let cascaded = false;
    for (const ref of refs) {
      const refRet = await isRetracted(ref.doi);
      if (refRet) {
        cascaded = true;
        break;
      }
    }

    if (cascaded) {
      c.status = "cascade";
      // DEMO MOMENT — Phase 3 → cascade detection
      console.log(
        "\x1b[33m[PHASE 3 — CASCADE]\x1b[0m",
        c.id,
        c.title,
        "references include a retracted work (simulated)",
      );
      emitCitation("cascade", { id: c.id, references: refs });
    } else if (!c.status) {
      c.status = "clean";
    }
  }

  // Phase 4 — Replacement suggestions
  emitJob({ phase: 4, name: "replacement_suggestions" });
  for (const c of citations) {
    if (c.status === "retracted" || c.status === "cascade") {
      c.replacements = await findReplacementPapers(c.title, c.year);
      emitCitation("replacements", {
        id: c.id,
        replacements: c.replacements,
      });
    }
  }

  // Phase 5 — Score calculation
  emitJob({ phase: 5, name: "score_calculation" });
  const integrityScore = calculateIntegrityScore(citations);
  // DEMO MOMENT — Phase 5 → score output
  console.log(
    "\x1b[36m[PHASE 5 — INTEGRITY SCORE]\x1b[0m",
    integrityScore,
    "/ 100",
  );
  emitJob({
    phase: 5,
    integrityScore,
    perCitation: citations.map((c) => ({
      id: c.id,
      status: c.status,
      doi: c.doi,
    })),
  });

  emitJob({ event: "pipeline_complete", integrityScore });

  return { citations, integrityScore };
}

/** Six fake citations; runs the full pipeline and logs all steps. */
export async function testPipeline(): Promise<void> {
  const jobId = "test-job-" + Date.now();
  console.log("\n========== testPipeline() ==========\n");

  const citations: PipelineCitation[] = [
    { id: "c1", title: "Neural correlates of attention", year: 2019 },
    { id: "c2", title: "Diet and metabolic syndrome", year: 2021 },
    { id: "c3", title: "Vaccine immunogenicity trial", year: 2018 },
    { id: "c4", title: "Climate models regional bias", year: 2020 },
    { id: "c5", title: "CRISPR off-target effects", year: 2022 },
    { id: "c6", title: "Social cognition in adolescents", year: 2017 },
  ];

  console.log("[updateJob]", jobId, {
    event: "test_run_start",
    citations: citations.length,
  });

  const result = await runPipeline(jobId, citations);

  console.log("\n--- Final citations (summary) ---");
  console.log(JSON.stringify(result.citations, null, 2));
  console.log("\n========== end testPipeline ==========\n");
}
