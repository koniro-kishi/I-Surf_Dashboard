"use client";

import { useState } from "react";
import type { Profile } from "@/lib/auth-context";
import {
  useGreenhouse,
  type LatestValues,
  type SlaveInfo,
} from "@/lib/use-greenhouse";
import {
  createCommand,
  isStale,
  useCommands,
  type Command,
  type NewCommand,
  type Reservoir,
} from "@/lib/commands";
import { formatInstantTime } from "@/lib/history-format";

const STATUS_LABEL: Record<Command["cmdStatus"], string> = {
  waiting: "Menunggu master",
  transferring: "Diteruskan ke slave",
  sent: "Diterima slave",
  done: "Selesai",
  failed: "Gagal",
};

function describe(c: Command) {
  switch (c.cmdType) {
    case "timed_instant":
      return "Nyalakan pompa";
    case "deactivation":
      return "Tahan pompa sementara";
    case "instant_change":
      return `Ganti sumber irigasi ke ${c.reservoir === "fert" ? "fertigasi" : "air biasa"}`;
  }
}

const btn =
  "rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50";

function SlaveControls({
  slave,
  values,
}: {
  slave: SlaveInfo;
  values: LatestValues | null | undefined;
}) {
  const { commands, ready, pumpBusy, reservoirBusy, now, error } = useCommands(
    slave.id,
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function send(cmd: NewCommand) {
    setSending(true);
    setSendError(null);
    try {
      await createCommand(slave.id, cmd);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  const pumpDisabled = !ready || pumpBusy || sending;
  const reservoirDisabled = !ready || reservoirBusy || sending;

  const rawMode = String(values?.useReservoir ?? "").toLowerCase();
  const currentReservoir: Reservoir | null =
    rawMode === "water" || rawMode === "fert" ? rawMode : null;

  const last = commands[0];

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">
        {slave.id}{" "}
        <span className="font-normal text-neutral-500">
          ({slave.slaveType ?? "tipe tidak diketahui"})
        </span>
      </p>

      <div>
        <h3 className="mb-2 text-sm font-medium">Pompa</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${btn} border-black bg-black text-white`}
            disabled={pumpDisabled}
            onClick={() => send({ cmdType: "timed_instant", actuator: "pump" })}
          >
            Nyalakan pompa
          </button>
          <button
            type="button"
            className={`${btn} border-neutral-300 bg-white`}
            disabled={pumpDisabled}
            onClick={() => send({ cmdType: "deactivation" })}
          >
            Tahan pompa sementara
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Durasi ditentukan oleh slave.
        </p>
      </div>

      {slave.slaveType === "irrigation" && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Sumber irigasi</h3>
          <div className="inline-flex gap-2">
            {(
              [
                ["water", "Air biasa"],
                ["fert", "Fertigasi"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={currentReservoir === value}
                className={`${btn} ${
                  currentReservoir === value
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white"
                }`}
                disabled={reservoirDisabled}
                onClick={() =>
                  send({ cmdType: "instant_change", reservoir: value })
                }
              >
                {label}
              </button>
            ))}
          </div>
          {currentReservoir === null && (
            <p className="mt-1 text-xs text-neutral-500">
              Sumber saat ini belum dilaporkan slave.
            </p>
          )}
        </div>
      )}

      {(error || sendError) && (
        <p role="alert" className="text-sm text-red-700">
          {error ?? sendError}
        </p>
      )}

      <div className="text-sm">
        <h3 className="mb-1 font-medium">Perintah terakhir</h3>
        {!ready ? (
          <p className="text-neutral-500">Memuat…</p>
        ) : !last ? (
          <p className="text-neutral-500">Belum ada perintah.</p>
        ) : (
          <p className="text-neutral-700">
            {describe(last)} —{" "}
            {isStale(last, now)
              ? `${STATUS_LABEL[last.cmdStatus]} (kedaluwarsa)`
              : STATUS_LABEL[last.cmdStatus]}{" "}
            <span className="text-neutral-500">
              · {formatInstantTime(Math.floor(last.createdAt / 1000))} WIB
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ControlPanel({ profile }: { profile: Profile }) {
  const { structure, latest, error } = useGreenhouse(profile);

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
        >
          Gagal membaca data: {error}
        </p>
      )}

      {!structure && !error && (
        <p className="text-sm text-neutral-500">Memuat data…</p>
      )}

      {structure && (
        <>
          {structure.blocks.map((b) => (
            <section
              key={b.id}
              className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div>
                <h2 className="font-semibold">{b.id}</h2>
                <p className="text-sm text-neutral-500">{b.plant ?? "-"}</p>
              </div>
              {b.slave ? (
                <SlaveControls slave={b.slave} values={latest[b.slave.id]} />
              ) : (
                <p className="text-sm text-neutral-500">
                  Blok ini belum punya slave.
                </p>
              )}
            </section>
          ))}

          <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Umum</h2>
            <SlaveControls
              slave={structure.misting}
              values={latest[structure.misting.id]}
            />
          </section>
        </>
      )}
    </>
  );
}
