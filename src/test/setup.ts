import "@testing-library/jest-dom/vitest";

// Unit tests never reach the real short-link service: the URL Shortener page would otherwise call
// go.toolkit4me.com while rendering. It's exercised end-to-end against a local Worker instead.
const realFetch = globalThis.fetch;
if (realFetch) {
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://go.toolkit4me.com")) return Promise.reject(new TypeError("Network access to go.toolkit4me.com is disabled in unit tests"));
    return realFetch(input, init);
  }) as typeof fetch;
}
