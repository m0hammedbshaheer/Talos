"use client";

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
  const useDemo = jobId === "demo" || !convexConfigured;

  if (useDemo) {
    const citations = normalizeCitations(MOCK_CITATIONS as unknown[]);
    const job: JobViewModel = {
      status: MOCK_JOB?.status ?? undefined,
      integrityScore: MOCK_JOB?.integrityScore ?? undefined,
      historicalComparison: MOCK_JOB?.historicalComparison,
      downstreamRisk: MOCK_JOB?.downstreamRisk,
    };
    return (
      <ResultsLayout
        jobId={jobId || "demo"}
        job={job}
        citations={citations}
        dataSource="demo"
      />
    );
  }

  return <ResultsConvexView jobId={jobId} />;
}
