"use client";

import type { MockCitation } from "@/lib/mockData";
import type { MockJob } from "@/lib/mockData";
import { getScoreLabel } from "@/lib/scoreBands";

type Props = {
  job: MockJob;
  citations: MockCitation[];
};

/** Print-friendly summary — no extra deps; uses the browser print dialog. */
export function ReportDownload({ job, citations }: Props) {
  const label = getScoreLabel(job.integrityScore);

  const handlePrint = () => {
    const rows = citations
      .map(
        (c) =>
          `<tr><td>${escapeHtml(c.title)}</td><td>${escapeHtml(c.status)}</td><td>${escapeHtml(c.doi ?? "—")}</td></tr>`,
      )
      .join("");

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>RetractWatch Report</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 22px; }
        .meta { color: #444; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; }
      </style></head><body>
      <h1>RetractWatch — Integrity report (preview)</h1>
      <p class="meta">Score: <strong>${job.integrityScore}</strong> — ${escapeHtml(label.label)} · ${citations.length} citations · Generated ${new Date().toLocaleString()}</p>
      <p class="meta">This is a frontend mock. Connect the pipeline for live results.</p>
      <table><thead><tr><th>Title</th><th>Status</th><th>DOI</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-white">Export report</p>
        <p className="text-xs text-slate-400">
          Opens a print dialog with a clean table — good for judges and PDF save.
        </p>
      </div>
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
