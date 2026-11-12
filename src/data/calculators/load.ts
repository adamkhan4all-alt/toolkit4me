// Loads one calculator's definition (formulas + page copy) on demand: each group is its own chunk,
// so visiting the Tip Calculator downloads the finance group only — never the other 25 calculators.
import type { CalculatorDefinition } from "../../lib/calculators/engine";
import type { CalculatorGroup } from "./catalog";

const LOADERS: Record<CalculatorGroup, () => Promise<{ CALCULATORS: CalculatorDefinition[] }>> = {
  everyday: () => import("./everyday"),
  finance: () => import("./finance"),
  education: () => import("./education"),
  technology: () => import("./technology"),
  home: () => import("./home"),
};

export async function loadCalculator(group: CalculatorGroup, id: string): Promise<CalculatorDefinition | undefined> {
  const mod = await LOADERS[group]();
  return mod.CALCULATORS.find((c) => c.id === id);
}
