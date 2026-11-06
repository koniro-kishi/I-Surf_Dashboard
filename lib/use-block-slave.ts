"use client";

import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "./firebase";

type State = { block: string; slaveId: string | null; error: string | null };

/** ID slave irigasi milik sebuah blok (sekali baca dari blocks/{blok}/slave). */
export function useBlockSlave(block: string | null) {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    if (!block) return;
    let cancelled = false;
    get(ref(db, `blocks/${block}/slave`))
      .then((snap) => {
        const v = snap.val();
        if (!cancelled)
          setState({
            block,
            slaveId: typeof v === "string" ? v : null,
            error: null,
          });
      })
      .catch(() => {
        if (!cancelled)
          setState({ block, slaveId: null, error: "Gagal memuat data blok." });
      });
    return () => {
      cancelled = true;
    };
  }, [block]);

  // Hasil hanya sah bila untuk blok yang sama dengan saat ini
  const fresh = state && state.block === block ? state : null;
  return {
    slaveId: fresh?.slaveId ?? null,
    loading: block !== null && fresh === null,
    error: fresh?.error ?? null,
  };
}
