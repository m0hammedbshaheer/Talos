// DOCUMENTATION NOTE: Downstream risk estimates how far bad citations might spread if
// your work is cited by others—rough "contagion" numbers for demos, not exact forecasts.

import type { Citation } from "./scoring";

export interface DownstreamRisk {
  estimatedDirectCitations: number;
  estimatedDownstreamPapers: number;
  worstCaseDownstream: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  explanation: string;
}

const AVG_CITATIONS_PER_PAPER = 12;

const ZERO_RISK: DownstreamRisk = {
  estimatedDirectCitations: 0,
  estimatedDownstreamPapers: 0,
  worstCaseDownstream: 0,
  riskLevel: "low",
  explanation: "No contamination detected. Zero downstream risk.",
};

export function calculateDownstreamRisk(citations: Citation[]): DownstreamRisk {
  try {
    if (!Array.isArray(citations)) return { ...ZERO_RISK };

    const totalFlagged = citations.filter(
      (c) =>
        c &&
        typeof c === "object" &&
        (c.status === "retracted" || c.status === "cascade"),
    ).length;

    if (totalFlagged === 0) {
      return { ...ZERO_RISK };
    }

    const estimatedDirectCitations = totalFlagged * AVG_CITATIONS_PER_PAPER;
    // DEMO MOMENT: headline downstream estimates for the live demo slide.
    const estimatedDownstreamPapers = Math.round(
      totalFlagged * AVG_CITATIONS_PER_PAPER * 2.1,
    );
    const worstCaseDownstream = totalFlagged * 25 * 3;

    let riskLevel: DownstreamRisk["riskLevel"] = "low";
    if (estimatedDownstreamPapers > 300) riskLevel = "critical";
    else if (estimatedDownstreamPapers > 100) riskLevel = "high";
    else if (estimatedDownstreamPapers > 30) riskLevel = "moderate";

    const explanation = `If your paper is cited ${estimatedDirectCitations} times, ~${estimatedDownstreamPapers} downstream papers could inherit this contamination.`;

    return {
      estimatedDirectCitations,
      estimatedDownstreamPapers,
      worstCaseDownstream,
      riskLevel,
      explanation,
    };
  } catch {
    return { ...ZERO_RISK };
  }
}
