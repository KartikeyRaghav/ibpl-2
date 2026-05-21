import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("bg-gray-900 border border-gray-800 rounded-xl", className)}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-gray-800 flex items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2
      className={cn(
        "font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2 before:content-[''] before:block before:w-0.5 before:h-4 before:bg-orange-500 before:rounded",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
