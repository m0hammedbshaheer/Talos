import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl shadow-[0_0_20px_rgba(37,99,235,0.18)] transition group-hover:border-blue-400/35"
            aria-hidden
          >
            🔬
          </span>
          <div className="min-w-0 text-left">
            <p className="font-[family-name:var(--font-instrument)] text-lg tracking-tight text-white sm:text-xl">
              RetractWatch
            </p>
            <p className="truncate text-[11px] text-slate-500 sm:text-xs">
              Bibliography integrity for serious research
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="hidden text-right text-[10px] leading-tight text-slate-500 sm:block sm:max-w-[200px]">
            Retraction Watch · CrossRef · Semantic Scholar
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 sm:px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              V2
            </span>
            <span className="h-3 w-px bg-white/15" aria-hidden />
            <span className="text-[10px] text-slate-500">57K+ DB</span>
          </div>
        </div>
      </div>
    </header>
  );
}
