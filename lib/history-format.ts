type FieldDef = {
  label: string;
  kind: "percent" | "number";
  unit?: string;
  decimals?: number; // hanya untuk kind "number"
};

// Urutan di sini = urutan tampil. Kunci yang tidak ada di sini ditampilkan terakhir.
const FIELDS: Record<string, FieldDef> = {
  // irigasi
  waterLevel: { label: "Tinggi res. air", kind: "percent" },
  fertLevel: { label: "Tinggi res. pupuk", kind: "percent" },
  soilMoist: { label: "Kelembapan tanah", kind: "percent" },
  soilPH: { label: "Level pH tanah", kind: "number", decimals: 2 },
  fertPH: { label: "Level pH res. pupuk", kind: "number", decimals: 2 },
  fertTDS: { label: "TDS res. pupuk", kind: "number", unit: "ppm", decimals: 1 },
  fertTemp: { label: "Suhu res. pupuk", kind: "number", unit: "°C", decimals: 1 },
  // misting
  airTemp: { label: "Suhu udara", kind: "number", unit: "°C", decimals: 1 },
  airHum: { label: "Kelembapan udara", kind: "number", unit: "%", decimals: 1 },
  uvIndex: { label: "Indeks UV", kind: "number", decimals: 2 },
  // status aktuator / sensor (pecahan waktu dalam satu bucket)
  isPumpActive_frac: { label: "Pompa menyala", kind: "percent" },
  isWaterSVActive_frac: { label: "Solenoid valve res. air menyala", kind: "percent" },
  isFertSVActive_frac: { label: "Solenoid valve res. pupuk menyala", kind: "percent" },
  dhtError_frac: { label: "Waktu sensor DHT galat", kind: "percent" },
};

const ORDER = Object.keys(FIELDS);

const percentFmt = new Intl.NumberFormat("id-ID", {
  style: "percent",
  maximumFractionDigits: 0,
});

const numberFmts = new Map<number, Intl.NumberFormat>();
function numberFmt(decimals: number) {
  let f = numberFmts.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    numberFmts.set(decimals, f);
  }
  return f;
}

export type FormattedField = { key: string; label: string; text: string };

export function formatFields(values: Record<string, number>): FormattedField[] {
  const keys = Object.keys(values);
  const known = ORDER.filter((k) => k in values);
  const unknown = keys.filter((k) => !(k in FIELDS)).sort();

  return [...known, ...unknown].map((key) => {
    const def = FIELDS[key];
    const v = values[key];
    if (!def) return { key, label: key, text: numberFmt(2).format(v) };
    const text =
      def.kind === "percent"
        ? percentFmt.format(v)
        : numberFmt(def.decimals ?? 2).format(v) + (def.unit ? ` ${def.unit}` : "");
    return { key, label: def.label, text };
  });
}

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  dateStyle: "medium",
  timeStyle: "short",
});

/** ts = epoch UTC (detik), awal bucket. Tampil dalam WIB. */
export function formatBucketTime(ts: number): string {
  return timeFmt.format(new Date(ts * 1000));
}

const instantFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  dateStyle: "medium",
  timeStyle: "medium",
});

/** ts = epoch UTC (detik). Tampil dalam WIB hingga detik. */
export function formatInstantTime(ts: number): string {
  return instantFmt.format(new Date(ts * 1000));
}