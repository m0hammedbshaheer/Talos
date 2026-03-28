type Props = { comparison: unknown };

function readString(r: Record<string, unknown>, key: string): string | undefined {
  const v = r[key];
  return typeof v === "string" ? v : undefined;
}

function readNumber(r: Record<string, unknown>, key: string): number | undefined {
  const v = r[key];
  return typeof v === "number" && !Number.isNaN(v) ? v : undefined;
}

export function HistoricalComparison({ comparison }: Props) {
  const rec =
    comparison != null && typeof comparison === "object"
      ? (comparison as Record<string, unknown>)
      : null;

  const severity = rec ? readString(rec, "severity") : undefined;
  const matchedCase = rec ? readString(rec, "matchedCase") : undefined;
  const similarity = rec ? readString(rec, "similarity") : undefined;
  const avgMonths = rec ? readNumber(rec, "avgMonthsToCatch") : undefined;
  const impact = rec ? readString(rec, "impactDescription") : undefined;

  if (!rec) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300">
          Historical comparison
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          No historical comparison payload on this job yet.
        </p>
      </div>
    );
  }

  if (severity === "clean") {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/40 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-emerald-300">
          Historical comparison
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
          No major contamination pattern in this run.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-950/35 p-5 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 rw-shimmer opacity-40" />
      <h3 className="relative text-xs font-semibold uppercase tracking-[0.18em] text-red-300/90">
        Historical risk comparison
      </h3>
      <p className="relative mt-3 text-base font-semibold text-white">
        {similarity ?? "—"}{" "}
        <span className="text-red-200">{matchedCase ?? "—"}</span>
      </p>
      <p className="relative mt-2 text-sm text-red-100/85">
        Papers with a similar profile took an average of{" "}
        <strong className="text-white">
          {avgMonths ?? "—"} months
        </strong>{" "}
        to surface in peer review.
      </p>
      {impact ? (
        <p className="relative mt-3 border-l-2 border-red-400/50 pl-3 text-xs italic text-red-200/80">
          “{impact}”
        </p>
      ) : null}
    </div>
  );
}
