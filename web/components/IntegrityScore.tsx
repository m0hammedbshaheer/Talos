"use client";

import { useEffect, useState } from "react";
import { getScoreLabel } from "@/lib/scoreBands";

type Props = {
  score: number | undefined;
  status: string | undefined | null;
};

export function IntegrityScore({ score, status }: Props) {
  const [display, setDisplay] = useState(0);
  const s = score ?? 0;
  const label = getScoreLabel(s);
  const st = status ?? "";

  useEffect(() => {
    if (st !== "complete" && score === undefined) {
      setDisplay(0);
      return;
    }
    const target = score ?? 100;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, st]);

  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--rw-card)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl rw-glow-pulse" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
        Integrity score
      </p>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <svg className="-rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="rgba(148,163,184,0.15)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={label.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-instrument)] text-3xl text-white">
              {display}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              / 100
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-lg font-semibold tracking-tight"
            style={{ color: label.color }}
          >
            {label.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {label.description}
          </p>
          {st !== "complete" ? (
            <p className="mt-2 text-xs text-blue-300/90">Analyzing…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
