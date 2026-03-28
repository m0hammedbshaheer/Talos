// DOCUMENTATION NOTE:
// We return immediately and process in background.

import { NextResponse } from "next/server";
import { runPipeline, type PipelineCitation } from "@/lib/pipeline";

export const runtime = "nodejs";

function normalizeCitations(raw: unknown): PipelineCitation[] {
  if (!Array.isArray(raw)) {
    return [];
  }
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
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const citationsRaw =
    body && typeof body === "object" && body !== null && "citations" in body
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

  void runPipeline(jobId, citations, {
    updateCitation: async (id, updates) => {
      console.log("Citation update:", id, updates);
    },
    updateJob: async (updates) => {
      console.log("Job update:", updates);
    },
  }).catch((err) => {
    console.error("[check pipeline]", jobId, err);
  });

  return NextResponse.json({ jobId });
}
