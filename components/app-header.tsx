"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { LANDING, NAV } from "../lib/nav";

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  if (!profile) return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href={LANDING[profile.role]} className="text-lg font-semibold">
            I-Surf
          </Link>
          <nav
            aria-label="Menu utama"
            className="flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            {NAV[profile.role].map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "text-sm font-medium text-black"
                      : "text-sm text-neutral-600 hover:text-black"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
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
