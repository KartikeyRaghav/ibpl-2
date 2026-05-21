"use client";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";

export function Providers({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
        }}
      />
    </AuthContext.Provider>
  );
}
