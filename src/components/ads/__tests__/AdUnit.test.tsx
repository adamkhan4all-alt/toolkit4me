import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * src/config/ads.ts reads import.meta.env at module-load time, so each
 * scenario below stubs env vars with `vi.stubEnv` *before* dynamically
 * importing the component fresh via `vi.resetModules()` — otherwise every
 * test would share the first-evaluated config.
 */
async function renderAdBanner() {
  const { AdBanner } = await import("../AdBanner");
  return render(<AdBanner />);
}

describe("advertising components", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    document.head.innerHTML = "";
  });

  beforeEach(() => {
    vi.resetModules();
  });

  it("renders a clearly-labeled, non-interactive placeholder and injects no AdSense script when ads are disabled (the default)", async () => {
    vi.stubEnv("VITE_ADS_ENABLED", "false");
    await renderAdBanner();

    expect(screen.getByText("Advertisement")).toBeInTheDocument();
    expect(screen.getByText(/Ad space — banner/i)).toBeInTheDocument();
    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
    expect(document.querySelector('script[data-adsbygoogle-loader="true"]')).not.toBeInTheDocument();
  });

  it("still falls back to the placeholder when ads are enabled but the publisher/slot config is incomplete", async () => {
    vi.stubEnv("VITE_ADS_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_CLIENT_ID", "");
    vi.stubEnv("VITE_AD_SLOT_BANNER", "");
    await renderAdBanner();

    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
    expect(screen.getByText(/Ad space — banner/i)).toBeInTheDocument();
  });

  it("renders a real AdSense unit and injects the loader script exactly once when fully configured", async () => {
    vi.stubEnv("VITE_ADS_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_CLIENT_ID", "ca-pub-1234567890123456");
    vi.stubEnv("VITE_AD_SLOT_BANNER", "1111111111");

    await renderAdBanner();

    const ins = document.querySelector("ins.adsbygoogle");
    expect(ins).toBeInTheDocument();
    expect(ins).toHaveAttribute("data-ad-client", "ca-pub-1234567890123456");
    expect(ins).toHaveAttribute("data-ad-slot", "1111111111");
    expect(document.querySelectorAll('script[data-adsbygoogle-loader="true"]')).toHaveLength(1);
  });

  it("always shows the same 'Advertisement' label whether a real ad or the placeholder renders — never disguised as app content", async () => {
    vi.stubEnv("VITE_ADS_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_CLIENT_ID", "ca-pub-1234567890123456");
    vi.stubEnv("VITE_AD_SLOT_BANNER", "1111111111");
    await renderAdBanner();
    expect(screen.getByText("Advertisement")).toBeInTheDocument();
  });
});
