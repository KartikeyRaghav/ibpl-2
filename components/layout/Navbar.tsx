"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  BarChart2,
  Users,
  User,
  ShieldCheck,
} from "lucide-react";

const PUBLIC_LINKS = [
  { href: "/", label: "Home", icon: Trophy },
  { href: "/fixtures", label: "Fixtures", icon: Calendar },
  { href: "/standings", label: "Table", icon: BarChart2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/players", label: "Players", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-black text-white text-sm tracking-tight">
                IBPL
              </span>
              <span className="text-gray-500 text-xs ml-1 hidden sm:inline">
                IIT Indore
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
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
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right-side actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Live pulse badge */}
            <span className="hidden sm:flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              LIVE
            </span>

            {/* Admin link — only visible when logged in as admin */}
            {isAdmin ? (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-orange-500 text-white"
                    : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30",
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors px-2 py-1 rounded"
                title="Admin login"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
