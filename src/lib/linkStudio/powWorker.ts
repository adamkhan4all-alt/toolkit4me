// Web Worker: solves the shortener's proof-of-work challenge off the main thread, so the page stays responsive.
import { solvePow, type PowChallenge } from "./pow";

self.onmessage = (e: MessageEvent<PowChallenge>) => {
  try {
    self.postMessage({ ok: true, nonce: solvePow(e.data) });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) });
  }
};
