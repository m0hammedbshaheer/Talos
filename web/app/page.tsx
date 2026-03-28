"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalysisLoadingOverlay } from "@/components/AnalysisLoadingOverlay";

type CheckResult = {
  jobId: string;
  status: string;
  integrityScore: number;
  historicalComparison: unknown;
  downstreamRisk: unknown;
  citations: unknown[];
};

export default function HomePage() {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [step, setStep] = useState(0);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearStepTimer = () => {
    if (stepTimerRef.current !== null) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const runAnalysis = useCallback(
    async (file?: File | null, pasteText?: string) => {
      setError("");
      setLoading(true);
      setStep(0);
      setLoadMsg("Extracting bibliography…");

      try {
        let citations: unknown[];

        if (file) {
          const formData = new FormData();
          formData.append("pdf", file);
          const extractRes = await fetch("/api/extract", {
            method: "POST",
            body: formData,
          });
          if (!extractRes.ok) {
            const e = (await extractRes.json()) as { error?: string };
            throw new Error(e.error ?? "Failed to extract PDF");
          }
          const extracted = (await extractRes.json()) as {
            citations?: unknown[];
          };
          citations = extracted.citations ?? [];
          if (!citations.length)
            throw new Error("No references found in this PDF.");
        } else {
          // Parse pasted references — each non-empty line becomes a citation
          citations = (pasteText ?? "")
            .split("\n")
            .map((line, i) => ({ id: `c${i + 1}`, title: line.trim() }))
            .filter((c) => (c as { title: string }).title.length > 8);
          if (!citations.length)
            throw new Error("Paste at least one reference line.");
        }

        setStep(1);
        setLoadMsg("Checking 57,393 retraction records…");

        // Advance steps while pipeline runs (30–60 s for real papers)
        stepTimerRef.current = setInterval(() => {
          setStep((s) => {
            const next = Math.min(s + 1, 2);
            if (next === 2) setLoadMsg("Detecting cascade contamination…");
            return next;
          });
        }, 18000);

        const checkRes = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ citations }),
        });

        clearStepTimer();

        if (!checkRes.ok) {
          const e = (await checkRes.json()) as { error?: string };
          throw new Error(e.error ?? "Analysis failed. Try again.");
        }

        const result = (await checkRes.json()) as CheckResult;

        // Persist results so the results page can render without Convex
        sessionStorage.setItem(
          `rw:job:${result.jobId}`,
          JSON.stringify(result),
        );

        setStep(3);
        setLoadMsg("Opening results dashboard…");
        await new Promise((r) => setTimeout(r, 400));

        router.push(`/results/${result.jobId}`);
      } catch (err) {
        clearStepTimer();
        setError(
          err instanceof Error ? err.message : "Something went wrong. Try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const onFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Please upload a PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF must be under 10MB.");
        return;
      }
      void runAnalysis(file);
    },
    [runAnalysis],
  );

  const onPasteAnalyze = useCallback(() => {
    if (!paste.trim()) {
      setError("Paste at least one reference line, or upload a PDF.");
      return;
    }
    void runAnalysis(undefined, paste);
  }, [paste, runAnalysis]);

  const sampleCitations = [
    { label: "retracted", dot: "bg-red-500", title: "Surgisphere COVID study" },
    { label: "cascade", dot: "bg-orange-400", title: "Meta-analysis of antivirals" },
    { label: "clean", dot: "bg-emerald-500", title: "Biostatistics in RCTs" },
    { label: "clean", dot: "bg-emerald-500", title: "Viral immunology review" },
  ];

  return (
    <>
      <AnalysisLoadingOverlay open={loading} message={loadMsg} step={step} />
      <div className="rw-landing-shell rw-bg rw-grid">
        <div className="rw-landing-aurora" aria-hidden />
        <div className="rw-landing-orb rw-landing-orb--a" aria-hidden />
        <div className="rw-landing-orb rw-landing-orb--b" aria-hidden />

        <div className="relative z-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
          <SiteHeader />

          <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
            {/* Hero */}
            <section className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/85">
                RetractWatch
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-instrument)] text-4xl leading-tight text-white sm:text-5xl sm:leading-tight">
                Detect retracted science
                <span className="mt-1 block text-slate-400 sm:mt-2">
                  before your reviewers do
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-slate-300 sm:text-[1.05rem]">
                45,000+ papers have been retracted. 95% of post-retraction
                citations never acknowledge it. Is your research unknowingly
                built on one?
              </p>
            </section>

            {/* Stats pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                "57,000+ retractions tracked",
                "Cascade contamination detection",
                "Replacement citations included",
              ].map((label) => (
                <span
                  key={label}
                  className="rw-stat-pill rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* How it works */}
            <section className="mt-12 sm:mt-14">
              <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                How it works
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                  {
                    icon: "📄",
                    title: "Upload your PDF",
                    body: "Drop your manuscript or paste references — we extract the bibliography.",
                  },
                  {
                    icon: "🔍",
                    title: "We scan 57,000 retractions",
                    body: "Powered by the Retraction Watch database — 57,393 records and growing.",
                  },
                  {
                    icon: "📊",
                    title: "Get your integrity score",
                    body: "Direct + cascade detection, two levels deep, with replacement suggestions.",
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-center backdrop-blur-sm sm:p-4"
                  >
                    <span className="text-xl sm:text-2xl" aria-hidden>
                      {s.icon}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {s.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-slate-400">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust bar */}
            <p className="mt-8 text-center text-xs text-slate-500 sm:mt-10">
              Powered by{" "}
              <span className="text-slate-400">Retraction Watch</span>
              {" · "}
              <span className="text-slate-400">CrossRef</span>
              {" · "}
              <span className="text-slate-400">Semantic Scholar</span>
            </p>

            {/* Upload */}
            <section className="mt-6">
              <div
                role="button"
                tabIndex={0}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDrag(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const f = e.dataTransfer.files[0];
                  onFile(f ?? null);
                }}
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
                  drag
                    ? "border-blue-400/70 bg-blue-950/30 shadow-[0_0_40px_rgba(37,99,235,0.18)]"
                    : "border-slate-500/55 bg-slate-900/45 hover:border-blue-400/45 hover:bg-slate-900/55"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  id="pdf-input"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="pdf-input"
                  className="cursor-pointer text-sm text-slate-300"
                >
                  <span className="mb-2 block text-3xl" aria-hidden>
                    📄
                  </span>
                  <span className="font-semibold text-white">
                    Drop your PDF here
                  </span>
                  <span className="mt-1 block text-slate-500">
                    or click to browse
                  </span>
                </label>
              </div>
              <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                Your PDF is never stored. Processed and discarded immediately.
              </p>
            </section>

            {error ? (
              <p className="mt-4 text-center text-sm text-red-300">{error}</p>
            ) : null}

            <div className="relative my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
              <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                or
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
            </div>

            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Paste references (one per line)
            </label>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={5}
              placeholder="e.g. Smith J. Example study. Nature. 2020; doi:10.xxxx/..."
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
            />

            <button
              type="button"
              onClick={onPasteAnalyze}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:from-blue-800 hover:to-blue-700 hover:shadow-blue-900/35"
            >
              Analyze Bibliography
            </button>

            {/* ── Sample output — realistic static preview of results ── */}
            <section className="mt-12 sm:mt-14">
              {/* Section label */}
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700/60" />
                <span className="flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-950/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400/70" />
                  Output preview
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700/60" />
              </div>

              {/* Animated border frame */}
              <div className="rw-demo-frame">
                <div className="rw-demo-frame-inner">
                  {/* "Not real data" notice strip */}
                  <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                      Demo · not your real results
                    </span>
                    <span className="rounded border border-blue-500/20 bg-blue-950/40 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-blue-400/70">
                      Preview
                    </span>
                  </div>

              <div className="pointer-events-none select-none p-4 text-left sm:p-5">

                {/* Row 1: Integrity score · Historical match · Downstream risk */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">

                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Integrity</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 -rotate-90" aria-hidden>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="5"/>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="#f87171" strokeWidth="5"
                          strokeLinecap="round" strokeDasharray="113" strokeDashoffset="44"/>
                      </svg>
                      <div>
                        <p className="text-base font-bold leading-none text-white">
                          61<span className="text-[9px] font-normal text-slate-400">/100</span>
                        </p>
                        <p className="mt-0.5 text-[8px] font-semibold uppercase text-red-300">Risk</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-red-300/80">Historical</p>
                    <p className="mt-1.5 text-[9px] font-medium leading-snug text-white">Similar to Surgisphere COVID papers</p>
                    <p className="mt-1 text-[8px] text-red-200/70">Caught after <span className="font-bold text-white">18 mo</span></p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Downstream</p>
                    <p className="mt-1.5 text-xl font-bold leading-none text-orange-300">~340</p>
                    <p className="mt-0.5 text-[8px] text-slate-400">papers at risk</p>
                  </div>
                </div>

                {/* Row 2: Citation feed · Cascade graph */}
                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">

                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Citations</p>
                    <div className="mt-2 space-y-1.5">
                      {sampleCitations.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.dot}`} />
                          <span className="truncate text-[8px] text-slate-300">{r.title}</span>
                          <span className={`ml-auto shrink-0 rounded px-1 py-0.5 text-[7px] font-semibold uppercase ${
                            r.label === "retracted" ? "bg-red-900/60 text-red-200"
                            : r.label === "cascade" ? "bg-orange-900/60 text-orange-200"
                            : "bg-emerald-900/40 text-emerald-300"
                          }`}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Cascade map</p>
                    <svg viewBox="0 0 120 84" className="mt-1.5 w-full" aria-hidden>
                      {/* Root node */}
                      <rect x="40" y="3" width="40" height="13" rx="3"
                        fill="rgba(59,130,246,0.2)" stroke="rgba(96,165,250,0.45)" strokeWidth="0.8"/>
                      <text x="60" y="12" textAnchor="middle" fontSize="4.5" fill="#e2e8f0" fontWeight="600">Your paper</text>
                      {/* Edges */}
                      <line x1="60" y1="16" x2="18" y2="34" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8"/>
                      <line x1="60" y1="16" x2="60" y2="34" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8"/>
                      <line x1="60" y1="16" x2="102" y2="34" stroke="rgba(248,113,113,0.55)" strokeWidth="1" strokeDasharray="2 1.5"/>
                      <path d="M60 16 Q34 28 20 48" fill="none" stroke="rgba(251,146,60,0.5)" strokeWidth="1"/>
                      {/* Level 1 nodes */}
                      <rect x="4" y="34" width="28" height="12" rx="3"
                        fill="rgba(16,185,129,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="0.8"/>
                      <text x="18" y="42" textAnchor="middle" fontSize="4" fill="#6ee7b7">clean</text>
                      <rect x="46" y="34" width="28" height="12" rx="3"
                        fill="rgba(16,185,129,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="0.8"/>
                      <text x="60" y="42" textAnchor="middle" fontSize="4" fill="#6ee7b7">clean</text>
                      <rect x="88" y="34" width="28" height="12" rx="3"
                        fill="rgba(185,28,28,0.3)" stroke="rgba(248,113,113,0.55)" strokeWidth="0.8"/>
                      <text x="102" y="42" textAnchor="middle" fontSize="4" fill="#fca5a5" fontWeight="600">retracted</text>
                      {/* Cascade node */}
                      <rect x="6" y="50" width="28" height="12" rx="3"
                        fill="rgba(194,65,12,0.3)" stroke="rgba(251,146,60,0.55)" strokeWidth="0.8"/>
                      <text x="20" y="58" textAnchor="middle" fontSize="4" fill="#fdba74" fontWeight="600">cascade</text>
                      <line x1="34" y1="56" x2="88" y2="50" stroke="rgba(248,113,113,0.25)" strokeWidth="0.7" strokeDasharray="2 1.5"/>
                      {/* Legend */}
                      <circle cx="10" cy="76" r="2" fill="#34d399"/>
                      <text x="14" y="78" fontSize="4" fill="#64748b">clean</text>
                      <circle cx="38" cy="76" r="2" fill="#fb923c"/>
                      <text x="42" y="78" fontSize="4" fill="#64748b">cascade</text>
                      <circle cx="72" cy="76" r="2" fill="#f87171"/>
                      <text x="76" y="78" fontSize="4" fill="#64748b">retracted</text>
                    </svg>
                  </div>
                </div>

                <p className="mt-3 text-center text-[9px] text-slate-600">
                  Sample — 12-citation paper · 1 direct retraction · 1 cascade contamination detected
                </p>
              </div>
                </div>{/* /rw-demo-frame-inner */}
              </div>{/* /rw-demo-frame */}
            </section>

            {/* The stakes */}
            <section className="mt-12 rounded-2xl border border-red-900/35 bg-gradient-to-b from-red-950/35 to-slate-950/80 p-5 sm:mt-14 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-red-300/90">
                The stakes
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>
                  The Wakefield vaccine paper was cited{" "}
                  <strong className="text-white">881 times</strong> after
                  retraction.
                </li>
                <li>
                  The average retracted paper is still being cited{" "}
                  <strong className="text-white">25 times</strong>{" "}
                  post-retraction.
                </li>
                <li>
                  Only{" "}
                  <strong className="text-white">5.4%</strong> of those
                  citations acknowledge the retraction.
                </li>
              </ul>
            </section>

            {/* Who is this for */}
            <section className="mt-12 sm:mt-14">
              <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Who is this for
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                  {
                    icon: "🎓",
                    title: "PhD students",
                    body: "Check before your defense",
                  },
                  {
                    icon: "📝",
                    title: "Journal authors",
                    body: "Submit with confidence",
                  },
                  {
                    icon: "🔬",
                    title: "Research labs",
                    body: "Audit your team's work",
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 text-center sm:p-4"
                  >
                    <span className="text-lg sm:text-xl" aria-hidden>
                      {c.icon}
                    </span>
                    <p className="mt-1.5 text-sm font-semibold text-white">
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-400">
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <footer className="relative z-10 border-t border-white/10 bg-slate-950/90">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
              <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Data sources
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Powered by the{" "}
                    <span className="text-slate-300">Retraction Watch</span>{" "}
                    database —{" "}
                    <span className="text-slate-300">57,393</span> records.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Privacy &amp; methodology
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    We never store your paper.{" "}
                    <span className="text-slate-300">Zero retention.</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Direct + cascade detection —{" "}
                    <span className="text-slate-400">2 levels deep</span>.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Free. No account required.
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-instrument)] text-base text-slate-300">
                    RetractWatch <span className="text-slate-500">V2</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-between">
                <p className="text-center text-[11px] text-slate-600 sm:text-left">
                  © {new Date().getFullYear()} RetractWatch · Talos
                </p>
                <p className="text-center text-[11px] text-slate-600">
                  Built for researchers
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
