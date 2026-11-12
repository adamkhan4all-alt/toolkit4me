import { describe, expect, it } from "vitest";
import { GUIDES, guidesForTool } from "../guides";
import { GUIDE_INDEX } from "../guideIndex.generated";
import { buildGuideIndex } from "../../lib/seo/guideIndex";

describe("generated guide index", () => {
  it("matches the guide content (run `npm run seo:generate` if this fails)", () => {
    expect(GUIDE_INDEX).toEqual(buildGuideIndex(GUIDES));
  });

  it("gives tool pages the same guides as guidesForTool", () => {
    for (const slug of ["qr-code-generator", "compress-pdf", "word-counter"]) {
      expect(GUIDE_INDEX.filter((g) => g.relatedTools.includes(slug)).map((g) => g.path)).toEqual(guidesForTool(slug).map((g) => g.path));
    }
  });
});
