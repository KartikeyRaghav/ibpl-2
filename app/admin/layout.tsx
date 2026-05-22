import { AdminGuard } from "@/components/admin/AdminGuard";
import type { ReactNode } from "react";

export const metadata = { title: "IBPL Admin Dashboard" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
