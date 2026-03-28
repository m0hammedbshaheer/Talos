// DOCUMENTATION NOTE:
// Integrity pipeline: CrossRef → Retraction Watch CSV → Semantic Scholar → Exa.
// Updates are injected (e.g. Convex); no database imports in this module.

import { resolveDoiFromTitle } from "./crossref";
import { calculateDownstreamRisk } from "./downstreamRisk";
import { findReplacementPapers } from "./exa";
import { compareToHistoricalCases } from "./historicalCases";
import { isRetracted } from "./retractionWatch";
import {
  calculateIntegrityScore as scoreFromScoringTable,
  type Citation as ScoringCitation,
} from "./scoring";
import { getReferences } from "./semanticScholar";
import type {
  PipelineCitation,
  PipelineUpdateFns,
  ReferenceRow,
  ReplacementRow,
  RetractionRecord,
} from "./pipeline-types";

export type {
  PipelineCitation,
  PipelineCitationStatus,
  PipelineUpdateFns,
  ReferenceRow,
  ReplacementRow,
  RetractionRecord,
} from "./pipeline-types";

/** @deprecated Use RetractionRecord */
export type RetractionInfo = RetractionRecord;

// -----------------------------------------------------------------------------
// External adapters (try/catch per call; safe fallbacks)
// -----------------------------------------------------------------------------

export async function resolveDoiFromTitleWrapper(
  title: string,
  authors?: string,
): Promise<string | null> {
  try {
    return await resolveDoiFromTitle(title, authors);
  } catch {
    return null;
  }
}

export async function isRetractedWrapper(
  doi: string,
): Promise<RetractionRecord | null> {
  try {
    return isRetracted(doi);
  } catch {
    return null;
  }
}

export async function getReferencesWrapper(doi: string): Promise<ReferenceRow[]> {
  try {
    const rows = await getReferences(doi);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function findReplacementPapersWrapper(
  title: string,
  year: number | string | undefined,
): Promise<ReplacementRow[]> {
  try {
    const q = [title, year].filter((x) => x !== undefined && x !== "").join(" ").trim();
    if (!q) return [];
    const rows = await findReplacementPapers(q);
    return rows.map((r) => ({
      title: r.title,
      url: r.url,
      summary: r.summary,
      publishedDate: r.publishedDate ?? "",
      relevanceScore: r.relevanceScore ?? 0,
    }));
  } catch {
    return [];
  }
}

function pipelineToScoringCitations(p: PipelineCitation[]): ScoringCitation[] {
  return p.map((c) => {
    let year: number | null = null;
    if (typeof c.year === "number" && !Number.isNaN(c.year)) year = c.year;
    else if (c.year != null && String(c.year).trim() !== "") {
      const n = Number(c.year);
      year = Number.isNaN(n) ? null : n;
    }
    return {
      id: c.id,
      title: c.title,
      authors: c.authors ?? "",
      year,
      doi: c.doi ?? null,
      status: c.status,
      retractionReason: c.retraction?.retractionReason,
      retractionDate: c.retraction?.retractionDate,
      retractionCountry: c.retraction?.retractionCountry,
      retractionJournal: c.retraction?.retractionJournal,
    };
  });
}

function historicalPayloadForJob(h: ReturnType<typeof compareToHistoricalCases>) {
  return {
    matchedCase: h.matchedCase?.name ?? "",
    similarity: String(h.similarity),
    avgMonthsToCatch: h.avgMonthsToCatch ?? 0,
    impactDescription: h.impactDescription,
    severity: h.severity,
  };
}

/**
 * Phase 1 — Resolve DOIs (CrossRef)
 * Phase 2 — Retractions (local CSV)
 * Phase 3 — Cascade (Semantic Scholar + CSV)
 * Phase 4 — Replacements (Exa)
 * Phase 5 — Score + job metadata
 */
export async function runPipeline(
  jobId: string,
  citations: PipelineCitation[],
  fns: PipelineUpdateFns,
): Promise<{ citations: PipelineCitation[]; integrityScore: number }> {
  const { updateCitation, updateJob } = fns;

  const emitCitation = async (
    phase: string,
    data: Record<string, unknown> & { id: string },
  ) => {
    try {
      await Promise.resolve(updateCitation(data.id, { phase, ...data }));
    } catch {
      /* sink */
    }
  };

  const emitJob = async (payload: Record<string, unknown>) => {
    try {
      await Promise.resolve(updateJob({ jobId, ...payload }));
    } catch {
      /* sink */
    }
  };

  for (const c of citations) {
    if (!c.status) {
      c.status = "pending";
    }
  }

  await emitJob({
    event: "pipeline_started",
    total: citations.length,
    status: "running",
    processedCount: 0,
  });

  // Phase 1 — Resolve DOIs
  await emitJob({ phase: 1, name: "resolve_dois" });
  for (const c of citations) {
    try {
      c.status = "checking";
      await emitCitation("doi_resolve_started", {
        id: c.id,
        title: c.title,
        status: c.status,
      });

      let doi = c.doi?.trim() || null;
      if (!doi) {
        doi = await resolveDoiFromTitleWrapper(c.title, c.authors);
      }

      if (!doi) {
        c.status = "unverified";
        await emitCitation("doi_unresolved", {
          id: c.id,
          title: c.title,
          status: c.status,
        });
        continue;
      }

      c.doi = doi;
      c.status = "pending";
      await emitCitation("doi_resolved", {
        id: c.id,
        title: c.title,
        doi: c.doi,
        status: c.status,
      });
    } catch {
      c.status = "unverified";
      await emitCitation("doi_error", {
        id: c.id,
        title: c.title,
        status: c.status,
      });
    }
  }

  // Phase 2 — Check retractions
  await emitJob({ phase: 2, name: "retraction_check" });
  for (const c of citations) {
    try {
      if (c.status === "unverified" || !c.doi) {
        continue;
      }

      c.status = "checking";
      await emitCitation("retraction_check_started", {
        id: c.id,
        status: c.status,
      });

      const info = await isRetractedWrapper(c.doi);

      if (info) {
        c.retraction = info;
        c.status = "retracted";
        await emitCitation("retracted", {
          id: c.id,
          retraction: info,
          status: c.status,
        });
      } else {
        c.retraction = null;
        c.status = "clean";
        await emitCitation("not_retracted", {
          id: c.id,
          status: c.status,
        });
      }
    } catch {
      c.retraction = null;
      c.status = "unverified";
      await emitCitation("retraction_check_error", {
        id: c.id,
        status: c.status,
      });
    }
  }

  // Phase 3 — Cascade detection
  await emitJob({ phase: 3, name: "cascade_detection" });
  for (const c of citations) {
    try {
      if (c.status === "retracted" || c.status === "unverified" || !c.doi) {
        continue;
      }

      c.status = "checking";
      await emitCitation("cascade_check_started", {
        id: c.id,
        status: c.status,
      });

      const refs = await getReferencesWrapper(c.doi);
      c.references = refs;

      let cascaded = false;
      for (const ref of refs) {
        const refRet = await isRetractedWrapper(ref.doi);
        if (refRet) {
          cascaded = true;
          break;
        }
      }

      if (cascaded) {
        c.status = "cascade";
        await emitCitation("cascade", {
          id: c.id,
          references: refs,
          status: c.status,
        });
      } else {
        c.status = "clean";
        await emitCitation("no_cascade", { id: c.id, status: c.status });
      }
    } catch {
      c.status = "unverified";
      await emitCitation("cascade_check_error", {
        id: c.id,
        status: c.status,
      });
    }
  }

  // Phase 4 — Replacement suggestions
  await emitJob({ phase: 4, name: "replacement_suggestions" });
  for (const c of citations) {
    try {
      if (c.status !== "retracted" && c.status !== "cascade") {
        continue;
      }
      const replacements = await findReplacementPapersWrapper(c.title, c.year);
      c.replacements = replacements;
      await emitCitation("replacements", {
        id: c.id,
        replacements,
        status: c.status,
      });
    } catch {
      c.replacements = [];
      await emitCitation("replacements_error", { id: c.id, status: c.status });
    }
  }

  // Phase 5 — Score calculation + analytics for job row
  await emitJob({ phase: 5, name: "score_calculation" });
  let integrityScore = 100;
  try {
    integrityScore = scoreFromScoringTable(pipelineToScoringCitations(citations));
  } catch {
    integrityScore = 0;
  }

  const scoringRows = pipelineToScoringCitations(citations);
  const hist = compareToHistoricalCases(
    citations.map((c) => ({
      retracted: c.status === "retracted",
      cascade: c.status === "cascade",
    })),
    integrityScore,
  );
  const downstream = calculateDownstreamRisk(scoringRows);

  await emitJob({
    phase: 5,
    integrityScore,
    processedCount: citations.length,
    status: "complete",
    historicalComparison: historicalPayloadForJob(hist),
    downstreamRisk: downstream,
    perCitation: citations.map((x) => ({
      id: x.id,
      status: x.status,
      doi: x.doi,
    })),
  });

  await emitJob({
    event: "pipeline_complete",
    integrityScore,
    status: "complete",
    processedCount: citations.length,
    historicalComparison: historicalPayloadForJob(hist),
    downstreamRisk: downstream,
  });

  return { citations, integrityScore };
}

export async function testPipeline(): Promise<void> {
  const jobId = "test-job-" + Date.now();
  console.log("\n========== testPipeline() ==========\n");

  const citations: PipelineCitation[] = [
    { id: "c1", title: "Neural correlates of attention", year: 2019, status: "pending" },
    { id: "c2", title: "Diet and metabolic syndrome", year: 2021, status: "pending" },
    { id: "c3", title: "Vaccine immunogenicity trial", year: 2018, status: "pending" },
    { id: "c4", title: "Climate models regional bias", year: 2020, status: "pending" },
    { id: "c5", title: "CRISPR off-target effects", year: 2022, status: "pending" },
    { id: "c6", title: "Social cognition in adolescents", year: 2017, status: "pending" },
  ];

  console.log("[updateJob]", jobId, {
    event: "test_run_start",
    citations: citations.length,
  });

  const fns: PipelineUpdateFns = {
    updateCitation: (id, updates) =>
      console.log("[updateCitation]", id, updates),
    updateJob: (updates) => console.log("[updateJob]", updates),
  };

  const result = await runPipeline(jobId, citations, fns);

  console.log("\n--- Final citations (summary) ---");
  console.log(JSON.stringify(result.citations, null, 2));
  console.log("\n========== end testPipeline ==========\n");
}
