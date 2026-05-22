"use client";
import { useState } from "react";
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
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              onClick={() => setOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-black text-white text-sm tracking-tight">
                  IBPL
                </span>
                <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">
                  IIT Indore
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    isActive(href)
                      ? "bg-orange-500/20 text-orange-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Live pulse — desktop only */}
              <span className="hidden sm:flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                LIVE
              </span>

              {/* Admin link */}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className={cn(
                    "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-orange-500 text-white"
                      : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30",
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              ) : (
                <Link
                  href="/login"
                  title="Admin login"
                  className="hidden md:flex text-gray-600 hover:text-gray-400 transition-colors p-1.5 rounded"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="md:hidden fixed inset-x-0 top-14 z-40 bg-gray-950 border-b border-gray-800 shadow-2xl">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-800 pt-2 mt-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
