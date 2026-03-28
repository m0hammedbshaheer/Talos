"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalysisLoadingOverlay } from "@/components/AnalysisLoadingOverlay";

export default function HomePage() {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [step, setStep] = useState(0);

  const runPreview = useCallback(async () => {
    setError("");
    setLoading(true);
    setStep(0);
    setLoadMsg("Preparing your bibliography preview…");

    const delays = [450, 600, 700, 500];
    for (let i = 0; i < delays.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, delays[i]));
    }

    setLoadMsg("Opening results dashboard…");
    await new Promise((r) => setTimeout(r, 350));
    setLoading(false);
    router.push("/results/demo");
  }, [router]);

  const onFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Please upload a PDF file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF must be under 10MB for this preview.");
        return;
      }
      void runPreview();
    },
    [runPreview],
  );

  const onPasteAnalyze = useCallback(() => {
    if (!paste.trim()) {
      setError("Paste at least one reference line, or upload a PDF.");
      return;
    }
    void runPreview();
  }, [paste, runPreview]);

  return (
    <>
      <AnalysisLoadingOverlay open={loading} message={loadMsg} step={step} />
      <div className="relative min-h-dvh">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        <SiteHeader />

        <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-12">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80">
            RetractWatch
          </p>
          <h1 className="mt-3 text-center font-[family-name:var(--font-instrument)] text-4xl leading-tight text-white sm:text-5xl">
            Detect retracted science
            <span className="block text-slate-400 sm:mt-1">
              before your reviewers do
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-slate-400">
            Frontend-only preview: polished dashboard with mock integrity data.
            Your backend teammate can plug real extraction and Convex later —
            the UI is ready.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              45,000+ retractions tracked
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Cascade visualization
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Built for researchers
            </span>
          </div>

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
            className={`mt-12 rounded-2xl border-2 border-dashed p-10 text-center transition ${
              drag
                ? "border-blue-400 bg-blue-500/10 shadow-[0_0_48px_rgba(59,130,246,0.2)]"
                : "border-slate-600/60 bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-900/60"
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
                or click to browse · mock run, no upload leaves your machine
              </span>
            </label>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-300">{error}</p>
          )}

          <div className="relative my-10 flex items-center gap-4">
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
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="button"
            onClick={onPasteAnalyze}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-blue-400"
          >
            Analyze bibliography (preview)
          </button>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 border-t border-white/5 py-4 text-center text-xs text-slate-600">
          Free. No account required. Built for researchers · Talos / RetractWatch
        </footer>
      </div>
    </>
  );
}
