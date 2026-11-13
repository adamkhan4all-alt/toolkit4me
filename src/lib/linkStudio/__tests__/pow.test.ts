// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { leadingZeroBits, sha256Words, solvePow } from "../pow";

const hex = (w: Uint32Array) => [...w].map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");

describe("proof-of-work solver", () => {
  it("matches the standard SHA-256 for short and multi-block inputs", () => {
    for (const s of ["", "abc", "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "x".repeat(55), "y".repeat(56), "z".repeat(64), "AbC123_-xyzQWERTYUIOPas:1234567"]) {
      expect(hex(sha256Words(s))).toBe(createHash("sha256").update(s).digest("hex"));
    }
  });

  it("counts leading zero bits", () => {
    expect(leadingZeroBits(new Uint32Array([0x0000ffff, 0]))).toBe(16);
    expect(leadingZeroBits(new Uint32Array([0, 0x10000000]))).toBe(35);
  });

  it("finds a nonce the server-side check would accept", () => {
    const id = "Qk9tYW5kb21DaGFsbGVuZ2";
    const nonce = solvePow({ id, difficulty: 12 });
    const digest = createHash("sha256").update(`${id}:${nonce}`).digest();
    const bits = digest[0] === 0 ? 8 + Math.clz32(digest[1]) - 24 : Math.clz32(digest[0]) - 24;
    expect(bits).toBeGreaterThanOrEqual(12);
  });
});
