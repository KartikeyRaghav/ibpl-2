import { TournamentSettings } from "@/types";

export function HeroSection({
  settings,
}: {
  settings?: TournamentSettings | null;
}) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800">
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14 md:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30 mb-4">
            🏀 {settings?.name ?? "IBPL Season 1"} · Double Round Robin
          </div>

          <h1 className="font-black text-4xl sm:text-5xl md:text-6xl text-white leading-none mb-3">
            IIT Indore
            <br />
            <span className="text-orange-500">Basketball</span>
            <br />
            Premier League
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8">
            4 elite teams. 42 players. 12 intense matches.
            <br className="hidden sm:block" />
            Only one champion.
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { val: "4", label: "Teams" },
              { val: "42", label: "Players" },
              { val: "12", label: "Matches" },
              { val: "2026", label: "Season" },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 text-center"
              >
                <div className="font-black text-xl sm:text-2xl md:text-3xl text-orange-500">
                  {val}
                </div>
                <div className="text-gray-500 text-xs uppercase tracking-wide mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
