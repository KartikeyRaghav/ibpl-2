"use client";
import { cn } from "@/lib/utils";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-white/8 rounded-lg", className)} />
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "gold";
  children: React.ReactNode;
  className?: string;
}
export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded font-display tracking-wide uppercase",
        variant === "default" && "bg-white/10 text-white/70",
        variant === "success" && "bg-emerald-500/20 text-emerald-400",
        variant === "danger" && "bg-red-500/20 text-red-400",
        variant === "warning" && "bg-orange-500/20 text-orange-400",
        variant === "gold" && "bg-yellow-500/20 text-yellow-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}
export function StatCard({
  label,
  value,
  sub,
  accent,
  className,
}: StatCardProps) {
  return (
    <div className={cn("card p-3 text-center", className)}>
      <div
        className={cn(
          "font-display font-bold text-2xl leading-none",
          accent ? "text-orange-400" : "text-white",
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-wide mt-1">
        {label}
      </div>
      {sub && <div className="text-[11px] text-white/50 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Team Avatar ──────────────────────────────────────────────────────────────
interface TeamAvatarProps {
  shortName: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function TeamAvatar({
  shortName,
  color,
  size = "md",
  className,
}: TeamAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[9px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-display font-bold text-white shrink-0",
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {shortName}
    </div>
  );
}

// ─── Player Avatar ────────────────────────────────────────────────────────────
interface PlayerAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function PlayerAvatar({
  name,
  color,
  size = "md",
  className,
}: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-14 h-14 text-lg",
  };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-display font-bold text-white shrink-0",
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      className={cn(
        "border-2 border-white/10 border-t-orange-500 rounded-full animate-spin",
        s[size],
      )}
    />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="section-title">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative card p-5 w-full max-w-md max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Position pill ────────────────────────────────────────────────────────────
export function PositionPill({ position }: { position: string }) {
  const colors: Record<string, string> = {
    PG: "bg-blue-500/20 text-blue-400",
    SG: "bg-purple-500/20 text-purple-400",
    SF: "bg-green-500/20 text-green-400",
    PF: "bg-yellow-500/20 text-yellow-400",
    C: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-1.5 py-0.5 rounded font-display tracking-wide",
        colors[position] ?? "bg-white/10 text-white/60",
      )}
    >
      {position}
    </span>
  );
}
