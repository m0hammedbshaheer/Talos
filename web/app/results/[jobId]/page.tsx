"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { IntegrityScore } from "@/components/IntegrityScore";
import { HistoricalComparison } from "@/components/HistoricalComparison";
import { DownstreamRisk } from "@/components/DownstreamRisk";
import { CitationFeed } from "@/components/CitationFeed";
import { CascadeGraph } from "@/components/CascadeGraph";
import { ReportDownload } from "@/components/ReportDownload";
import { MOCK_JOB, MOCK_CITATIONS } from "@/lib/mockData";

export default function ResultsPage() {
  const params = useParams();
  const jobId = (params?.jobId as string) || "demo";
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const job = useMemo(() => MOCK_JOB, []);
  const citations = useMemo(() => MOCK_CITATIONS, []);

  return (
    <div className="relative min-h-dvh pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Analysis job
            </p>
            <p className="font-mono text-sm text-slate-300">{jobId}</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            ← New upload
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <IntegrityScore
            score={job.integrityScore}
            status={job.status}
          />
          <HistoricalComparison comparison={job.historicalComparison} />
          <DownstreamRisk risk={job.downstreamRisk} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CitationFeed
            citations={citations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <CascadeGraph citations={citations} highlightId={selectedId} />
        </div>

        <div className="mt-6">
          <ReportDownload job={job} citations={citations} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          UI preview only — connect Convex + API routes for live pipeline data.
        </p>
      </div>
    </div>
  );
}
