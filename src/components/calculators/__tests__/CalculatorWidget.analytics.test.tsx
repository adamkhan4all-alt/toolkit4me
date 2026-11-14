import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "../../ui/ToastProvider";
import { CalculatorWidget } from "../CalculatorWidget";
import { ALL_CALCULATORS } from "../../../data/calculators/all";
import { CALCULATOR_CATALOG, getCalculatorListing } from "../../../data/calculators/catalog";
import { calculatorTypeOf, validEvent } from "../../../lib/analytics";

// The real catalog validation (calculatorEventBase, validEvent) is used; only the send step is replaced, so the test
// sees exactly what would reach GA4.
const sent = vi.hoisted(() => [] as { name: string; params: Record<string, unknown> }[]);
vi.mock("../../../lib/analytics", async (importActual) => {
  const actual = await importActual<typeof import("../../../lib/analytics")>();
  return { ...actual, trackEvent: (name: string, params: Record<string, unknown>) => sent.push({ name, params: { ...params } }) };
});
const clipboard = vi.hoisted(() => ({ ok: true }));
vi.mock("../../../lib/clipboard", () => ({ copyToClipboard: vi.fn(async () => clipboard.ok) }));

const definitionOf = (id: string) => {
  const d = ALL_CALCULATORS.find((c) => c.id === id);
  if (!d) throw new Error(`no definition for ${id}`);
  return d;
};
function renderCalc(id: string) {
  const listing = getCalculatorListing(id)!;
  return render(
    <ToastProvider>
      <CalculatorWidget definition={definitionOf(id)} title={listing.name} calculatorId={listing.id} category={listing.group} />
    </ToastProvider>
  );
}
const base = (id: string) => {
  const l = getCalculatorListing(id)!;
  return { calculator_name: l.id, calculator_category: l.group, calculator_type: calculatorTypeOf(l.id) };
};
const names = () => sent.map((e) => e.name);
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => {
  sent.length = 0;
  clipboard.ok = true;
});
afterEach(cleanup);

describe("CalculatorWidget analytics: explicit actions", () => {
  it("Calculate → calculator_calculate (button) then calculator_result (ok)", () => {
    renderCalc("loan-emi-calculator");
    click("Try the example"); // fill valid values
    sent.length = 0;
    click("Calculate");
    expect(sent).toEqual([
      { name: "calculator_calculate", params: { ...base("loan-emi-calculator"), trigger: "button" } },
      { name: "calculator_result", params: { ...base("loan-emi-calculator"), result_status: "ok" } },
    ]);
  });

  it("Try the example → calculator_calculate (example) then calculator_result (ok)", () => {
    renderCalc("tip-calculator");
    click("Try the example");
    expect(sent).toEqual([
      { name: "calculator_calculate", params: { ...base("tip-calculator"), trigger: "example" } },
      { name: "calculator_result", params: { ...base("tip-calculator"), result_status: "ok" } },
    ]);
  });

  it("an invalid calculation reports result_status invalid", () => {
    renderCalc("loan-emi-calculator");
    const first = document.querySelector<HTMLInputElement>("form input")!;
    fireEvent.change(first, { target: { value: "" } });
    click("Calculate");
    expect(sent.at(-1)).toEqual({ name: "calculator_result", params: { ...base("loan-emi-calculator"), result_status: "invalid" } });
  });

  it("live recalculation while editing sends nothing; each keystroke is not an event", () => {
    renderCalc("percentage-calculator");
    click("Try the example");
    sent.length = 0;
    const input = document.querySelector<HTMLInputElement>("form input")!;
    for (const v of ["1", "12", "123", "1234"]) fireEvent.change(input, { target: { value: v } });
    expect(sent).toEqual([]);
  });

  it("Reset → exactly one calculator_reset", () => {
    renderCalc("discount-calculator");
    click("Reset");
    expect(sent).toEqual([{ name: "calculator_reset", params: base("discount-calculator") }]);
  });

  it("Copy result → calculator_copy_result success, or failed when the clipboard refuses", async () => {
    renderCalc("compound-interest-calculator");
    click("Try the example");
    sent.length = 0;
    click("Copy result");
    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toEqual({ name: "calculator_copy_result", params: { ...base("compound-interest-calculator"), copy_status: "success" } });
    clipboard.ok = false;
    click("Copy result");
    await waitFor(() => expect(sent).toHaveLength(2));
    expect(sent[1].params.copy_status).toBe("failed");
  });

  it("never sends entered values or results — only catalog metadata and fixed values", () => {
    renderCalc("loan-emi-calculator");
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("form input"));
    fireEvent.change(inputs[0], { target: { value: "987654" } });
    click("Calculate");
    const headline = document.querySelector("[aria-live] .text-2xl")?.textContent ?? "";
    const payload = JSON.stringify(sent);
    expect(payload).not.toContain("987654");
    if (headline) expect(payload).not.toContain(headline);
    for (const e of sent) expect(validEvent(e.name, e.params)).toBe(true);
  });

  it("sends nothing when the page passes metadata that doesn't match the catalog", () => {
    render(
      <ToastProvider>
        <CalculatorWidget definition={definitionOf("tip-calculator")} title="Tip" calculatorId="tip-calculator" category="education" />
      </ToastProvider>
    );
    click("Try the example");
    click("Reset");
    expect(sent).toEqual([]);
  });
});

describe("CalculatorWidget analytics: all 30 calculators", () => {
  it("covers every calculator in the catalog", () => {
    expect(CALCULATOR_CATALOG).toHaveLength(30);
    expect(ALL_CALCULATORS.map((c) => c.id).sort()).toEqual(CALCULATOR_CATALOG.map((c) => c.id).sort());
  });

  it.each(CALCULATOR_CATALOG.map((c) => [c.id] as const))("%s: example → calculate+result, Calculate → calculate+result, Reset → reset; all valid", (id) => {
    renderCalc(id);
    click("Try the example");
    click("Calculate");
    click("Reset");
    expect(names()).toEqual(["calculator_calculate", "calculator_result", "calculator_calculate", "calculator_result", "calculator_reset"]);
    expect(sent.map((e) => e.params.trigger).filter(Boolean)).toEqual(["example", "button"]);
    expect(sent.filter((e) => e.name === "calculator_result").every((e) => e.params.result_status === "ok")).toBe(true);
    for (const e of sent) {
      expect(e.params).toMatchObject(base(id));
      expect(validEvent(e.name, e.params)).toBe(true);
    }
  });
});
