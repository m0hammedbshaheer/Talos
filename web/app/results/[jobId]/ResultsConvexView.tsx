"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ResultsLayout } from "./ResultsLayout";
import { normalizeCitations } from "@/lib/citationRow";
import { jobFromConvexDoc } from "@/lib/jobViewModel";

type Props = { jobId: string };

export function ResultsConvexView({ jobId }: Props) {
  const convexJobId = jobId as Id<"jobs">;

  const jobDoc = useQuery(api.jobs.getJob, { jobId: convexJobId });
  const citationsRaw = useQuery(api.citations.getCitationsForJob, {
    jobId: convexJobId,
  });

  const loading =
    jobDoc === undefined || citationsRaw === undefined;

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
  const job = jobFromConvexDoc(jobDoc);

  return (
    <ResultsLayout
      jobId={jobId}
      job={job}
      citations={citations}
      dataSource="convex"
    />
  );
}
