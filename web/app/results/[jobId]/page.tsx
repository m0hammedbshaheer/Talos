"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ResultsConvexView } from "./ResultsConvexView";
import { ResultsLayout } from "./ResultsLayout";
import { MOCK_JOB, MOCK_CITATIONS } from "@/lib/mockData";
import { normalizeCitations } from "@/lib/citationRow";
import { hasConvexUrl } from "@/lib/convexEnv";
import type { JobViewModel } from "@/lib/jobViewModel";

type StoredResult = {
  jobId: string;
  status: string;
  integrityScore: number;
  historicalComparison: unknown;
  downstreamRisk: unknown;
  citations: unknown[];
};

export default function ResultsPage() {
  const params = useParams();
  const jobId =
    typeof params?.jobId === "string"
      ? params.jobId
      : Array.isArray(params?.jobId)
        ? (params?.jobId[0] ?? "")
        : "";

  const [inlineResult, setInlineResult] = useState<StoredResult | null>(null);
  const [storageChecked, setStorageChecked] = useState(false);

  useEffect(() => {
    if (!jobId || jobId === "demo") {
      setStorageChecked(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`rw:job:${jobId}`);
      if (raw) setInlineResult(JSON.parse(raw) as StoredResult);
    } catch {
      // corrupt storage entry — fall through to Convex
    }
    setStorageChecked(true);
  }, [jobId]);

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (jobId === "demo") {
    const citations = normalizeCitations(MOCK_CITATIONS as unknown[]);
    const job: JobViewModel = {
      status: MOCK_JOB?.status ?? undefined,
      integrityScore: MOCK_JOB?.integrityScore ?? undefined,
      historicalComparison: MOCK_JOB?.historicalComparison,
      downstreamRisk: MOCK_JOB?.downstreamRisk,
    };
    return (
      <ResultsLayout
        jobId="demo"
        job={job}
        citations={citations}
        dataSource="demo"
      />
    );
  }

  // Wait for sessionStorage check to finish before deciding
  if (!storageChecked) return null;

  // ── Inline results (real analysis, stored in sessionStorage) ──────────────
  if (inlineResult) {
    const citations = normalizeCitations(inlineResult.citations);
    const job: JobViewModel = {
      status: inlineResult.status,
      integrityScore: inlineResult.integrityScore,
      historicalComparison: inlineResult.historicalComparison,
      downstreamRisk: inlineResult.downstreamRisk,
    };
    return (
      <ResultsLayout
        jobId={jobId}
        job={job}
        citations={citations}
        dataSource="inline"
      />
    );
  }

  // ── Convex live results ────────────────────────────────────────────────────
  if (!hasConvexUrl()) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="text-slate-200">Results not found for this job.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The session may have expired. Upload your paper again to re-analyse.
        </p>
        {jobId ? (
          <p className="mt-4 font-mono text-xs text-slate-600">Job: {jobId}</p>
        ) : null}
        <Link
          href="/"
          className="mt-8 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
        >
          ← Upload again
        </Link>
      </div>
    );
  }

  return <ResultsConvexView jobId={jobId} />;
}
