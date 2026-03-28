// DOCUMENTATION NOTE: CrossRef is a nonprofit registry that links scholarly metadata
// (titles, authors, DOIs) for millions of papers. We use it as a free "lookup desk":
// when a user only has a reference title, we ask CrossRef for the best matching DOI so
// RetractWatch can check that paper against retraction data.

const MAILTO = "retractwatch@hackathon.dev";

export type ResolveDoiFromTitleResult = string | null;

export async function resolveDoiFromTitle(
  title: string,
  authors?: string,
): Promise<ResolveDoiFromTitleResult> {
  try {
    if (typeof title !== "string" || !title.trim()) return null;

    const q = encodeURIComponent(title.trim());
    let url = `https://api.crossref.org/works?query.title=${q}&rows=5&mailto=${encodeURIComponent(MAILTO)}`;
    if (typeof authors === "string" && authors.trim()) {
      url += `&query.author=${encodeURIComponent(authors.trim())}`;
    }

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    let data: {
      message?: { items?: Array<{ score?: number; DOI?: string }> };
    };
    try {
      data = (await res.json()) as typeof data;
    } catch {
      return null;
    }

    const items = data.message?.items;
    if (!Array.isArray(items) || items.length === 0) return null;

    const top = items[0];
    const score = top.score ?? 0;
    if (score < 50) return null;
    const doi = top.DOI;
    if (!doi || typeof doi !== "string") return null;
    return doi.trim();
  } catch {
    return null;
  }
}
