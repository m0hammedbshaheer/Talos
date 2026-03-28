import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link href="/" className="group flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl shadow-[0_0_24px_rgba(59,130,246,0.25)] transition group-hover:border-blue-400/40 group-hover:shadow-[0_0_32px_rgba(59,130,246,0.35)]"
          aria-hidden
        >
          🧬
        </span>
        <div>
          <p className="font-[family-name:var(--font-instrument)] text-xl tracking-tight text-white sm:text-2xl">
            RetractWatch
          </p>
          <p className="text-xs text-slate-400">
            Bibliography integrity for serious research
          </p>
        </div>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Frontend preview · mock data
        </span>
      </nav>
    </header>
  );
}
