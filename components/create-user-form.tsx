"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { get, ref } from "firebase/database";
import { db } from "../lib/firebase";
import { createAccount } from "../lib/create-user";

type BlockOption = { id: string; plant: string | null };
type Role = "admin" | "staff";
type Message = { type: "ok" | "error"; text: string };

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black";

export default function CreateUserForm() {
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [role, setRole] = useState<Role>("staff");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Opsi blok untuk dropdown (admin boleh membaca seluruh node `blocks`)
  useEffect(() => {
    get(ref(db, "blocks"))
      .then((snap) => {
        const value = (snap.val() ?? {}) as Record<string, { plant?: string }>;
        setBlocks(
          Object.entries(value).map(([id, b]) => ({
            id,
            plant: b.plant ?? null,
          })),
        );
      })
      .catch((err: unknown) =>
        setMessage({
          type: "error",
          text: `Gagal memuat daftar blok: ${err instanceof Error ? err.message : String(err)}`,
        }),
      );
  }, []);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget; // simpan sebelum await; currentTarget jadi null setelahnya
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(data.get("password") ?? "");
    const block = role === "staff" ? String(data.get("block") ?? "") : null;

    if (!name || !email) {
      setMessage({ type: "error", text: "Nama dan email wajib diisi." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Kata sandi minimal 6 karakter." });
      return;
    }
    if (role === "staff" && !block) {
      setMessage({ type: "error", text: "Pilih blok untuk akun staff." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await createAccount({ name, email, password, role, block });
      form.reset();
      setRole("staff");
      setMessage({ type: "ok", text: `Akun ${email} berhasil dibuat.` });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal membuat akun.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Tambah akun</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nama
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="new-email"
            name="email"
            type="email"
            autoComplete="off"
            required
            placeholder="nama@isurf.ac.id"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium">
            Kata sandi awal
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className={inputClass}
          />
          <p className="text-xs text-neutral-500">Minimal 6 karakter.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="staff"
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputClass}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === "staff" && (
          <div className="space-y-1.5">
            <label htmlFor="block" className="text-sm font-medium">
              Blok
            </label>
            <select
              id="block"
              name="block"
              defaultValue=""
              required
              className={inputClass}
            >
              <option value="" disabled>
                Pilih blok
              </option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.plant ? `${b.id} (${b.plant})` : b.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-800"
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {submitting ? "Membuat akun…" : "Buat akun"}
        </button>
      </form>
    </section>
  );
}
