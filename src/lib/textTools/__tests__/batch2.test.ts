import { describe, expect, it } from "vitest";
import { analyzeText, formatDuration, wordList } from "../wordCount";
import { base64ToBytes, decodeBase64, encodeText, guessExtension } from "../base64";
import { compareText, unifiedDiff } from "../diff";

describe("word counter", () => {
  it("counts words, characters, sentences, paragraphs and lines", () => {
    const s = analyzeText("Hello world. This is a test!\n\nSecond paragraph here?\nAnother line.");
    expect(s.words).toBe(11);
    expect(s.sentences).toBe(4);
    expect(s.paragraphs).toBe(2);
    expect(s.lines).toBe(3);
    expect(s.characters).toBe(66);
    expect(s.charactersNoSpaces).toBe(55);
  });

  it("treats contractions and hyphenated words as single words", () => {
    expect(wordList("Don't over-think it")).toHaveLength(3);
  });

  it("counts emoji and accented letters as single characters", () => {
    const s = analyzeText("café 👍🏽");
    expect(s.characters).toBe(6);
  });

  it("segments languages written without spaces", () => {
    expect(analyzeText("我喜欢学习中文").words).toBeGreaterThan(1);
  });

  it("returns zeros for empty or whitespace-only text", () => {
    expect(analyzeText("   \n  ")).toMatchObject({ words: 0, sentences: 0, paragraphs: 0, lines: 0 });
  });

  it("estimates reading and speaking time and lists frequent non-stop-words", () => {
    const text = Array(476).fill("toolkit").join(" ");
    const s = analyzeText(text);
    expect(s.readingSeconds).toBe(120);
    expect(formatDuration(s.readingSeconds)).toBe("2 min");
    expect(s.topWords[0]).toEqual({ word: "toolkit", count: 476 });
    expect(analyzeText("the the the and and").topWords).toEqual([]);
    expect(formatDuration(45)).toBe("45 sec");
    expect(formatDuration(3900)).toBe("1 hr 5 min");
  });
});

describe("base64", () => {
  it("encodes and decodes UTF-8 text correctly (where plain btoa fails)", () => {
    const text = "Héllo, wörld — 你好 👋";
    const encoded = encodeText(text);
    expect(encoded).toBe(Buffer.from(text, "utf8").toString("base64"));
    expect(decodeBase64(encoded)).toMatchObject({ kind: "text", text });
  });

  it("supports the URL-safe alphabet without padding, and decodes it back", () => {
    const encoded = encodeText("??>>", true);
    expect(encoded).toBe("Pz8-Pg");
    expect(decodeBase64(encoded)).toMatchObject({ kind: "text", text: "??>>" });
  });

  it("ignores whitespace, line breaks and a data: URL prefix", () => {
    expect(decodeBase64("SGVs\nbG8g\r\nd29y bGQ=")).toMatchObject({ text: "Hello world" });
    expect(decodeBase64("data:text/plain;base64,SGk=")).toMatchObject({ text: "Hi" });
  });

  it("rejects invalid characters, misplaced padding and impossible lengths with clear messages", () => {
    expect(() => base64ToBytes("SGVsbG8*")).toThrow(/“\*” at position 8/);
    expect(() => base64ToBytes("SG=VsbG8")).toThrow(/only appear at the end/);
    expect(() => base64ToBytes("SGVsb")).toThrow(/wrong length/);
    expect(() => base64ToBytes("   ")).toThrow(/Paste some Base64/);
  });

  it("detects binary data and guesses its file type", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]).toString("base64");
    const result = decodeBase64(png);
    expect(result.kind).toBe("binary");
    expect(guessExtension(result.bytes)).toBe("png");
    expect(guessExtension(new Uint8Array([1, 2, 3]), "application/json")).toBe("json");
    expect(guessExtension(new Uint8Array([1, 2, 3]))).toBe("bin");
  });

  it("round-trips a large payload", () => {
    const text = "x".repeat(2_000_000);
    expect(decodeBase64(encodeText(text))).toMatchObject({ kind: "text", text });
  });
});

describe("text compare", () => {
  const base = { mode: "lines" as const, ignoreCase: false, ignoreWhitespace: false };

  it("finds added and removed lines", async () => {
    const r = await compareText("a\nb\nc\n", "a\nB\nc\nd\n", base);
    expect(r.ok && [r.added, r.removed, r.identical]).toEqual([2, 1, false]);
  });

  it("reports identical texts", async () => {
    const r = await compareText("same\n", "same\n", base);
    expect(r.ok && r.identical).toBe(true);
  });

  it("can ignore case and whitespace", async () => {
    const r1 = await compareText("Hello World\n", "hello world\n", { ...base, ignoreCase: true });
    expect(r1.ok && r1.identical).toBe(true);
    const r2 = await compareText("a  b\n", "a b\n", { ...base, ignoreWhitespace: true });
    expect(r2.ok && r2.identical).toBe(true);
  });

  it("compares word by word", async () => {
    const r = await compareText("the quick brown fox", "the slow brown fox", { ...base, mode: "words" });
    expect(r.ok && [r.added, r.removed]).toEqual([1, 1]);
  });

  it("validates empty and oversized input", async () => {
    expect(await compareText("", "", base)).toMatchObject({ ok: false });
    expect(await compareText("x".repeat(300_001), "y", base)).toMatchObject({ ok: false });
  });

  it("produces a standard unified diff", async () => {
    const patch = await unifiedDiff("a\nb\n", "a\nc\n");
    expect(patch).toContain("--- original.txt");
    expect(patch).toContain("+++ changed.txt");
    expect(patch).toContain("-b\n+c");
  });
});
