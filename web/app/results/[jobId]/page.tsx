"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ResultsConvexView } from "./ResultsConvexView";
import { ResultsLayout } from "./ResultsLayout";
import { MOCK_JOB, MOCK_CITATIONS } from "@/lib/mockData";
import { normalizeCitations } from "@/lib/citationRow";
import { hasConvexUrl } from "@/lib/convexEnv";
import type { JobViewModel } from "@/lib/jobViewModel";

export default function ResultsPage() {
  const params = useParams();
  const jobId =
    typeof params?.jobId === "string"
      ? params.jobId
      : Array.isArray(params?.jobId)
        ? params?.jobId[0] ?? ""
        : "";

  const convexConfigured = hasConvexUrl();

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

  if (!convexConfigured) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="text-slate-200">Live results require Convex.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add{" "}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">
            NEXT_PUBLIC_CONVEX_URL
          </code>{" "}
          to <code className="text-slate-400">.env.local</code>, restart the dev
          server, then open this job again.
        </p>
        {jobId ? (
          <p className="mt-4 font-mono text-xs text-slate-600">Job: {jobId}</p>
        ) : null}
        <Link
          href="/"
          className="mt-8 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
        >
          ← Home
        </Link>
      </div>
    );
  }

  return <ResultsConvexView jobId={jobId} />;
}
