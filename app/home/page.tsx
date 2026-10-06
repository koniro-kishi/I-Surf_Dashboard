"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import GreenhousePanel from "../../components/greenhouse-panel";

export default function HomePage() {
  const router = useRouter();
  const { status, profile, signOut } = useAuth();

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
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-semibold">I-Surf</h1>
          <div className="flex items-center gap-4">
            <span className="truncate text-sm text-neutral-600">
              {profile.name}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <GreenhousePanel profile={profile} />
      </main>
    </div>
  );
}
