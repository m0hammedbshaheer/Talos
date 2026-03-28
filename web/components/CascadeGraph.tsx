"use client";

import type { MockCitation } from "@/lib/mockData";

type Props = {
  citations: MockCitation[];
  highlightId: string | null;
};

/** SVG “network” — no D3; tuned for hackathon demo clarity. */
export function CascadeGraph({ citations, highlightId }: Props) {
  const retracted = citations.filter((c) => c.status === "retracted");
  const cascade = citations.filter((c) => c.status === "cascade");
  const clean = citations.filter((c) => c.status === "clean");

  const hubY = 108;

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-md">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-sm font-semibold text-white">
          Contamination map
        </h2>
        <p className="text-xs text-slate-400">
          Your paper → citations → retracted upstream (illustrative layout)
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Clean
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-400" /> Cascade
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Retracted
          </span>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden p-2 sm:p-4">
        <svg
          viewBox="0 0 400 260"
          className="h-full w-full max-h-[320px]"
          role="img"
          aria-label="Citation contamination graph"
        >
          <defs>
            <linearGradient id="rw-edge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.35)" />
              <stop offset="100%" stopColor="rgba(248,113,113,0.5)" />
            </linearGradient>
            <filter id="rw-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Your paper */}
          <g>
            <rect
              x="148"
              y="8"
              width="104"
              height="36"
              rx="10"
              className="fill-blue-500/20 stroke-blue-400/50"
              strokeWidth="1"
            />
            <text
              x="200"
              y="30"
              textAnchor="middle"
              className="fill-slate-100 text-[11px] font-semibold"
            >
              Your manuscript
            </text>
          </g>

          {/* Edges from manuscript to layer 1 */}
          {clean.slice(0, 3).map((c, i) => {
            const x = 80 + i * 90;
            return (
              <line
                key={c.id}
                x1="200"
                y1="44"
                x2={x}
                y2={hubY - 24}
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Retracted direct edge */}
          {retracted[0] && (
            <>
              <line
                x1="200"
                y1="44"
                x2="320"
                y2={hubY - 24}
                stroke="url(#rw-edge)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </>
          )}

          {/* Cascade path: manuscript → cascade node → retracted */}
          {cascade[0] && retracted[0] && (
            <>
              <path
                d="M 200 44 Q 160 90 120 120"
                fill="none"
                stroke="rgba(251,146,60,0.55)"
                strokeWidth="2"
              />
              <line
                x1="120"
                y1="120"
                x2="300"
                y2="150"
                stroke="rgba(248,113,113,0.45)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </>
          )}

          {/* Layer: sample citations */}
          {clean.slice(0, 3).map((c, i) => {
            const x = 56 + i * 90;
            const hi = highlightId === c.id;
            return (
              <g key={c.id} filter={hi ? "url(#rw-glow)" : undefined}>
                <rect
                  x={x - 36}
                  y={hubY - 24}
                  width="72"
                  height="28"
                  rx="8"
                  className={
                    hi
                      ? "fill-emerald-500/25 stroke-emerald-300/60"
                      : "fill-emerald-950/40 stroke-emerald-500/30"
                  }
                  strokeWidth="1.2"
                />
                <text
                  x={x}
                  y={hubY - 6}
                  textAnchor="middle"
                  className="fill-emerald-100 text-[9px]"
                >
                  Clean
                </text>
              </g>
            );
          })}

          {retracted[0] && (
            <g filter={highlightId === retracted[0].id ? "url(#rw-glow)" : ""}>
              <rect
                x="272"
                y={hubY - 28}
                width="96"
                height="36"
                rx="10"
                className="fill-red-950/70 stroke-red-400/60"
                strokeWidth="1.5"
              />
              <text
                x="320"
                y={hubY - 12}
                textAnchor="middle"
                className="fill-red-100 text-[9px] font-semibold"
              >
                Direct retraction
              </text>
            </g>
          )}

          {cascade[0] && (
            <g filter={highlightId === cascade[0].id ? "url(#rw-glow)" : ""}>
              <rect
                x="72"
                y="112"
                width="96"
                height="36"
                rx="10"
                className="fill-orange-950/70 stroke-orange-400/55"
                strokeWidth="1.5"
              />
              <text
                x="120"
                y="132"
                textAnchor="middle"
                className="fill-orange-100 text-[9px] font-semibold"
              >
                Cascade hit
              </text>
            </g>
          )}

          {/* Root retracted node */}
          {retracted[0] && (
            <g>
              <circle
                cx="320"
                cy="190"
                r="22"
                className="fill-red-600/30 stroke-red-400/80"
                strokeWidth="2"
                filter="url(#rw-glow)"
              />
              <text
                x="320"
                y="194"
                textAnchor="middle"
                className="fill-red-50 text-[9px] font-bold"
              >
                RW
              </text>
              <text
                x="200"
                y="236"
                textAnchor="middle"
                className="fill-slate-500 text-[9px]"
              >
                Retracted source in Retraction Watch DB (conceptual)
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
