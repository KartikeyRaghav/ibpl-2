"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();

  // token can be null on first render (hydration from localStorage hasn't run yet)
  // give it one tick before redirecting
  const ready = typeof window !== "undefined";

  useEffect(() => {
    if (!ready) return;
    // Wait a frame so localStorage rehydration in useAuthProvider can finish
    const t = setTimeout(() => {
      const storedToken = localStorage.getItem("ibpl_token");
      const storedUser = localStorage.getItem("ibpl_user");
      if (!storedToken || !storedUser) {
        router.replace("/login");
        return;
      }
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "ADMIN") router.replace("/login");
      } catch {
        router.replace("/login");
      }
    }, 50);
    return () => clearTimeout(t);
  }, [ready, router]);

  if (!token || !user) {
    return <LoadingSpinner text="Verifying credentials…" />;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
