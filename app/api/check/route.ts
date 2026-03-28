// DOCUMENTATION NOTE:
// Awaits the full pipeline synchronously and returns all results in one response.
// Frontend stores the payload in sessionStorage so the results page can render
// without Convex being configured.

import { NextResponse } from "next/server";
import { runPipeline, type PipelineCitation } from "@/lib/pipeline";

export const runtime = "nodejs";

function normalizeCitations(raw: unknown): PipelineCitation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const o = item as Record<string, unknown>;
    return {
      id: typeof o.id === "string" && o.id ? o.id : `c${i + 1}`,
      title: typeof o.title === "string" ? o.title : "",
      year: o.year as number | string | undefined,
      doi: typeof o.doi === "string" ? o.doi : undefined,
      authors: typeof o.authors === "string" ? o.authors : undefined,
      status: "pending" as const,
    };
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const citationsRaw =
    body &&
    typeof body === "object" &&
    body !== null &&
    "citations" in body
      ? (body as { citations: unknown }).citations
      : undefined;

  if (!Array.isArray(citationsRaw)) {
    return NextResponse.json(
      { error: "Expected JSON body: { citations: [...] }" },
      { status: 400 },
    );
  }

  const jobId = "job_" + Date.now();
  const citations = normalizeCitations(citationsRaw);

  // Collect job-level metadata emitted by the pipeline
  const jobMeta: Record<string, unknown> = {};

  try {
    const result = await runPipeline(jobId, citations, {
      updateCitation: async () => {
        // no-op: full citation data is returned directly in result.citations
      },
      updateJob: async (updates) => {
        Object.assign(jobMeta, updates);
      },
    });

    // Flatten retraction sub-object onto each citation for the frontend
    const flatCitations = result.citations.map((c) => ({
      id: c.id,
      title: c.title,
      authors: c.authors ?? "",
      year: c.year ?? null,
      doi: c.doi ?? null,
      status: c.status,
      retractionReason: c.retraction?.retractionReason ?? null,
      retractionDate: c.retraction?.retractionDate ?? null,
      retractionCountry: c.retraction?.retractionCountry ?? null,
      retractionJournal: c.retraction?.retractionJournal ?? null,
    }));

    return NextResponse.json({
      jobId,
      status: "complete",
      integrityScore: result.integrityScore,
      historicalComparison: jobMeta.historicalComparison ?? null,
      downstreamRisk: jobMeta.downstreamRisk ?? null,
      citations: flatCitations,
    });
  } catch (err) {
    console.error("[check pipeline]", jobId, err);
    return NextResponse.json(
      { error: "Pipeline failed. Check server logs." },
      { status: 500 },
    );
  }
}
