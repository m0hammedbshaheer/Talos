export interface Citation {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  doi: string | null;
  status:
    | "pending"
    | "checking"
    | "clean"
    | "retracted"
    | "cascade"
    | "unverified";
  retractionReason?: string;
  retractionDate?: string;
  retractionCountry?: string;
  retractionJournal?: string;
  cascadeDepth?: number;
  cascadeVia?: string;
}

export type IntegrityScore = number;

export function calculateIntegrityScore(citations: Citation[]): IntegrityScore {
  try {
    if (!Array.isArray(citations) || citations.length === 0) return 100;

    let score = 100;
    for (const c of citations) {
      if (!c || typeof c !== "object") continue;
      if (c.status === "retracted") score -= 15;
      else if (c.status === "cascade") score -= 7;
      else if (c.status === "unverified") score -= 1;
    }
    return Math.max(0, Math.round(score));
  } catch {
    return 100;
  }
}

export interface ScoreLabel {
  label: string;
  color: string;
  description: string;
}

export function getScoreLabel(score: number): ScoreLabel {
  try {
    const s = typeof score === "number" && !Number.isNaN(score) ? score : 0;
    if (s >= 90) {
      return {
        label: "CLEAN",
        color: "#22c55e",
        description: "No serious integrity flags detected in checked citations.",
      };
    }
    if (s >= 70) {
      return {
        label: "REVIEW RECOMMENDED",
        color: "#f59e0b",
        description: "Some citations need a closer look before you rely on this bibliography.",
      };
    }
    if (s >= 50) {
      return {
        label: "SIGNIFICANT RISK",
        color: "#ef4444",
        description: "Multiple integrity concerns; verify sources before publication or policy use.",
      };
    }
    return {
      label: "CRITICAL",
      color: "#7f1d1d",
      description: "Severe integrity risk—retraction or cascade issues dominate this reference list.",
    };
  } catch {
    return {
      label: "CLEAN",
      color: "#22c55e",
      description: "No serious integrity flags detected in checked citations.",
    };
  }
}
