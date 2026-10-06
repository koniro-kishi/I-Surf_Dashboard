"use client";

import { useEffect, useMemo, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import { db } from "./firebase";
import type { Profile } from "./auth-context";

/**
 * Slave misting dianggap milik umum rumah kaca. Staff tidak boleh membaca seluruh
 * node `slaves`, jadi ID-nya dipatok di sini.
 */
export const MISTING_SLAVE_ID = "slave0";

export type LatestValues = Record<string, number | boolean | string>;
export type SlaveInfo = { id: string; slaveType: string | null };
export type BlockInfo = {
  id: string;
  plant: string | null;
  slave: SlaveInfo | null;
};
type Structure = { blocks: BlockInfo[]; misting: SlaveInfo };

/** Membaca satu path; jika ditolak rules, pesan errornya menyebut path-nya. */
async function read(path: string) {
  try {
    return (await get(ref(db, path))).val();
  } catch (e) {
    throw new Error(`${path}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function readSlave(id: string): Promise<SlaveInfo> {
  return { id, slaveType: (await read(`slaves/${id}/slaveType`)) ?? null };
}

export function useGreenhouse(profile: Profile) {
  const { role, block } = profile;
  const [structure, setStructure] = useState<Structure | null>(null);
  const [latest, setLatest] = useState<Record<string, LatestValues | null>>({});
  const [error, setError] = useState<string | null>(null);

  // 1. Struktur (sekali baca): blok -> slave irrigation, plus slave misting
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const blockIds =
          role === "admin"
            ? Object.keys((await read("blocks")) ?? {})
            : block
              ? [block]
              : [];

        const blocks: BlockInfo[] = await Promise.all(
          blockIds.map(async (id) => {
            const data = await read(`blocks/${id}`);
            const slaveId: string | null = data?.slave ?? null;
            return {
              id,
              plant: data?.plant ?? null,
              slave: slaveId ? await readSlave(slaveId) : null,
            };
          }),
        );

        const misting = await readSlave(MISTING_SLAVE_ID);
        if (!cancelled) setStructure({ blocks, misting });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, block]);

  // 2. Data latest (realtime): satu listener per slave
  const slaveIds = useMemo(() => {
    if (!structure) return [];
    const ids = [
      ...structure.blocks.map((b) => b.slave?.id),
      structure.misting.id,
    ].filter((id): id is string => !!id);
    return [...new Set(ids)];
  }, [structure]);

  useEffect(() => {
    const unsubscribers = slaveIds.map((id) =>
      onValue(
        ref(db, `latest/${id}`),
        (snap) => setLatest((prev) => ({ ...prev, [id]: snap.val() })),
        (err) => setError(`latest/${id}: ${err.message}`),
      ),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [slaveIds]);

  return { structure, latest, error };
}
