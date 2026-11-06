"use client";

import { useCallback, useEffect, useState } from "react";
import {
  endBefore,
  get,
  limitToLast,
  orderByKey,
  query,
  ref,
  type DataSnapshot,
} from "firebase/database";
import { db } from "./firebase";

export const HISTORY_PAGE_SIZE = 60;

export type HistoryRecord = {
  ts: number; // epoch UTC (detik) = awal bucket
  n: number; // jumlah pembacaan dalam bucket
  values: Record<string, number>; // kunci sesuai RTDB (mis. soilMoist, isPumpActive_frac)
};

type Data = {
  key: string; // `${slaveId}#${tick}`; hasil dengan key lama diabaikan
  records: HistoryRecord[]; // terbaru dulu
  hasMore: boolean;
  error: string | null;
};

// Pakai forEach (urut sesuai query), bukan Object.entries(val()): urutan kunci
// objek JS tidak boleh diandalkan untuk kunci yang berbentuk angka.
function parseSnapshot(snap: DataSnapshot): HistoryRecord[] {
  const out: HistoryRecord[] = [];
  snap.forEach((child) => {
    const ts = Number(child.key);
    const v = child.val();
    if (!Number.isFinite(ts) || v === null || typeof v !== "object") return;

    const values: Record<string, number> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      if (k === "n") continue;
      if (typeof x === "number" && Number.isFinite(x)) values[k] = x;
    }
    out.push({ ts, n: typeof v.n === "number" ? v.n : 0, values });
  });
  return out; // menaik menurut waktu
}

function errorMessage(err: unknown): string {
  const code = String((err as { code?: string })?.code ?? "");
  const msg = String((err as { message?: string })?.message ?? "");
  if (/permission/i.test(code) || /permission/i.test(msg))
    return "Anda tidak memiliki akses ke data ini.";
  return "Gagal memuat riwayat. Periksa koneksi Anda lalu coba lagi.";
}

// Mengambil PAGE+1 data: yang ke-(PAGE+1) hanya penanda "masih ada yang lebih lama".
async function fetchPage(slaveId: string, before: number | null) {
  const base = ref(db, `history/${slaveId}`);
  const q =
    before === null
      ? query(base, orderByKey(), limitToLast(HISTORY_PAGE_SIZE + 1))
      : query(
          base,
          orderByKey(),
          endBefore(String(before)),
          limitToLast(HISTORY_PAGE_SIZE + 1),
        );

  const asc = parseSnapshot(await get(q));
  const hasMore = asc.length > HISTORY_PAGE_SIZE;
  const page = (
    hasMore ? asc.slice(asc.length - HISTORY_PAGE_SIZE) : asc
  ).reverse();
  return { page, hasMore };
}

/** slaveId null = belum diketahui (hasil kosong, tanpa memuat). */
export function useHistory(slaveId: string | null) {
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<Data | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const key = slaveId ? `${slaveId}#${tick}` : null;

  useEffect(() => {
    if (!key || !slaveId) return;
    let cancelled = false;
    fetchPage(slaveId, null)
      .then(({ page, hasMore }) => {
        if (!cancelled) setData({ key, records: page, hasMore, error: null });
      })
      .catch((e) => {
        if (!cancelled)
          setData({ key, records: [], hasMore: false, error: errorMessage(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [key, slaveId]);

  // Hasil hanya dianggap sah bila key-nya sama dengan key saat ini
  // (mencegah data slave lain tampil sesaat ketika berpindah tab).
  const fresh = data && data.key === key ? data : null;

  const loadMore = useCallback(async () => {
    if (!slaveId || !key || !fresh || !fresh.hasMore || loadingMore) return;
    const oldest = fresh.records[fresh.records.length - 1]?.ts;
    if (oldest === undefined) return;

    setLoadingMore(true);
    setMoreError(null);
    try {
      const { page, hasMore } = await fetchPage(slaveId, oldest);
      setData((prev) =>
        prev && prev.key === key
          ? { ...prev, records: [...prev.records, ...page], hasMore }
          : prev,
      );
    } catch (e) {
      setMoreError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  }, [slaveId, key, fresh, loadingMore]);

  const refresh = useCallback(() => {
    setMoreError(null);
    setTick((t) => t + 1);
  }, []);

  return {
    records: fresh?.records ?? [],
    loading: key !== null && fresh === null,
    loadingMore,
    hasMore: fresh?.hasMore ?? false,
    error: fresh?.error ?? moreError,
    loadMore,
    refresh,
  };
}
