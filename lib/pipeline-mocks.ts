/**
 * Mock implementations for the integrity pipeline (USE_MOCKS=true).
 */

import type { ReferenceRow, ReplacementRow, RetractionRecord } from "./pipeline-types";

export async function mockResolveDoiFromTitle(title: string): Promise<string> {
  return "mock-doi-" + Math.random().toString(36).slice(2);
}

export async function mockIsRetracted(
  _doi: string,
): Promise<RetractionRecord | null> {
  if (Math.random() < 0.2) {
    return {
      retractionReason: "Simulated fraud",
      retractionDate: "2022",
      retractionCountry: "Unknown",
      retractionJournal: "Mock Journal",
    };
  }
  return null;
}

export async function mockGetReferences(_doi: string): Promise<ReferenceRow[]> {
  return Array.from({ length: 5 }).map((_, i) => ({
    title: "Reference " + i,
    doi: "ref-" + i,
    authors: "Author",
  }));
}

export async function mockFindReplacementPapers(
  _title: string,
  _year: number | string | undefined,
): Promise<ReplacementRow[]> {
  return [
    {
      title: "Better Study 1",
      url: "#",
      summary: "Replacement",
      publishedDate: "2021",
      relevanceScore: 1,
    },
    {
      title: "Better Study 2",
      url: "#",
      summary: "Replacement",
      publishedDate: "2022",
      relevanceScore: 0.85,
    },
  ];
}
