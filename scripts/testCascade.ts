import { getReferences } from "../lib/semanticScholar";

/** Prompt DOI — Semantic Scholar often returns no reference list (publisher-elided). */
const promptDoi = "10.1016/S0140-6736(97)11096-0";
/** Paper with a public reference graph on S2 (smoke test). */
const demoDoi = "10.1038/nature12373";

function summarize(
  doi: string,
  r: Awaited<ReturnType<typeof getReferences>>,
) {
  if (!r.ok) {
    console.log(`Result for ${doi}: FAILED — ${r.message}`, {
      statusCode: r.statusCode,
      rateLimited: r.rateLimited,
    });
    return;
  }
  console.log(`Result for ${doi}: ok, ${r.references.length} references with DOIs`);
  r.references.slice(0, 5).forEach((ref, i) => {
    console.log(`${i + 1}. ${ref.doi} — ${ref.title.slice(0, 70)}…`);
  });
}

async function main() {
  console.log("\n========== testCascade (Semantic Scholar + retries + logs) ==========\n");

  let out = await getReferences(promptDoi);
  summarize(promptDoi, out);
  if (out.ok && out.references.length === 0) {
    console.log(
      "(If still empty after retry: S2 may omit DOIs for this record — try another DOI.)\n",
    );
  }

  console.log(`\nSmoke test ${demoDoi}:`);
  out = await getReferences(demoDoi);
  summarize(demoDoi, out);

  console.log("\n========== done ==========\n");
}

main();
