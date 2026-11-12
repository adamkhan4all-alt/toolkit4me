import type { Deps } from "./auth.js";

/** Production dependencies: real environment and fetch. Tests pass their own. */
export function productionDeps(): Deps {
  return { env: process.env, fetch: globalThis.fetch.bind(globalThis) };
}
