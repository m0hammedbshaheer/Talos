// DOCUMENTATION NOTE: Semantic Scholar reference graph for cascade detection.

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      setTimeout(resolve, ms);
    } catch {
      resolve();
    }
  });
}

export interface ReferenceEntry {
  title: string;
  doi: string;
  authors: string;
}

export type GetReferencesResult = ReferenceEntry[];

export async function getReferences(doi: string): Promise<GetReferencesResult> {
  try {
    await sleep(150);
  } catch {
    /* continue */
  }

  try {
    if (typeof doi !== "string" || !doi.trim()) return [];

    const paperId = `DOI:${doi.trim()}`;
    const url = new URL(
      `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}/references`,
    );
    url.searchParams.set("fields", "title,authors,externalIds");
    url.searchParams.set("limit", "50");

    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return [];

    let data: {
      data?: unknown;
    };
    try {
      data = (await res.json()) as typeof data;
    } catch {
      return [];
    }

    const rows = Array.isArray(data.data) ? data.data : [];
    const out: ReferenceEntry[] = [];

    for (const item of rows) {
      try {
        if (!item || typeof item !== "object") continue;
        const row = item as {
          citedPaper?: {
            title?: string;
            authors?: Array<{ name?: string }>;
            externalIds?: { DOI?: string };
          };
        };
        const cp = row.citedPaper;
        if (!cp) continue;
        const title = typeof cp.title === "string" ? cp.title : "";
        const rawDoi = cp.externalIds?.DOI;
        const doiVal =
          typeof rawDoi === "string" && rawDoi.trim() !== "" ? rawDoi.trim() : null;
        const authors =
          Array.isArray(cp.authors) && cp.authors.length > 0
            ? cp.authors.map((a) => (a?.name ? String(a.name) : "")).filter(Boolean).join(", ")
            : "";

        if (doiVal) {
          out.push({ title, doi: doiVal, authors });
        }
      } catch {
        /* skip row */
      }
    }

    return out;
  } catch {
    return [];
  }
}
