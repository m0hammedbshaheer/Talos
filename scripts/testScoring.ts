import { calculateDownstreamRisk } from "../lib/downstreamRisk";
import { calculateIntegrityScore, type Citation } from "../lib/scoring";

/** Pre-refactor model: flat deductions (for A/B comparison only). */
function calculateIntegrityScoreLegacy(citations: Citation[]): number {
  if (!Array.isArray(citations) || citations.length === 0) return 100;
  let score = 100;
  for (const c of citations) {
    if (!c || typeof c !== "object") continue;
    if (c.status === "retracted") score -= 15;
    else if (c.status === "cascade") score -= 7;
    else if (c.status === "unverified") score -= 1;
  }
  return Math.max(0, Math.round(score));
}

function clean(
  id: string,
  status: Citation["status"],
  extra?: Partial<Citation>,
): Citation {
  return {
    id,
    title: "T",
    authors: "A",
    year: 2020,
    doi: "10.0000/x",
    status,
    ...extra,
  };
}

function manyClean(n: number, startId: number): Citation[] {
  return Array.from({ length: n }, (_, i) =>
    clean(String(startId + i), "clean"),
  );
}

/** ~36 months ago → recency bucket 1.0× (2–5 years edge: use clearly inside band) */
const DATE_3Y_AGO = "2022-01-15";

function runComparison(name: string, citations: Citation[]) {
  const legacy = calculateIntegrityScoreLegacy(citations);
  const next = calculateIntegrityScore(citations);
  const risk = calculateDownstreamRisk(citations);
  console.log(`\n=== ${name} ===`);
  console.log(`Legacy (flat −15/−7) score: ${legacy}`);
  console.log(`New (proportion + reason + recency + caps) score: ${next}`);
  console.log("Downstream risk:", JSON.stringify(risk, null, 2));
}

// 1. One fraud retraction / 5 citations — strong ratio + 1.5× reason
const case1: Citation[] = [
  clean("1", "retracted", {
    retractionReason: "Fraud and data fabrication",
    retractionDate: DATE_3Y_AGO,
  }),
  ...manyClean(4, 2),
];

// 2. One “error” retraction / 50 — tiny ratio × 0.8, then cap at 85 for ≥1 retraction
const case2: Citation[] = [
  clean("1", "retracted", {
    retractionReason: "Retracted due to error in analysis",
    retractionDate: DATE_3Y_AGO,
  }),
  ...manyClean(49, 2),
];

// 3. Three mixed retractions / 30 — then cap at ≤65 for ≥3 retractions
const case3: Citation[] = [
  clean("1", "retracted", {
    retractionReason: "Data fabrication",
    retractionDate: DATE_3Y_AGO,
  }),
  clean("2", "retracted", {
    retractionReason: "Plagiarism of prior work",
    retractionDate: DATE_3Y_AGO,
  }),
  clean("3", "retracted", {
    retractionReason: "Honest mistake in reported values",
    retractionDate: DATE_3Y_AGO,
  }),
  ...manyClean(27, 4),
];

// 4. No direct retractions, 2 cascade / 20
const case4: Citation[] = [
  clean("1", "cascade"),
  clean("2", "cascade"),
  ...manyClean(18, 3),
];

console.log("\n========== Scoring: legacy vs new model ==========\n");

runComparison(
  "1) 1 retraction (fraud) / 5 citations (recency ~3y → 1.0×)",
  case1,
);
runComparison(
  "2) 1 retraction (error) / 50 citations (recency ~3y → 1.0×)",
  case2,
);
runComparison(
  "3) 3 retractions (fabrication + plagiarism + error) / 30",
  case3,
);
runComparison("4) 0 retractions, 2 cascade / 20", case4);

console.log("\n========== Done ==========\n");
