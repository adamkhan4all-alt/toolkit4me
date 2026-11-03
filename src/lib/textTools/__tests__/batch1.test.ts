import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { findUnsafeIntegers, locateParseError, MAX_JSON_CHARS, offsetToLocation, processJson } from "../json";
import { colourWarning, contrastRatio, QR_MAX_BYTES, validateQrText } from "../qr";
import { resolveResize } from "../../processing/imageProcessing";

describe("JSON formatter", () => {
  it("pretty-prints with the chosen indentation", () => {
    const r = processJson('{"a":1,"b":[true,null]}', "format", "2");
    expect(r.ok && r.output).toBe('{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}');
    const tabs = processJson('{"a":1}', "format", "tab");
    expect(tabs.ok && tabs.output).toBe('{\n\t"a": 1\n}');
  });

  it("minifies", () => {
    const r = processJson('{\n  "a": 1,\n  "b": "x y"\n}', "minify");
    expect(r.ok && r.output).toBe('{"a":1,"b":"x y"}');
  });

  it("sorts keys recursively without dropping values", () => {
    const r = processJson('{"b":{"d":1,"c":2},"a":[{"z":1,"y":2}]}', "minify", "2", true);
    expect(r.ok && r.output).toBe('{"a":[{"y":2,"z":1}],"b":{"c":2,"d":1}}');
  });

  it("reports the line and column of a syntax error", () => {
    const input = '{\n  "a": 1,\n  "b": 2,\n}';
    const r = processJson(input, "format");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.location?.line).toBe(4);
      expect(r.lineText).toBe("}");
    }
  });

  it("understands each engine's error-position wording", () => {
    const text = "line one\nline two";
    expect(locateParseError(text, "Unexpected token x in JSON at position 12")).toEqual({ line: 2, column: 4 });
    expect(locateParseError(text, "JSON.parse: unexpected character at line 2 column 3 of the JSON data")).toEqual({ line: 2, column: 3 });
    expect(locateParseError(text, "JSON Parse error: Unexpected identifier")).toBeUndefined();
    expect(offsetToLocation("ab\ncd", 3)).toEqual({ line: 2, column: 1 });
  });

  it("rejects empty and oversized input with a clear message", () => {
    const empty = processJson("   ", "format");
    expect(!empty.ok && empty.message).toMatch(/Paste or type/);
    const huge = processJson(`"${"x".repeat(MAX_JSON_CHARS)}"`, "format");
    expect(!huge.ok && huge.message).toMatch(/limit/);
  });

  it("warns about integers that can't be represented exactly, but not about strings or decimals", () => {
    expect(findUnsafeIntegers('{"id": 12345678901234567890, "s": "99999999999999999999", "d": 1.5}')).toEqual(["12345678901234567890"]);
    expect(findUnsafeIntegers('{"n": 9007199254740991}')).toEqual([]);
    const r = processJson('{"id": 12345678901234567890}', "format");
    expect(r.ok && r.warnings[0]).toMatch(/rounded/);
  });

  it("handles a large permitted document", () => {
    const big = JSON.stringify(Array.from({ length: 20000 }, (_, i) => ({ id: i, name: `item ${i}`, tags: ["a", "b"] })));
    const r = processJson(big, "format", "2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(JSON.parse(r.output)).toHaveLength(20000);
  });
});

describe("QR code generator", () => {
  function decode(text: string, level: "L" | "M" | "Q" | "H") {
    // Render the module matrix to RGBA pixels (4px per module, 4-module quiet zone) and decode it independently.
    const qr = QRCode.create(text, { errorCorrectionLevel: level });
    const n = qr.modules.size;
    const scale = 4;
    const margin = 4;
    const side = (n + margin * 2) * scale;
    const data = new Uint8ClampedArray(side * side * 4).fill(255);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (qr.modules.get(y, x))
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++) {
              const i = (((y + margin) * scale + dy) * side + (x + margin) * scale + dx) * 4;
              data[i] = data[i + 1] = data[i + 2] = 0;
            }
    return jsQR(data, side, side)?.data;
  }

  it.each([
    ["https://www.toolkit4me.com/tools/qr-code-generator?utm_source=poster", "M"],
    ["Hello, world — ünïcødé ✓", "H"],
    ["x".repeat(1000), "L"],
  ] as const)("round-trips %s (level %s) through an independent decoder", (text, level) => {
    expect(decode(text, level)).toBe(text);
  });

  it("validates empty and over-capacity input", () => {
    expect(validateQrText("  ", "M")).toMatch(/Enter/);
    expect(validateQrText("a".repeat(QR_MAX_BYTES.H + 1), "H")).toMatch(/at most 1,273/);
    expect(validateQrText("a".repeat(QR_MAX_BYTES.H), "H")).toBeNull();
    // Multi-byte characters count by their UTF-8 size.
    expect(validateQrText("é".repeat(1000), "H")).toMatch(/2,000 bytes/);
  });

  it("flags inverted and low-contrast colours", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(colourWarning("#000000", "#ffffff")).toBeNull();
    expect(colourWarning("#ffffff", "#000000")).toMatch(/lighter than its background/);
    expect(colourWarning("#777777", "#999999")).toMatch(/close/);
  });
});

describe("image resizer sizing", () => {
  const original = { width: 4000, height: 3000 };

  it("calculates the missing side from one dimension", () => {
    expect(resolveResize(original, { width: 1600, fit: "contain" })).toEqual({ width: 1600, height: 1200 });
    expect(resolveResize(original, { height: 600, fit: "contain" })).toEqual({ width: 800, height: 600 });
  });

  it("fits inside a box when both are set, or stretches when asked", () => {
    expect(resolveResize(original, { width: 600, height: 600, fit: "contain" })).toEqual({ width: 600, height: 450 });
    expect(resolveResize(original, { width: 600, height: 600, fit: "exact" })).toEqual({ width: 600, height: 600 });
  });

  it("allows enlarging and never returns a zero dimension", () => {
    expect(resolveResize({ width: 100, height: 50 }, { width: 400, fit: "contain" })).toEqual({ width: 400, height: 200 });
    expect(resolveResize({ width: 5000, height: 10 }, { width: 100, fit: "contain" })).toEqual({ width: 100, height: 1 });
  });

  it("requires at least one dimension", () => {
    expect(() => resolveResize(original, { fit: "contain" })).toThrow(/Enter a width/);
  });
});
