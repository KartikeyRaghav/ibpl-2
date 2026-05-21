"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, BarChart2, Users, User } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Trophy },
  { href: "/fixtures", label: "Fixtures", icon: Calendar },
  { href: "/standings", label: "Table", icon: BarChart2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/players", label: "Players", icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-tight">
                IBPL
              </span>
              <span className="text-gray-500 text-xs ml-1 hidden sm:inline">
                IIT Indore
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-orange-500/20 text-orange-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Live badge */}
          <div className="ml-auto flex items-center gap-2">
            <LiveBadge />
          </div>
        </div>
      </div>
    </header>
  );
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
      LIVE
    </span>
  );
}
