"use client";

import { useEffect, useState } from "react";
import {
  limitToLast,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  serverTimestamp,
} from "firebase/database";
import { auth, db } from "./firebase";

export type CmdType = "timed_instant" | "instant_change" | "deactivation";
export type CmdStatus = "waiting" | "transferring" | "sent" | "done" | "failed";
export type Reservoir = "water" | "fert";

export type Command = {
  id: string;
  cmdType: CmdType;
  cmdStatus: CmdStatus;
  createdAt: number; // ms epoch (server)
  by: string;
  actuator?: "pump";
  reservoir?: Reservoir;
};

export type NewCommand =
  | { cmdType: "timed_instant"; actuator: "pump" }
  | { cmdType: "instant_change"; reservoir: Reservoir }
  | { cmdType: "deactivation" };

/** Command yang lebih tua dari ini tidak lagi mengunci kontrol (hanya tampilan). */
export const COMMAND_STALE_MS = 5 * 60 * 1000;
const COMMANDS_WINDOW = 10;

const IN_FLIGHT: CmdStatus[] = ["waiting", "transferring", "sent"];
const PUMP_LOCK: CmdStatus[] = ["waiting", "transferring"];
const RESERVOIR_LOCK: CmdStatus[] = ["waiting", "transferring", "sent"];

export async function createCommand(slaveId: string, cmd: NewCommand) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Belum masuk.");
  await push(ref(db, `commands/${slaveId}`), {
    ...cmd,
    cmdStatus: "waiting",
    by: uid,
    createdAt: serverTimestamp(),
  });
}

/** Command masih berjalan menurut status, tetapi sudah terlalu lama. */
export function isStale(c: Command, now: number) {
  return (
    IN_FLIGHT.includes(c.cmdStatus) && now - c.createdAt > COMMAND_STALE_MS
  );
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/**
 * Command terbaru satu slave (terbaru lebih dulu) + status penguncian kontrol.
 * - pumpBusy      : command pompa (timed_instant / deactivation) terbaru masih waiting/transferring
 * - reservoirBusy : command instant_change terbaru masih waiting/transferring/sent
 */
export function useCommands(slaveId: string) {
  // Data disimpan bersama slaveId-nya; data milik slave lain dianggap belum siap.
  const [data, setData] = useState<{ slaveId: string; list: Command[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const now = useNow(30_000);

  useEffect(() => {
    const q = query(
      ref(db, `commands/${slaveId}`),
      orderByKey(), // push-key terurut waktu
      limitToLast(COMMANDS_WINDOW),
    );
    return onValue(
      q,
      (snap) => {
        const list: Command[] = [];
        // forEach menjaga urutan key; snap.val() tidak menjamin urutan
        snap.forEach((child) => {
          list.push({ id: child.key as string, ...child.val() });
        });
        setData({ slaveId, list: list.reverse() });
        setError(null);
      },
      (err) => setError(`commands/${slaveId}: ${err.message}`),
    );
  }, [slaveId]);

  const ready = data !== null && data.slaveId === slaveId;
  const list = ready ? data.list : [];
  const live = (c: Command | undefined, statuses: CmdStatus[]) =>
    !!c &&
    statuses.includes(c.cmdStatus) &&
    now - c.createdAt <= COMMAND_STALE_MS;

  return {
    commands: list,
    ready,
    pumpBusy: live(
      list.find((c) => c.cmdType !== "instant_change"),
      PUMP_LOCK,
    ),
    reservoirBusy: live(
      list.find((c) => c.cmdType === "instant_change"),
      RESERVOIR_LOCK,
    ),
    now,
    error,
  };
}
