import { getReferences } from "../lib/semanticScholar";

/** Prompt DOI — Semantic Scholar often returns no reference list (publisher-elided). */
const promptDoi = "10.1016/S0140-6736(97)11096-0";
/** Paper with a public reference graph on S2 (smoke test). */
const demoDoi = "10.1038/nature12373";

async function main() {
  let refs = await getReferences(promptDoi);
  console.log(`References for ${promptDoi}: ${refs.length} with DOIs`);
  if (refs.length === 0) {
    console.log(
      "(Expected: S2 may omit references for this record — try another DOI for demos.)\n",
    );
  }
  refs.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.doi} — ${r.title.slice(0, 70)}…`);
  });

  console.log(`\nSmoke test ${demoDoi}:`);
  refs = await getReferences(demoDoi);
  console.log(`Found ${refs.length} references with DOIs`);
  refs.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.doi} — ${r.title.slice(0, 70)}…`);
  });
}

main();
