// Data sizes, transfer times, timestamps, energy, fuel and area. Conversion factors are exact definitions
// (SI/IEC prefixes, 1 ft = 0.3048 m, 1 mi = 1.609344 km, 1 US gal = 3.785411784 L, 1 UK gal = 4.54609 L).

export interface DataUnit {
  id: string;
  label: string;
  /** Size in bits. */
  bits: number;
}

export const DATA_UNITS: DataUnit[] = [
  { id: "bit", label: "bits (b)", bits: 1 },
  { id: "B", label: "bytes (B)", bits: 8 },
  { id: "kB", label: "kilobytes (kB, 1,000 B)", bits: 8e3 },
  { id: "MB", label: "megabytes (MB, 1,000² B)", bits: 8e6 },
  { id: "GB", label: "gigabytes (GB, 1,000³ B)", bits: 8e9 },
  { id: "TB", label: "terabytes (TB, 1,000⁴ B)", bits: 8e12 },
  { id: "PB", label: "petabytes (PB, 1,000⁵ B)", bits: 8e15 },
  { id: "KiB", label: "kibibytes (KiB, 1,024 B)", bits: 8 * 1024 },
  { id: "MiB", label: "mebibytes (MiB, 1,024² B)", bits: 8 * 1024 ** 2 },
  { id: "GiB", label: "gibibytes (GiB, 1,024³ B)", bits: 8 * 1024 ** 3 },
  { id: "TiB", label: "tebibytes (TiB, 1,024⁴ B)", bits: 8 * 1024 ** 4 },
  { id: "PiB", label: "pebibytes (PiB, 1,024⁵ B)", bits: 8 * 1024 ** 5 },
  { id: "kbit", label: "kilobits (kb)", bits: 1e3 },
  { id: "Mbit", label: "megabits (Mb)", bits: 1e6 },
  { id: "Gbit", label: "gigabits (Gb)", bits: 1e9 },
];

export function dataUnit(id: string): DataUnit {
  const u = DATA_UNITS.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown data unit ${id}`);
  return u;
}

export function convertData(value: number, from: string, to: string): number {
  return (value * dataUnit(from).bits) / dataUnit(to).bits;
}

/** Connection speeds, in bits per second. */
export const SPEED_UNITS: { id: string; label: string; bps: number }[] = [
  { id: "kbps", label: "Kbps (kilobits/s)", bps: 1e3 },
  { id: "mbps", label: "Mbps (megabits/s)", bps: 1e6 },
  { id: "gbps", label: "Gbps (gigabits/s)", bps: 1e9 },
  { id: "kBps", label: "kB/s (kilobytes/s)", bps: 8e3 },
  { id: "MBps", label: "MB/s (megabytes/s)", bps: 8e6 },
];

/** Seconds to move `bits` at `bps`, after `overheadPct` of the speed is lost to protocol overhead. */
export function transferSeconds(bits: number, bps: number, overheadPct = 0): number {
  return bits / (bps * (1 - overheadPct / 100));
}

/** 3725.4 → "1 h 2 min 5 s"; < 1 s → "less than 1 second". */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  if (totalSeconds < 1) return totalSeconds <= 0 ? "0 s" : "less than 1 second";
  let s = Math.round(totalSeconds);
  const days = Math.floor(s / 86400);
  s -= days * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  return [days && `${days.toLocaleString("en-US")} d`, h && `${h} h`, m && `${m} min`, s && `${s} s`].filter(Boolean).join(" ") || "0 s";
}

/** Seconds vs milliseconds: values of 100 billion or more are taken as milliseconds (seconds would be after year 5138). */
export function detectTimestampUnit(value: number): "s" | "ms" {
  return Math.abs(value) >= 1e11 ? "ms" : "s";
}

/** Largest timestamp JavaScript dates support (±8.64 × 10¹⁵ ms ≈ ±275,000 years). */
export const MAX_TIMESTAMP_MS = 8.64e15;

export function timestampToDate(value: number, unit: "s" | "ms"): Date | null {
  const ms = unit === "s" ? value * 1000 : value;
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_TIMESTAMP_MS) return null;
  return new Date(ms);
}

/** "2026-11-13T10:30" (or with seconds) interpreted as UTC or the visitor's local time. */
export function dateTimeToTimestamp(value: string, zone: "utc" | "local"): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1).map((x) => Number(x ?? 0));
  const date = zone === "utc" ? new Date(Date.UTC(y, mo - 1, d, h, mi, s)) : new Date(y, mo - 1, d, h, mi, s);
  if (date.getTime() !== date.getTime()) return null;
  // Reject overflowed dates such as 2026-02-30.
  const check = zone === "utc" ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()] : [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  if (check[0] !== y || check[1] !== mo || check[2] !== d) return null;
  return date.getTime();
}

export function energyCost(watts: number, hoursPerDay: number, days: number, ratePerKwh: number, quantity = 1): { kwh: number; cost: number; kwhPerDay: number; costPerDay: number } {
  const kwhPerDay = (watts * hoursPerDay * quantity) / 1000;
  return { kwhPerDay, costPerDay: kwhPerDay * ratePerKwh, kwh: kwhPerDay * days, cost: kwhPerDay * days * ratePerKwh };
}

export const KM_PER_MILE = 1.609344;
export const LITRES_PER_US_GALLON = 3.785411784;
export const LITRES_PER_UK_GALLON = 4.54609;

export type EfficiencyUnit = "km_per_l" | "l_per_100km" | "mpg_us" | "mpg_uk";
export type FuelPriceUnit = "per_l" | "per_us_gal" | "per_uk_gal";

/** Litres of fuel to drive `distanceKm` at the given efficiency. */
export function fuelLitres(distanceKm: number, efficiency: number, unit: EfficiencyUnit): number {
  switch (unit) {
    case "km_per_l":
      return distanceKm / efficiency;
    case "l_per_100km":
      return (distanceKm * efficiency) / 100;
    case "mpg_us":
      return (distanceKm / KM_PER_MILE / efficiency) * LITRES_PER_US_GALLON;
    case "mpg_uk":
      return (distanceKm / KM_PER_MILE / efficiency) * LITRES_PER_UK_GALLON;
  }
}

export function pricePerLitre(price: number, unit: FuelPriceUnit): number {
  return unit === "per_l" ? price : unit === "per_us_gal" ? price / LITRES_PER_US_GALLON : price / LITRES_PER_UK_GALLON;
}

/** Length units in feet. */
export const LENGTH_IN_FEET: Record<string, number> = { ft: 1, in: 1 / 12, yd: 3, m: 1 / 0.3048, cm: 1 / 30.48 };
export const SQ_M_PER_SQ_FT = 0.09290304;
export const SQ_FT_PER_ACRE = 43_560;

export type Shape = "rectangle" | "circle" | "triangle";

/** Area in square feet. rectangle: a × b; circle: π r² (a = radius); triangle: ½ × base × height. */
export function areaSqFt(shape: Shape, a: number, b: number, unit: string): number {
  const f = LENGTH_IN_FEET[unit];
  const x = a * f;
  const y = b * f;
  return shape === "rectangle" ? x * y : shape === "circle" ? Math.PI * x * x : 0.5 * x * y;
}

/**
 * Marla size in square feet. Conventions differ across Pakistan (and India): 272.25 sq ft (30.25 sq yd)
 * is the traditional revenue-record marla; 225 sq ft is widely used by housing schemes, notably in Lahore;
 * 250 sq ft is used by some other schemes. The user always picks one.
 */
export const MARLA_STANDARDS = [272.25, 250, 225] as const;
export type MarlaStandard = (typeof MARLA_STANDARDS)[number];
export const MARLAS_PER_KANAL = 20;
export const SQ_FT_PER_SQ_YD = 9;
