type Props = { risk: unknown };

const riskColors: Record<string, string> = {
  low: "text-emerald-300",
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

  if (!r) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Downstream risk
        </h3>
        <div className="mt-4 space-y-2">
          <div className="rw-shimmer h-6 w-24 rounded-lg bg-slate-700/60" />
          <div className="rw-shimmer h-3.5 w-48 rounded bg-slate-700/40" />
          <div className="rw-shimmer h-3 w-36 rounded bg-slate-700/30" />
        </div>
        <p className="mt-3 text-xs text-blue-300/80">Analyzing…</p>
      </div>
    );
  }

  const level =
    typeof r.riskLevel === "string" ? r.riskLevel : "low";
  const estimated =
    typeof r.estimatedDownstreamPapers === "number"
      ? r.estimatedDownstreamPapers
      : 0;
  const explanation =
    typeof r.explanation === "string" ? r.explanation : undefined;
  const worst =
    typeof r.worstCaseDownstream === "number"
      ? r.worstCaseDownstream
      : undefined;

  const color = riskColors[level] ?? "text-emerald-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Downstream risk
      </h3>
      <p className="mt-3 text-2xl font-bold tracking-tight">
        <span className={color}>{estimated}</span>{" "}
        <span className="text-base font-medium text-slate-400">
          contaminated citation{estimated === 1 ? "" : "s"} detected.
        </span>
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
