// DOCUMENTATION NOTE:
// This converts numeric risk into real-world comparison stories.

export type HistoricalCase = {
  name: string;
  severity: string;
  impact: string;
  avgMonthsToCatch: number;
};

const historicalCases: HistoricalCase[] = [
  {
    name: "Wakefield Vaccine-Autism Paper",
    severity: "catastrophic",
    impact: "Caused global measles outbreaks",
    avgMonthsToCatch: 144,
  },
  {
    name: "Surgisphere COVID-19 Studies",
    severity: "critical",
    impact: "Misled global health policy",
    avgMonthsToCatch: 2,
  },
  {
    name: "Cornell Food Lab",
    severity: "high",
    impact: "Influenced dietary guidelines",
    avgMonthsToCatch: 48,
  },
];

export type ComparisonSeverity = "catastrophic" | "critical" | "moderate" | "clean";

export type CitationForComparison = {
  retracted?: boolean;
  cascade?: boolean;
};

export type HistoricalComparison = {
  matchedCase: HistoricalCase | null;
  similarity: number;
  avgMonthsToCatch: number | null;
  impactDescription: string;
  severity: ComparisonSeverity;
};

function countFlags(
  citations: CitationForComparison[],
  key: "retracted" | "cascade",
): number {
  return citations.filter((c) => c[key] === true).length;
}

function similarityScore(
  severity: ComparisonSeverity,
  score: number,
  retracted: number,
  cascade: number,
): number {
  switch (severity) {
    case "catastrophic":
      return Math.min(
        100,
        Math.round(78 + retracted * 4 + Math.max(0, 49 - score) * 0.6),
      );
    case "critical":
      return Math.min(
        100,
        Math.round(55 + retracted * 12 + Math.max(0, 69 - score) * 0.5),
      );
    case "moderate":
      return Math.min(100, Math.round(40 + cascade * 14));
    default:
      return Math.max(0, Math.min(30, Math.round((score - 85) * 0.5 + 10)));
  }
}

export function compareToHistoricalCases(
  citations: CitationForComparison[],
  score: number,
): HistoricalComparison {
  const retracted = countFlags(citations, "retracted");
  const cascade = countFlags(citations, "cascade");

  let severity: ComparisonSeverity;
  let matchedCase: HistoricalCase | null;

  if (score < 50 || retracted >= 3) {
    severity = "catastrophic";
    matchedCase = historicalCases[0] ?? null;
  } else if (score < 70 || retracted >= 1) {
    severity = "critical";
    matchedCase = historicalCases[1] ?? null;
  } else if (cascade > 0) {
    severity = "moderate";
    matchedCase = historicalCases[2] ?? null;
  } else {
    severity = "clean";
    matchedCase = null;
  }

  const similarity = similarityScore(severity, score, retracted, cascade);
  const avgMonthsToCatch = matchedCase?.avgMonthsToCatch ?? null;
  const impactDescription = matchedCase
    ? matchedCase.impact
    : "No strong parallel to major known retraction scandals in this scan.";

  return {
    matchedCase,
    similarity,
    avgMonthsToCatch,
    impactDescription,
    severity,
  };
}
