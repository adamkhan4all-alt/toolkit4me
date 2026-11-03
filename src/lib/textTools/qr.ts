// ---------------------------------------------------------------------
// QR Code Generator helpers. Encoding itself is done by the `qrcode`
// package (MIT), which the workspace imports dynamically so it's only
// downloaded on the QR tool page.
// ---------------------------------------------------------------------

/** Byte-mode capacity of the largest QR code (version 40) at each error-correction level. */
export const QR_MAX_BYTES = { L: 2953, M: 2331, Q: 1663, H: 1273 } as const;
export type QrErrorLevel = keyof typeof QR_MAX_BYTES;

export function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return NaN;
  const channels = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Scanners need dark modules on a light background with clear contrast; returns a warning, or null if the colours are safe. */
export function colourWarning(foreground: string, background: string): string | null {
  if (luminance(foreground) > luminance(background)) {
    return "The code is lighter than its background. Many scanners can't read inverted QR codes — use a dark colour on a light background.";
  }
  if (contrastRatio(foreground, background) < 4) {
    return "These colours are quite close. Low contrast makes the code hard to scan — choose a darker foreground or lighter background.";
  }
  return null;
}

export function validateQrText(text: string, level: QrErrorLevel): string | null {
  if (!text.trim()) return "Enter the text or link you want to encode.";
  const bytes = utf8Length(text);
  if (bytes > QR_MAX_BYTES[level]) {
    return `That's ${bytes.toLocaleString()} bytes — a QR code at this error-correction level holds at most ${QR_MAX_BYTES[level].toLocaleString()}. Shorten the text, or choose a lower error-correction level.`;
  }
  return null;
}
