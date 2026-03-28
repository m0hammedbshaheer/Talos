import { resolveDoiFromTitle } from "../lib/crossref";

const titles = [
  "Retracted paper: Ileal-lymphoid-nodular hyperplasia",
  "A completely made up title that will not match anything 12345",
  "CRISPR-Cas9 genome editing in human embryos",
];

/** Longer title — CrossRef scores are often below 50 for very short queries. */
const wakefieldFull =
  "Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental disorder in children";

async function main() {
  for (const t of titles) {
    const doi = await resolveDoiFromTitle(t);
    console.log(`Title: ${t.slice(0, 60)}…\n  DOI: ${doi ?? "null"}\n`);
  }
  const w = await resolveDoiFromTitle(wakefieldFull);
  console.log(`Wakefield (full title)\n  DOI: ${w ?? "null"}`);
}

main();
