"use client";

import { Fragment } from "react";
import { useHistory } from "../lib/use-history";
import { formatBucketTime, formatFields } from "../lib/history-format";

const btn =
  "rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:text-neutral-400";

export default function HistoryList({ slaveId }: { slaveId: string }) {
  const { records, loading, loadingMore, hasMore, error, loadMore, refresh } =
    useHistory(slaveId);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-neutral-500">
          Tiap kartu merangkum satu menit (median). Nilai berlabel
          &ldquo;menyala&rdquo; adalah persentase waktu aktif. Waktu dalam WIB.
        </p>
        <button type="button" onClick={refresh} className={btn}>
          Muat ulang
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-neutral-500">Memuat…</p>}

      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-neutral-500">Belum ada riwayat.</p>
      )}

      <ul className="space-y-3">
        {records.map((r) => {
          const fields = formatFields(r.values);
          return (
            <li
              key={r.ts}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h2 className="text-sm font-semibold">
                  <time dateTime={new Date(r.ts * 1000).toISOString()}>
                    {formatBucketTime(r.ts)} WIB
                  </time>
                </h2>
                <span className="text-xs text-neutral-500">
                  {r.n} pembacaan
                </span>
              </div>

              {fields.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500">
                  Tidak ada nilai.
                </p>
              ) : (
                <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
                  {fields.map((f) => (
                    <Fragment key={f.key}>
                      <dt className="text-neutral-500">{f.label}</dt>
                      <dd className="text-right font-medium tabular-nums">
                        {f.text}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className={btn}
        >
          {loadingMore ? "Memuat…" : "Muat lebih lama"}
        </button>
      )}
    </div>
  );
}
