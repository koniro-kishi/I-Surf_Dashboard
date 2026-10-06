"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { status, authError, signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Sudah login (mis. buka /login lagi) -> langsung ke home
  useEffect(() => {
    if (status === "authenticated") router.replace("/home");
  }, [status, router]);

  // Tombol tetap nonaktif sampai profil dimuat dan redirect terjadi,
  // atau sampai ada error yang perlu ditampilkan.
  const busy = submitting && !authError;

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setSubmitting(true);
    await signIn(email, password);
  }

  // Cek sesi awal / sedang redirect: jangan tampilkan form agar tidak berkedip
  if (status !== "unauthenticated") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        Memuat…
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 text-black">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8">
        <h1 className="text-2xl font-semibold">I-Surf</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Masuk untuk memantau rumah kaca.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@isurf.ac.id"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Kata sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {authError && (
            <p
              role="alert"
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-800"
            >
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
