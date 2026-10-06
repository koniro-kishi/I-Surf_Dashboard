"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import AppHeader from "../../../components/app-header";
import CreateUserForm from "../../../components/create-user-form";
import UserList from "../../../components/user-list";

export default function AdminUsersPage() {
  const router = useRouter();
  const { status, profile } = useAuth();
  const isAdmin = status === "authenticated" && profile?.role === "admin";

  // Guard sisi klien (UX saja; batas akses sebenarnya ada di RTDB rules)
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && profile?.role !== "admin")
      router.replace("/home");
  }, [status, profile, router]);

  if (!isAdmin) {
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
        <h1 className="text-2xl font-semibold">Kelola akun</h1>
        <div className="grid gap-4 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
          <CreateUserForm />
          <UserList />
        </div>
      </main>
    </div>
  );
}
