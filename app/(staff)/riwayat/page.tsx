"use client";

import { useState } from "react";
import { useAuth } from "../../../lib/auth-context";
import { MISTING_SLAVE_ID } from "../../../lib/use-greenhouse";
import { useBlockSlave } from "../../../lib/use-block-slave";
import HistoryList from "../../../components/history-list";

type TabId = "irigasi" | "misting";
const TABS: { id: TabId; label: string }[] = [
  { id: "irigasi", label: "Irigasi" },
  { id: "misting", label: "Misting" },
];

export default function RiwayatPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<TabId>("irigasi");
  const block = useBlockSlave(profile?.block ?? null);

  if (!profile) return null; // layout sudah menjamin profil ada

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Riwayat</h1>
        {profile.block && (
          <p className="text-sm text-neutral-500">Blok: {profile.block}</p>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Sumber data riwayat"
        className="flex gap-2"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={
                "rounded-lg border px-4 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black " +
                (active
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "irigasi" ? (
          block.loading ? (
            <p className="text-sm text-neutral-500">Memuat…</p>
          ) : block.error ? (
            <p
              role="alert"
              className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
            >
              {block.error}
            </p>
          ) : !block.slaveId ? (
            <p className="text-sm text-neutral-500">
              Blok ini belum punya slave.
            </p>
          ) : (
            <HistoryList key={block.slaveId} slaveId={block.slaveId} />
          )
        ) : (
          <HistoryList key={MISTING_SLAVE_ID} slaveId={MISTING_SLAVE_ID} />
        )}
      </div>
    </>
  );
}
