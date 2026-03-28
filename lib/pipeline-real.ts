/**
 * Real API adapters for the integrity pipeline (USE_MOCKS=false).
 * No database clients — only HTTP and the Exa SDK.
 */

import type { ReferenceRow, ReplacementRow, RetractionRecord } from "./pipeline-types";
import { findReplacementPapers as exaFindReplacementPapers } from "./exa";

export async function realResolveDoiFromTitle(
  title: string,
): Promise<string | null> {
  const t = title.trim();
  if (!t) return null;
  try {
    const u = new URL("https://api.crossref.org/works");
    u.searchParams.set("query.title", t.slice(0, 200));
    u.searchParams.set("rows", "1");
    const r = await fetch(u.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      message?: { items?: Array<{ DOI?: string }> };
    };
    const doi = j?.message?.items?.[0]?.DOI;
    return typeof doi === "string" ? doi : null;
  } catch {
    return null;
  }
}

export async function realIsRetracted(
  doi: string,
): Promise<RetractionRecord | null> {
  try {
    const url = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      is_retracted?: boolean;
      publication_year?: number;
      primary_location?: {
        source?: { display_name?: string };
      };
    };
    if (!j.is_retracted) return null;
    return {
      retractionReason: "Listed as retracted in OpenAlex",
      retractionDate: String(j.publication_year ?? "unknown"),
      retractionCountry: "Unknown",
      retractionJournal:
        typeof j.primary_location?.source?.display_name === "string"
          ? j.primary_location.source.display_name
          : "Unknown",
    };
  } catch {
    return null;
  }
}

export async function realGetReferences(doi: string): Promise<ReferenceRow[]> {
  try {
    const workUrl = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`;
    const r = await fetch(workUrl, { headers: { Accept: "application/json" } });
    if (!r.ok) return [];
    const j = (await r.json()) as { referenced_works?: string[] };
    const refUrls = j.referenced_works;
    if (!Array.isArray(refUrls) || refUrls.length === 0) return [];

    const out: ReferenceRow[] = [];
    for (const refUrl of refUrls.slice(0, 5)) {
      try {
        const wr = await fetch(refUrl, {
          headers: { Accept: "application/json" },
        });
        if (!wr.ok) continue;
        const wj = (await wr.json()) as {
          title?: string;
          doi?: string;
        };
        const rawDoi = wj.doi?.replace("https://doi.org/", "") ?? "";
        out.push({
          title: typeof wj.title === "string" ? wj.title : "Unknown",
          doi: rawDoi || refUrl.split("/").pop() || refUrl,
          authors: "Author",
        });
      } catch {
        continue;
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function realFindReplacementPapers(
  title: string,
  year: number | string | undefined,
): Promise<ReplacementRow[]> {
  try {
    const q = [title, year].filter((x) => x !== undefined && x !== "").join(" ");
    const rows = await exaFindReplacementPapers(q.trim());
    return rows.map((r) => ({
      title: r.title,
      url: r.url,
      summary: r.summary,
      publishedDate: r.publishedDate ?? "",
      relevanceScore: r.relevanceScore ?? 0,
    }));
  } catch {
    return [];
  }
}
