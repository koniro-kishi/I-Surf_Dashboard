"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import AppHeader from "../../components/app-header";
import GreenhousePanel from "../../components/greenhouse-panel";

export default function HomePage() {
  const router = useRouter();
  const { status, profile } = useAuth();

  // Route guard sisi klien (UX saja; batas akses sebenarnya ada di RTDB rules)
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        Memuat…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-black">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <GreenhousePanel profile={profile} />
      </main>
    </div>
  );
}
