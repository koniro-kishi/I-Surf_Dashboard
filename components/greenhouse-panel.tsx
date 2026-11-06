"use client";

import { Fragment } from "react";
import type { Profile } from "@/lib/auth-context";
import {
  useGreenhouse,
  type LatestValues,
  type SlaveInfo,
} from "@/lib/use-greenhouse";
import { formatInstantTime } from "@/lib/history-format";

function toEpochSeconds(value: LatestValues[string]): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n > 1e12 ? Math.floor(n / 1000) : n;
}

function SlaveData({
  slave,
  values,
}: {
  slave: SlaveInfo | null;
  values: LatestValues | null | undefined;
}) {
  if (!slave) {
    return <p className="text-sm text-neutral-500">Blok ini belum punya slave.</p>;
  }

  return (
    <div>
      <p className="text-sm font-medium">
        {slave.id}{" "}
        <span className="font-normal text-neutral-500">
          ({slave.slaveType ?? "tipe tidak diketahui"})
        </span>
      </p>

      {values === undefined ? (
        <p className="mt-2 text-sm text-neutral-500">Memuat…</p>
      ) : values === null ? (
        <p className="mt-2 text-sm text-neutral-500">Belum ada data latest.</p>
      ) : (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          {Object.entries(values)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => {
              const ts = key === "updatedAt" ? toEpochSeconds(value) : null;

              return (
                <Fragment key={key}>
                  <dt className="text-neutral-500">{key}</dt>
                  <dd className="font-mono">
                    {ts === null ? (
                      String(value)
                    ) : (
                      <time dateTime={new Date(ts * 1000).toISOString()}>
                        {formatInstantTime(ts)} WIB
                      </time>
                    )}
                  </dd>
                </Fragment>
              );
            })}
        </dl>
      )}
    </div>
  );
}

export default function GreenhousePanel({ profile }: { profile: Profile }) {
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
          {structure.blocks.length === 0 && (
            <p className="text-sm text-neutral-500">Tidak ada blok yang dapat diakses.</p>
          )}

          {structure.blocks.map((b) => (
            <section
              key={b.id}
              className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div>
                <h2 className="font-semibold">{b.id}</h2>
                <p className="text-sm text-neutral-500">{b.plant ?? "-"}</p>
              </div>
              <SlaveData
                slave={b.slave}
                values={b.slave ? latest[b.slave.id] : undefined}
              />
            </section>
          ))}

          <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Umum</h2>
            <SlaveData
              slave={structure.misting}
              values={latest[structure.misting.id]}
            />
          </section>
        </>
      )}
    </>
  );
}
