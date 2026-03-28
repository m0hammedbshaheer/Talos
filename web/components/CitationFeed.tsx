"use client";

import { useMemo, useState } from "react";
import type { CitationRow } from "@/lib/citationRow";
import { OriginBadge } from "./OriginBadge";

type Props = {
  citations: CitationRow[] | undefined | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const statusStyle: Record<string, string> = {
  pending: "bg-slate-700/50 text-slate-300 ring-slate-500/20",
  checking: "bg-blue-950/60 text-blue-200 ring-blue-500/30",
  clean: "bg-emerald-950/50 text-emerald-200 ring-emerald-500/25",
  retracted: "bg-red-950/60 text-red-200 ring-red-500/35",
  cascade: "bg-orange-950/50 text-orange-200 ring-orange-500/30",
  unverified: "bg-amber-950/40 text-amber-200 ring-amber-500/25",
};

function statusLabel(s: string | undefined | null) {
  const v = s ?? "pending";
  if (v === "cascade") return "cascade";
  return v;
}

export function CitationFeed({ citations, selectedId, onSelect }: Props) {
  const list = useMemo(() => citations ?? [], [citations]);
  const [filter, setFilter] = useState<string | "all">("all");

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of list) {
      const st = c?.status ?? "pending";
      m[st] = (m[st] ?? 0) + 1;
    }
    return m;
  }, [list]);

  const filtered =
    filter === "all"
      ? list
      : list.filter((c) => (c?.status ?? "pending") === filter);

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-white/10 bg-[var(--rw-card)] backdrop-blur-md">
      <div className="border-b border-white/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Citation feed</h2>
            <p className="text-xs text-slate-400">
              {list.length} reference{list.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", list.length],
                ["retracted", counts.retracted ?? 0],
                ["cascade", counts.cascade ?? 0],
                ["clean", counts.clean ?? 0],
                ["unverified", counts.unverified ?? 0],
              ] as const
            ).map(([key, n]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  filter === key
                    ? "bg-blue-500/25 text-blue-100 ring-1 ring-blue-400/40"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {key === "all" ? "All" : key}{" "}
                <span className="text-slate-500">({n})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <ul className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
        {filtered.map((c, i) => {
          const id = c?.id ?? `row-${i}`;
          const st = c?.status ?? "pending";
          const active = selectedId === id;
          const pillClass =
            statusStyle[st] ?? statusStyle.pending;

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(active ? null : id)}
                className={`w-full rounded-xl border text-left transition ${
                  active
                    ? "border-blue-400/50 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.12)]"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-900/50"
                }`}
                style={{
                  animationDelay: `${i * 45}ms`,
                }}
              >
                <div className="flex gap-3 p-3 sm:p-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-mono text-slate-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${pillClass}`}
                      >
                        {statusLabel(st)}
                      </span>
                      {c?.doi ? (
                        <span className="truncate font-mono text-[10px] text-slate-500">
                          {c.doi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500/90">
                          No DOI
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium leading-snug text-slate-100">
                      {c?.title?.trim() ? c.title : "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {c?.authors?.trim() ? c.authors : "—"}
                      {c?.year != null ? ` · ${c.year}` : ""}
                    </p>
                    {(st === "retracted" || st === "cascade") &&
                    (c?.retractionCountry || c?.retractionJournal) ? (
                      <OriginBadge
                        country={c?.retractionCountry}
                        journal={c?.retractionJournal}
                        reason={
                          c?.retractionReason ??
                          (st === "cascade"
                            ? "Cascade via retracted upstream"
                            : "Retracted")
                        }
                        retractionDate={c?.retractionDate}
                      />
                    ) : null}
                    {st === "cascade" && c?.cascadeVia ? (
                      <p className="mt-2 text-[11px] text-orange-200/90">
                        Via upstream:{" "}
                        <span className="text-orange-100">{c.cascadeVia}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
