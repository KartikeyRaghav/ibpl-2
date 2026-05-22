import { MatchDetail } from "@/components/fixtures/MatchDetail";
import Link from "next/link";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/fixtures"
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          ← Back to Fixtures
        </Link>
      </div>
      <MatchDetail matchId={Number(id)} />
    </div>
  );
}
