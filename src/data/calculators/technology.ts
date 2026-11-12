// Developer & Technology calculators — specs + page content. Loaded only on these calculators' pages.
import { Reader, type CalculatorDefinition, type Values } from "../../lib/calculators/engine";
import { fmt } from "../../lib/calculators/format";
import { convertData, dataUnit, DATA_UNITS, dateTimeToTimestamp, detectTimestampUnit, formatDuration, SPEED_UNITS, timestampToDate, transferSeconds } from "../../lib/calculators/formulas/units";

const is = (key: string, ...vals: string[]) => (v: Values) => vals.includes(String(v[key]));
const SIZE_UNITS = ["kB", "MB", "GB", "TB", "KiB", "MiB", "GiB", "TiB"].map((id) => ({ value: id, label: dataUnit(id).label }));
const SPEEDS = SPEED_UNITS.map((s) => ({ value: s.id, label: s.label }));

function transferCalculator(id: string, direction: "download" | "upload", example: Values, content: CalculatorDefinition["content"]): CalculatorDefinition {
  const compare = direction === "download" ? [10, 25, 50, 100, 300, 1000] : [5, 10, 20, 50, 100, 500];
  return {
    id,
    spec: {
      fields: [
        { type: "number", key: "size", label: "File size", min: 0, minExclusive: true },
        { type: "select", key: "sizeUnit", label: "Size unit", options: SIZE_UNITS },
        { type: "number", key: "speed", label: `${direction === "download" ? "Download" : "Upload"} speed`, min: 0, minExclusive: true },
        { type: "select", key: "speedUnit", label: "Speed unit", options: SPEEDS },
        { type: "number", key: "overhead", label: "Overhead allowance", unit: "%", min: 0, max: 90, optional: true, help: "Real transfers lose some speed to network protocols and congestion. 0 gives the theoretical best; 10–20% is more realistic." },
      ],
      defaults: { size: "", sizeUnit: "GB", speed: "", speedUnit: "mbps", overhead: "10" },
      example,
      calculate(v) {
        const r = new Reader(this, v);
        const size = r.num("size");
        const sizeUnit = r.select("sizeUnit");
        const speed = r.num("speed");
        const speedUnit = r.select("speedUnit");
        const overhead = r.optNum("overhead") ?? 0;
        if (r.failed) return r.failure();
        const bits = size * dataUnit(sizeUnit).bits;
        const bps = speed * SPEED_UNITS.find((s) => s.id === speedUnit)!.bps;
        const seconds = transferSeconds(bits, bps, overhead);
        return {
          ok: true,
          headline: { label: `Estimated ${direction} time`, value: formatDuration(seconds) },
          rows: [
            { label: "In seconds", value: fmt(seconds, 1) },
            { label: "Effective speed", value: `${fmt((bps * (1 - overhead / 100)) / 1e6, 2)} Mbps (${fmt((bps * (1 - overhead / 100)) / 8e6, 2)} MB/s)` },
          ],
          table: {
            caption: `Same file at other ${direction} speeds (with ${fmt(overhead)}% overhead)`,
            headers: ["Speed", "Time"],
            rows: compare.map((mbps) => [`${mbps >= 1000 ? `${mbps / 1000} Gbps` : `${mbps} Mbps`}`, formatDuration(transferSeconds(bits, mbps * 1e6, overhead))]),
          },
          steps: [`${fmt(size, 6)} ${sizeUnit} = ${fmt(bits, 0)} bits`, `${fmt(bits, 0)} ÷ (${fmt(bps, 0)} bps × ${fmt(1 - overhead / 100, 2)}) = ${fmt(seconds, 1)} s`],
        };
      },
    },
    content,
  };
}

const download = transferCalculator(
  "download-time-calculator",
  "download",
  { size: "4", sizeUnit: "GB", speed: "50", speedUnit: "mbps", overhead: "0" },
  {
    seo: {
      title: "Download Time Calculator – How Long Will It Take? | Toolkit4Me",
      metaDescription: "Estimate how long a file, game or video takes to download at your internet speed. Handles Mbps vs MB/s and decimal vs binary sizes, with an overhead allowance.",
      h1: "Download Time Calculator",
    },
    intro: [
      "Internet plans are sold in megabits per second (Mbps), but files are measured in megabytes and gigabytes — and there are 8 bits in a byte. That's why a \"100 Mb\" connection doesn't download 100 MB a second. Enter a file size and your speed to see how long the download should take, plus a comparison at other common speeds.",
      "Add an overhead allowance to account for the speed lost to network protocols, Wi-Fi and busy servers; 10–20% is typical. With 0% you get the theoretical best case.",
    ],
    howTo: ["Enter the file size and pick its unit (GB for most games and videos).", "Enter your download speed — from your plan or a speed test — and its unit.", "Adjust the overhead allowance if you like, then select Calculate."],
    formula: {
      lines: ["Time (s) = size in bits ÷ (speed in bits per second × (1 − overhead ÷ 100))", "1 byte = 8 bits; 1 MB = 1,000,000 bytes; 1 MiB = 1,048,576 bytes"],
      explanation: ["Everything is converted to bits first, so mixing bytes and bits, or decimal (MB) and binary (MiB) units, gives the right answer."],
    },
    workedExample: ["A 4 GB file at 50 Mbps with no overhead: 4 × 8,000,000,000 = 32,000,000,000 bits ÷ 50,000,000 bits per second = 640 seconds, or 10 min 40 s. With 15% overhead it would take about 12 min 33 s."],
    faq: [
      { question: "Why is my download slower than the calculator says?", answer: "The server may be sending slower than your line can receive, Wi-Fi may be the bottleneck, other devices may be sharing the connection, or the plan speed is a maximum rather than a guarantee. Run a speed test and use the measured figure." },
      { question: "What's the difference between Mbps and MB/s?", answer: "Mbps is megabits per second; MB/s is megabytes per second. Divide Mbps by 8 to get MB/s — 100 Mbps is 12.5 MB/s. Download managers usually show MB/s; internet plans use Mbps." },
      { question: "Is a GB 1,000 MB or 1,024 MB?", answer: "Both are used. Storage makers and networks use 1 GB = 1,000,000,000 bytes; Windows reports sizes in binary units (1 GiB = 1,073,741,824 bytes) but labels them GB. Choose GiB if the size came from Windows." },
    ],
    related: ["upload-time-calculator", "data-storage-converter", "unix-timestamp-converter", "percentage-calculator"],
  }
);

const upload = transferCalculator(
  "upload-time-calculator",
  "upload",
  { size: "25", sizeUnit: "GB", speed: "20", speedUnit: "mbps", overhead: "0" },
  {
    seo: {
      title: "Upload Time Calculator – Backup & File Upload Time | Toolkit4Me",
      metaDescription: "Estimate how long a backup, video or file upload will take at your upload speed. Converts Mbps and MB/s and includes an overhead allowance. Free calculator.",
      h1: "Upload Time Calculator",
    },
    intro: [
      "Upload speeds are usually far lower than download speeds — many home connections upload at a tenth of their download rate — so cloud backups, video uploads and sending large files can take much longer than people expect. Enter the size and your upload speed to plan around it.",
      "The comparison table shows the same upload at other common speeds, which helps when deciding whether a faster plan or an overnight upload makes more sense.",
    ],
    howTo: ["Enter the size of the file or backup.", "Enter your upload speed from a speed test (look for the \"upload\" figure).", "Set an overhead allowance and select Calculate."],
    formula: {
      lines: ["Time (s) = size in bits ÷ (upload speed in bits per second × (1 − overhead ÷ 100))"],
      explanation: ["The calculation is identical to a download; only the speed differs. Use your measured upload speed, not your plan's headline (download) speed."],
    },
    workedExample: ["Backing up 25 GB at 20 Mbps: 200,000,000,000 bits ÷ 20,000,000 bits per second = 10,000 seconds — 2 h 46 min 40 s before any overhead."],
    faq: [
      { question: "Why is my upload speed so much lower than my download speed?", answer: "Most home broadband (ADSL, cable, many fibre plans) is asymmetric: more capacity is given to downloads because that's what most people use. Symmetric fibre plans offer equal speeds." },
      { question: "Will uploading slow down my internet?", answer: "A saturated upload can slow everything, including downloads and video calls, because acknowledgements can't get out. Many backup apps let you cap their upload speed." },
      { question: "Do cloud services compress my files?", answer: "Some backup tools compress or skip unchanged data, which makes uploads faster than this estimate; photos and videos are already compressed, so they rarely shrink." },
    ],
    related: ["download-time-calculator", "data-storage-converter", "unix-timestamp-converter", "percentage-calculator"],
  }
);

const storage: CalculatorDefinition = {
  id: "data-storage-converter",
  spec: {
    fields: [
      { type: "number", key: "value", label: "Value", min: 0 },
      { type: "select", key: "from", label: "From", options: DATA_UNITS.map((u) => ({ value: u.id, label: u.label })) },
      { type: "select", key: "to", label: "To", options: DATA_UNITS.map((u) => ({ value: u.id, label: u.label })) },
    ],
    defaults: { value: "", from: "GB", to: "MB" },
    example: { value: "1", from: "GiB", to: "MB" },
    calculate(v) {
      const r = new Reader(this, v);
      const value = r.num("value");
      const from = r.select("from");
      const to = r.select("to");
      if (r.failed) return r.failure();
      const res = convertData(value, from, to);
      return {
        ok: true,
        headline: { label: `${fmt(value, 6)} ${from} in ${to}`, value: `${fmt(res, 6)} ${to}` },
        table: { caption: `${fmt(value, 6)} ${from} in every unit`, headers: ["Unit", "Value"], rows: DATA_UNITS.map((u) => [u.label, fmt(convertData(value, from, u.id), 6)]) },
        steps: [`${fmt(value, 6)} × ${fmt(dataUnit(from).bits, 0)} bits ÷ ${fmt(dataUnit(to).bits, 0)} bits = ${fmt(res, 6)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Data Storage Converter – KB, MB, GB, TB, MiB & GiB | Toolkit4Me",
      metaDescription: "Convert between bits, bytes, kilobytes, megabytes, gigabytes and terabytes, and binary units like MiB and GiB. See any value in every unit at once.",
      h1: "Data Storage Converter",
    },
    intro: [
      "Computer storage has two sets of units that look almost the same. Decimal units (kB, MB, GB, TB) go up in thousands and are used by drive makers and networks; binary units (KiB, MiB, GiB, TiB) go up in 1,024s and are what Windows shows — while labelling them \"GB\". That's why a 1 TB drive appears as about 931 GB on a PC.",
      "Convert a value between any two units, or read the table to see it in every unit at once, from bits to pebibytes.",
    ],
    howTo: ["Enter the value.", "Choose the unit it's in and the unit you want.", "Select Calculate; the table lists every other unit too."],
    formula: {
      lines: ["Result = value × bits per source unit ÷ bits per target unit", "1 B = 8 bits · 1 kB = 1,000 B · 1 KiB = 1,024 B · 1 GB = 10⁹ B · 1 GiB = 2³⁰ B"],
      explanation: ["Converting through bits keeps every conversion exact, including between bits and bytes and between decimal and binary prefixes."],
    },
    workedExample: ["1 GiB = 1,073,741,824 bytes = 1,073.741824 MB. Going the other way, a 1 TB drive holds 1,000,000,000,000 bytes, which is about 931.32 GiB."],
    faq: [
      { question: "Why does my 1 TB drive show as 931 GB?", answer: "The maker counts 1 TB as 10¹² bytes; Windows divides by 1,024³ and calls the result GB. 10¹² ÷ 1,073,741,824 ≈ 931.3. No space is missing." },
      { question: "Which units does macOS use?", answer: "Since 2009 macOS has shown decimal units, so a 1 TB drive appears as 1 TB. Windows and many Linux tools show binary values." },
      { question: "What's the difference between Mb and MB?", answer: "A lower-case b means bits, a capital B means bytes. 1 MB is 8 Mb. Network speeds are quoted in bits, file sizes in bytes." },
    ],
    related: ["download-time-calculator", "upload-time-calculator", "unix-timestamp-converter", "percentage-calculator"],
  },
};

const timestamp: CalculatorDefinition = {
  id: "unix-timestamp-converter",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "Convert",
        options: [
          { value: "toDate", label: "Timestamp → date" },
          { value: "toTimestamp", label: "Date → timestamp" },
        ],
      },
      { type: "text", key: "ts", label: "Unix timestamp", placeholder: "e.g. 1700000000", maxLength: 24, showIf: is("mode", "toDate") },
      {
        type: "select",
        key: "unit",
        label: "Timestamp unit",
        options: [
          { value: "auto", label: "Detect automatically" },
          { value: "s", label: "Seconds" },
          { value: "ms", label: "Milliseconds" },
        ],
        showIf: is("mode", "toDate"),
      },
      { type: "datetime", key: "date", label: "Date and time", showIf: is("mode", "toTimestamp") },
      {
        type: "select",
        key: "zone",
        label: "The date and time are in",
        options: [
          { value: "utc", label: "UTC" },
          { value: "local", label: "My time zone" },
        ],
        showIf: is("mode", "toTimestamp"),
      },
    ],
    defaults: { mode: "toDate", ts: "", unit: "auto", date: "", zone: "utc" },
    example: { mode: "toDate", ts: "1700000000", unit: "auto", date: "", zone: "utc" },
    calculate(v) {
      const r = new Reader(this, v);
      if (r.select("mode") === "toDate") {
        const raw = r.text("ts");
        const n = /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : NaN;
        if (!raw) r.fail("ts", "Enter a Unix timestamp.");
        else if (!Number.isFinite(n)) r.fail("ts", "A Unix timestamp is a whole number of seconds (or milliseconds), such as 1700000000.");
        const choice = r.select("unit");
        if (r.failed) return r.failure();
        const unit = choice === "auto" ? detectTimestampUnit(n) : (choice as "s" | "ms");
        const date = timestampToDate(n, unit);
        if (!date) return { ok: false, errors: { ts: "That timestamp is outside the range dates can represent (about ±275,000 years)." } };
        return {
          ok: true,
          headline: { label: "UTC", value: date.toISOString().replace("T", " ").replace(/\.000Z$/, " UTC").replace(/Z$/, " UTC") },
          rows: [
            { label: "Your time zone", value: date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" }) },
            { label: "ISO 8601", value: date.toISOString() },
            { label: "Read as", value: unit === "s" ? "seconds since 1 Jan 1970 UTC" : "milliseconds since 1 Jan 1970 UTC" },
            { label: unit === "s" ? "In milliseconds" : "In seconds", value: unit === "s" ? fmt(n * 1000, 0) : fmt(n / 1000, 3) },
          ],
        };
      }
      const raw = r.text("date");
      const zone = r.select<"utc" | "local">("zone");
      const ms = raw ? dateTimeToTimestamp(raw, zone) : null;
      if (!raw) r.fail("date", "Enter a date and time.");
      else if (ms === null) r.fail("date", "That date and time isn't valid.");
      if (r.failed || ms === null) return r.failure();
      return {
        ok: true,
        headline: { label: "Unix timestamp (seconds)", value: String(Math.floor(ms / 1000)) },
        rows: [
          { label: "Milliseconds", value: String(ms) },
          { label: "UTC", value: new Date(ms).toISOString() },
        ],
      };
    },
  },
  content: {
    seo: {
      title: "Unix Timestamp Converter – Epoch to Date & Date to Epoch | Toolkit4Me",
      metaDescription: "Convert Unix epoch timestamps to readable dates in UTC and your time zone, or dates to timestamps. Detects seconds vs milliseconds automatically.",
      h1: "Unix Timestamp Converter",
    },
    intro: [
      "Unix time counts the seconds since midnight UTC on 1 January 1970, and it's how most databases, APIs and log files store moments in time. Paste a timestamp to see it as a date in UTC and in your own time zone, or turn a date and time into a timestamp.",
      "JavaScript and many APIs use milliseconds instead of seconds. The converter detects which one you've pasted from its size, or you can choose.",
    ],
    howTo: ["Choose the direction.", "Paste a timestamp, or pick a date and time and say whether it's UTC or your local time.", "Select Calculate."],
    formula: {
      lines: ["Date = 1970-01-01 00:00:00 UTC + timestamp seconds", "Timestamp = (date − 1970-01-01 UTC) in seconds", "Auto-detect: values of 100,000,000,000 or more are treated as milliseconds"],
      explanation: ["Unix time ignores leap seconds and doesn't depend on time zones — the same instant has the same timestamp everywhere. Only the displayed date changes with your time zone."],
    },
    workedExample: ["1700000000 seconds after the epoch is 14 November 2023, 22:13:20 UTC. In milliseconds that's 1700000000000."],
    faq: [
      { question: "How do I know if a timestamp is in seconds or milliseconds?", answer: "Count the digits: current timestamps in seconds have 10 digits; in milliseconds they have 13. Auto-detect uses this rule." },
      { question: "What is the year 2038 problem?", answer: "Systems that store Unix time in a signed 32-bit integer overflow after 2147483647 — 19 January 2038, 03:14:07 UTC. Modern systems use 64-bit values, which last far longer." },
      { question: "Can timestamps be negative?", answer: "Yes. Negative values are dates before 1970 — -86400 is 31 December 1969, 00:00 UTC." },
    ],
    related: ["date-difference-calculator", "data-storage-converter", "days-between-dates-calculator", "age-calculator"],
  },
};

export const CALCULATORS: CalculatorDefinition[] = [download, upload, storage, timestamp];
