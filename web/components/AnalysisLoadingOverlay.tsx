"use client";

type Props = {
  open: boolean;
  message: string;
  step: number;
};

const steps = [
  "Parsing bibliography…",
  "Resolving identifiers…",
  "Scanning retraction corpus…",
  "Building cascade graph…",
];

export function AnalysisLoadingOverlay({ open, message, step }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/85 p-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 rw-float">
          <span className="text-2xl" aria-hidden>
            ⚗️
          </span>
        </div>
        <p className="text-center text-sm font-medium text-white">{message}</p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, ((step + 1) / steps.length) * 100)}%` }}
          />
        </div>
        <ul className="mt-6 space-y-2 text-xs text-slate-400">
          {steps.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 ${
                i <= step ? "text-slate-200" : ""
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i < step
                    ? "bg-emerald-400"
                    : i === step
                      ? "bg-blue-400 animate-pulse"
                      : "bg-slate-600"
                }`}
              />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
