import { prisma } from "@/lib/prisma";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export const revalidate = 30;

export default async function StandingsPage() {
  const standings = await prisma.teamStanding.findMany({
    include: { team: true },
    orderBy: [{ points: "desc" }, { pointDiff: "desc" }],
  });

  const serialized = (d: any) => JSON.parse(JSON.stringify(d));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-black text-3xl text-white">Points Table</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sorted by: Points → Point Difference → Head-to-Head
        </p>
      </div>

      <StandingsTable standings={serialized(standings)} />

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "P", desc: "Matches Played" },
          { label: "W / L", desc: "Wins / Losses" },
          { label: "PD", desc: "Point Difference" },
          { label: "Pts", desc: "League Points (2 per win)" },
        ].map(({ label, desc }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800 rounded-lg p-3"
          >
            <div className="font-black text-orange-400 text-sm">{label}</div>
            <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      {/* Format info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tournament Format</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm text-gray-400">
          <p>
            <span className="text-white font-semibold">
              Double Round Robin:
            </span>{" "}
            Each team plays every other team exactly twice — once at home, once
            away.
          </p>
          <p>
            <span className="text-white font-semibold">Scoring:</span> Win = 2
            points · Loss = 0 points. No draws in basketball.
          </p>
          <p>
            <span className="text-white font-semibold">Tiebreaker order:</span>{" "}
            (1) League Points → (2) Point Difference → (3) Head-to-head result.
          </p>
          <p>
            <span className="text-white font-semibold">Total matches:</span> 4
            teams x 3 opponents x 2 legs ={" "}
            <strong className="text-orange-400">12 matches</strong>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
