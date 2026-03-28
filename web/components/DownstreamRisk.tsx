import type { DownstreamRisk as DR } from "@/lib/mockData";

type Props = { risk: DR | undefined | null };

const riskColors: Record<string, string> = {
  moderate: "text-amber-300",
  high: "text-orange-300",
  critical: "text-red-300",
};

export function DownstreamRisk({ risk }: Props) {
  if (!risk || risk.riskLevel === "low") {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Downstream risk
        </h3>
        <p className="mt-3 text-2xl font-semibold text-emerald-300">Minimal</p>
        <p className="mt-1 text-sm text-slate-400">
          No contamination to propagate in this mock run.
        </p>
      </div>
    );
  }

  const color = riskColors[risk.riskLevel] ?? "text-slate-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Downstream risk
      </h3>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${color}`}>
        ~{risk.estimatedDownstreamPapers}{" "}
        <span className="text-lg font-medium text-slate-400">papers</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {risk.explanation}
      </p>
      <p className="mt-3 text-xs text-slate-500">
        Worst-case propagation estimate:{" "}
        <span className="text-slate-300">{risk.worstCaseDownstream}</span>{" "}
        papers
      </p>
    </div>
  );
}
