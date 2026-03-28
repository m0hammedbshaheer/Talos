type Props = { risk: unknown };

const riskColors: Record<string, string> = {
  moderate: "text-amber-300",
  high: "text-orange-300",
  critical: "text-red-300",
};

function readRecord(x: unknown): Record<string, unknown> | null {
  if (x == null || typeof x !== "object") return null;
  return x as Record<string, unknown>;
}

export function DownstreamRisk({ risk }: Props) {
  const r = readRecord(risk);
  const level =
    r && typeof r.riskLevel === "string" ? r.riskLevel : undefined;
  const estimated = r && typeof r.estimatedDownstreamPapers === "number"
    ? r.estimatedDownstreamPapers
    : undefined;
  const explanation =
    r && typeof r.explanation === "string" ? r.explanation : undefined;
  const worst =
    r && typeof r.worstCaseDownstream === "number"
      ? r.worstCaseDownstream
      : undefined;

  if (!r || level === "low" || level === undefined) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Downstream risk
        </h3>
        <p className="mt-3 text-2xl font-semibold text-emerald-300">Minimal</p>
        <p className="mt-1 text-sm text-slate-400">
          {level === undefined && !estimated
            ? "No downstream risk payload on this job yet."
            : "No meaningful downstream exposure for this profile."}
        </p>
      </div>
    );
  }

  const color = riskColors[level] ?? "text-slate-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Downstream risk
      </h3>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${color}`}>
        ~{estimated ?? "—"}{" "}
        <span className="text-lg font-medium text-slate-400">papers</span>
      </p>
      {explanation ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {explanation}
        </p>
      ) : null}
      {worst != null ? (
        <p className="mt-3 text-xs text-slate-500">
          Worst-case propagation estimate:{" "}
          <span className="text-slate-300">{worst}</span> papers
        </p>
      ) : null}
    </div>
  );
}
