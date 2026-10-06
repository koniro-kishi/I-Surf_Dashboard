"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  if (!profile) return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/home" className="text-lg font-semibold">
            I-Surf
          </Link>
          {profile.role === "admin" && (
            <Link
              href="/admin/users"
              className="text-sm text-neutral-600 hover:text-black"
            >
              Kelola akun
            </Link>
          )}
        </div>
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
  );
}
