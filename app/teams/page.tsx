import { prisma } from "@/lib/prisma";
import { TeamCard } from "@/components/teams/TeamCard";

export const revalidate = 60;

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      players: { where: { isActive: true } },
      standing: true,
    },
    orderBy: { name: "asc" },
  });

  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-black text-3xl text-white">Teams</h1>
        <p className="text-gray-500 text-sm mt-1">{teams.length} teams competing in IBPL Season 1</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map((t) => (
          <TeamCard key={t.id} team={serialized(t)} />
        ))}
      </div>
    </div>
  );
}
