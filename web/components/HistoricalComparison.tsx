import type { HistoricalComparison as HC } from "@/lib/mockData";

type Props = { comparison: HC | undefined | null };

export function HistoricalComparison({ comparison }: Props) {
  if (!comparison || comparison.severity === "clean") {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/40 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-emerald-300">
          Historical comparison
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
          No major contamination pattern in this run. Your bibliography looks
          cleaner than most mock scenarios.
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
        {comparison.similarity}{" "}
        <span className="text-red-200">{comparison.matchedCase}</span>
      </p>
      <p className="relative mt-2 text-sm text-red-100/85">
        Papers with a similar profile took an average of{" "}
        <strong className="text-white">{comparison.avgMonthsToCatch} months</strong>{" "}
        to surface in peer review.
      </p>
      <p className="relative mt-3 border-l-2 border-red-400/50 pl-3 text-xs italic text-red-200/80">
        “{comparison.impactDescription}”
      </p>
    </div>
  );
}
