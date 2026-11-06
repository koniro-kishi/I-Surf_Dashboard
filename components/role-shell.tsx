"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "../lib/auth-context";
import { LANDING } from "../lib/nav";
import AppHeader from "./app-header";

export default function RoleShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const { status, profile } = useAuth();
  const allowed = status === "authenticated" && profile?.role === role;

  // Guard sisi klien (UX saja; batas akses sebenarnya ada di RTDB rules)
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && profile && profile.role !== role)
      router.replace(LANDING[profile.role]);
  }, [status, profile, role, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        Memuat…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-black">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">{children}</main>
    </div>
  );
}
