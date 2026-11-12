import { describe, expect, it } from "vitest";
import { FANCY_STYLES } from "../fancyText";

const style = (id: string) => FANCY_STYLES.find((s) => s.id === id)!.convert;

describe("fancy text", () => {
  it("maps letters and digits to mathematical bold", () => {
    expect(style("bold")("Ab9")).toBe("𝐀𝐛𝟗");
  });
  it("uses the Letterlike Symbols exceptions where the main block has holes", () => {
    expect(style("italic")("h")).toBe("ℎ");
    expect(style("script")("BeHo")).toBe("ℬℯℋℴ");
    expect(style("fraktur")("CHIRZ")).toBe("ℭℌℑℜℨ");
    expect(style("double-struck")("CNR")).toBe("ℂℕℝ");
  });
  it("never produces an unassigned code point for any letter or digit", () => {
    const input = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // Unassigned holes in the Mathematical Alphanumeric block would match \p{Cn}.
    for (const s of FANCY_STYLES) expect(/\p{Cn}/u.test(s.convert(input)), s.id).toBe(false);
  });
  it("leaves spaces and punctuation the styles don't cover", () => {
    expect(style("bold")("a b, c!")).toBe("𝐚 𝐛, 𝐜!");
  });
  it("handles circled digits including zero", () => {
    expect(style("circled")("A1 0")).toBe("Ⓐ① ⓪");
  });
  it("squared maps lowercase to the uppercase squares", () => {
    expect(style("squared")("ok")).toBe("🅾🅺");
  });
  it("turns text upside down and reverses it", () => {
    expect(style("upside-down")("hello")).toBe("ollǝɥ");
  });
  it("adds combining strokes but not to spaces", () => {
    expect(style("strikethrough")("a b")).toBe("a̶ b̶");
  });
  it("fullwidth converts ASCII and the space", () => {
    expect(style("fullwidth")("Hi!")).toBe("Ｈｉ！");
  });
  it("has unique ids", () => {
    expect(new Set(FANCY_STYLES.map((s) => s.id)).size).toBe(FANCY_STYLES.length);
  });
});
