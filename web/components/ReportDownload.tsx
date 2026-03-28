"use client";

import type { CitationRow } from "@/lib/citationRow";
import type { JobViewModel } from "@/lib/jobViewModel";
import { getScoreLabel } from "@/lib/scoreBands";

type Props = {
  job: JobViewModel | null | undefined;
  citations: CitationRow[] | undefined | null;
};

/** Print-friendly summary — uses browser print / save as PDF. */
export function ReportDownload({ job, citations }: Props) {
  const list = citations ?? [];
  const score = job?.integrityScore ?? 0;
  const label = getScoreLabel(score);

  const handlePrint = () => {
    const rows = list
      .map(
        (c) =>
          `<tr><td>${escapeHtml(c?.title ?? "")}</td><td>${escapeHtml(c?.status ?? "")}</td><td>${escapeHtml(c?.doi ?? "—")}</td></tr>`,
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
      <h1>RetractWatch — Integrity report</h1>
      <p class="meta">Score: <strong>${score}</strong> — ${escapeHtml(label.label)} · ${list.length} citations · Generated ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Title</th><th>Status</th><th>DOI</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  if (!job && list.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-white">Export report</p>
        <p className="text-xs text-slate-400">
          Opens a print dialog with a clean table — save as PDF from the dialog.
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
