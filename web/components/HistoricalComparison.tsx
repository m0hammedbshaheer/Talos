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
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Historical comparison
        </h3>
        <div className="mt-4 space-y-2">
          <div className="rw-shimmer h-4 w-40 rounded-md bg-slate-700/60" />
          <div className="rw-shimmer h-3.5 w-52 rounded bg-slate-700/40" />
          <div className="rw-shimmer h-3 w-44 rounded bg-slate-700/30" />
          <div className="rw-shimmer h-3 w-36 rounded bg-slate-700/20" />
        </div>
        <p className="mt-3 text-xs text-blue-300/80">Analyzing…</p>
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
      <p className="relative mt-3 text-sm text-red-100/90">
        Profile similarity:{" "}
        <strong className="text-white">{similarity ?? "—"}</strong>
      </p>
      <p className="relative mt-2 text-base font-semibold leading-snug text-white">
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
        <p className="relative mt-3 border-l-2 border-red-400/50 pl-3 text-sm leading-relaxed text-red-100/90">
          {impact}
        </p>
      ) : null}
    </div>
  );
}
