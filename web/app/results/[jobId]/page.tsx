import { ResultsPageClient } from "./ResultsPageClient";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <ResultsPageClient jobId={jobId} />;
}
