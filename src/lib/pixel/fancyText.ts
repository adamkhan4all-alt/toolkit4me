// ---------------------------------------------------------------------
// Fancy Text Generator: maps plain letters to look-alike Unicode
// characters (Mathematical Alphanumeric Symbols, enclosed letters,
// fullwidth forms, combining marks). Letters Unicode encoded earlier in
// the Letterlike Symbols block (e.g. italic ℎ, script ℬ) are listed as
// exceptions, because the main block leaves holes at those positions.
// ---------------------------------------------------------------------

export interface FancyStyle {
  id: string;
  name: string;
  convert: (text: string) => string;
}

type Exceptions = Record<string, number>;

function alphabet(upper: number, lower: number | null, digits: number | null = null, exceptions: Exceptions = {}) {
  return (text: string) =>
    Array.from(text)
      .map((ch) => {
        if (exceptions[ch] !== undefined) return String.fromCodePoint(exceptions[ch]);
        const c = ch.charCodeAt(0);
        if (c >= 65 && c <= 90) return String.fromCodePoint(upper + c - 65);
        if (c >= 97 && c <= 122) return lower === null ? String.fromCodePoint(upper + c - 97) : String.fromCodePoint(lower + c - 97);
        if (digits !== null && c >= 48 && c <= 57) return String.fromCodePoint(digits + c - 48);
        return ch;
      })
      .join("");
}

function table(from: string, to: string) {
  const map = new Map<string, string>();
  const src = Array.from(from);
  const dst = Array.from(to);
  src.forEach((ch, i) => map.set(ch, dst[i]));
  return (text: string) =>
    Array.from(text)
      .map((ch) => map.get(ch) ?? map.get(ch.toLowerCase()) ?? ch)
      .join("");
}

const combining = (mark: string) => (text: string) =>
  Array.from(text)
    .map((ch) => (ch === " " || ch === "\n" ? ch : ch + mark))
    .join("");

const circled = (text: string) =>
  Array.from(text)
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return String.fromCodePoint(0x24b6 + c - 65);
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x24d0 + c - 97);
      if (c === 48) return "⓪";
      if (c >= 49 && c <= 57) return String.fromCodePoint(0x2460 + c - 49);
      return ch;
    })
    .join("");

const fullwidth = (text: string) =>
  Array.from(text)
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c === 32) return "　";
      if (c >= 33 && c <= 126) return String.fromCodePoint(0xff01 + c - 33);
      return ch;
    })
    .join("");

const upsideDownTable = table(
  "abcdefghijklmnopqrstuvwxyz0123456789.,!?'\"()[]{}<>&_",
  "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ9ㄥ86˙'¡¿,„)(][}{><⅋‾"
);

export const FANCY_STYLES: FancyStyle[] = [
  { id: "bold", name: "Bold", convert: alphabet(0x1d400, 0x1d41a, 0x1d7ce) },
  { id: "italic", name: "Italic", convert: alphabet(0x1d434, 0x1d44e, null, { h: 0x210e }) },
  { id: "bold-italic", name: "Bold italic", convert: alphabet(0x1d468, 0x1d482) },
  { id: "sans-bold", name: "Sans bold", convert: alphabet(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { id: "sans-italic", name: "Sans italic", convert: alphabet(0x1d608, 0x1d622) },
  {
    id: "script",
    name: "Script",
    convert: alphabet(0x1d49c, 0x1d4b6, null, { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 }),
  },
  { id: "bold-script", name: "Bold script", convert: alphabet(0x1d4d0, 0x1d4ea) },
  { id: "fraktur", name: "Gothic (Fraktur)", convert: alphabet(0x1d504, 0x1d51e, null, { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 }) },
  {
    id: "double-struck",
    name: "Double-struck",
    convert: alphabet(0x1d538, 0x1d552, 0x1d7d8, { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 }),
  },
  { id: "monospace", name: "Monospace", convert: alphabet(0x1d670, 0x1d68a, 0x1d7f6) },
  { id: "circled", name: "Circled", convert: circled },
  { id: "squared", name: "Squared", convert: alphabet(0x1f170, null) },
  { id: "fullwidth", name: "Wide (fullwidth)", convert: fullwidth },
  { id: "small-caps", name: "Small caps", convert: table("abcdefghijklmnopqrstuvwxyz", "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ") },
  { id: "upside-down", name: "Upside down", convert: (t) => Array.from(upsideDownTable(t)).reverse().join("") },
  { id: "strikethrough", name: "Strikethrough", convert: combining("̶") },
  { id: "underline", name: "Underline", convert: combining("̲") },
];
