import { MatchDetail } from "@/components/fixtures/MatchDetail";
import Link from "next/link";

export default function MatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
      <MatchDetail matchId={params.id} />
    </div>
  );
}
