"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ResultsLayout } from "./ResultsLayout";
import { normalizeCitations } from "@/lib/citationRow";
import { jobFromConvexDoc } from "@/lib/jobViewModel";

type Props = { jobId: string };

export function ResultsConvexView({ jobId }: Props) {
  const args = jobId ? { jobId: jobId as Id<"jobs"> } : "skip";

  const jobDoc = useQuery(api.jobs.getJob, args);
  const citationsRaw = useQuery(api.citations.getCitationsForJob, args);

  const loading =
    Boolean(jobId) &&
    (jobDoc === undefined || citationsRaw === undefined);

  if (!jobId) {
    return (
      <ResultsLayout
        jobId=""
        notFound
        job={null}
        citations={[]}
      />
    );
  }

  if (loading) {
    return (
      <ResultsLayout
        jobId={jobId}
        loading
        job={null}
        citations={[]}
      />
    );
  }

  if (jobDoc === null) {
    return (
      <ResultsLayout
        jobId={jobId}
        notFound
        job={null}
        citations={[]}
      />
    );
  }

  const citations = normalizeCitations(citationsRaw ?? []);
  const job = jobFromConvexDoc(jobDoc ?? null);

  return (
    <ResultsLayout
      jobId={jobId}
      job={job}
      citations={citations}
      dataSource="convex"
    />
  );
}
