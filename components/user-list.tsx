"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../lib/firebase";

type UserRow = {
  uid: string;
  name: string;
  email: string;
  role: string;
  block: string | null;
};

type RawUser = { name?: string; email?: string; role?: string; block?: string };

export default function UserList() {
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(db, "users"),
      (snap) => {
        const value = (snap.val() ?? {}) as Record<string, RawUser>;
        setRows(
          Object.entries(value)
            .map(([uid, u]) => ({
              uid,
              name: u.name ?? "-",
              email: u.email ?? "-",
              role: u.role ?? "-",
              block: u.block ?? null,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      },
      (err) => setError(err.message),
    );
  }, []);

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Daftar akun</h2>

      {error && (
        <p role="alert" className="mt-4 text-sm text-neutral-800">
          Gagal memuat daftar akun: {error}
        </p>
      )}
      {!rows && !error && (
        <p className="mt-4 text-sm text-neutral-500">Memuat…</p>
      )}

      {rows && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 font-medium">Blok</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.uid}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.email}</td>
                  <td className="py-2 pr-4">{r.role}</td>
                  <td className="py-2">{r.block ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
