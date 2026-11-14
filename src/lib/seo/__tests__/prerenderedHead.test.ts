import { afterEach, describe, expect, it } from "vitest";
import { removePrerenderedHead } from "../prerenderedHead";

const PRERENDERED = `
  <title data-prerender="true">Loan EMI Calculator | Toolkit4Me</title>
  <meta data-prerender="true" name="description" content="d" />
  <link data-prerender="true" rel="canonical" href="https://www.toolkit4me.com/calculators/loan-emi-calculator" />
  <script data-prerender="true" type="application/ld+json">{"@type":"BreadcrumbList"}</script>`;
const nextMutations = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  document.head.innerHTML = "";
});

describe("removePrerenderedHead", () => {
  it("removes the prerendered metadata at boot but keeps the title, so the page is never untitled", () => {
    document.head.innerHTML = PRERENDERED;
    removePrerenderedHead();
    expect(document.querySelectorAll("[data-prerender]")).toHaveLength(1);
    expect(document.querySelector("title")).toHaveAttribute("data-prerender");
    expect(document.title).toBe("Loan EMI Calculator | Toolkit4Me");
  });

  it("removes the prerendered title as soon as the app's own title appears, so there are never two", async () => {
    document.head.innerHTML = PRERENDERED;
    removePrerenderedHead();
    const appTitle = document.createElement("title");
    appTitle.textContent = "Loan EMI Calculator | Toolkit4Me";
    document.head.appendChild(appTitle);
    await nextMutations();
    expect(document.querySelectorAll("title")).toHaveLength(1);
    expect(document.querySelector("title")).toBe(appTitle);
    expect(document.title).toBe("Loan EMI Calculator | Toolkit4Me");
  });

  it("removes it straight away if the app's title is already there", () => {
    document.head.innerHTML = `${PRERENDERED}<title>App title</title>`;
    removePrerenderedHead();
    expect(document.querySelectorAll("title")).toHaveLength(1);
    expect(document.title).toBe("App title");
  });

  it("ignores unrelated head changes while waiting", async () => {
    document.head.innerHTML = PRERENDERED;
    removePrerenderedHead();
    document.head.appendChild(document.createElement("meta"));
    await nextMutations();
    expect(document.title).toBe("Loan EMI Calculator | Toolkit4Me");
  });

  it("does nothing on a page without prerendered tags", () => {
    document.head.innerHTML = "<title>Plain</title>";
    removePrerenderedHead();
    expect(document.title).toBe("Plain");
  });
});
