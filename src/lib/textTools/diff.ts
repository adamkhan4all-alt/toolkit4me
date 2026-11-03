// ---------------------------------------------------------------------
// Text Compare — thin wrapper over jsdiff (`diff`, BSD-3-Clause). Only
// imported by TextCompareWorkspace, which is lazy-loaded, so the library
// is downloaded on the Text Compare page alone.
// ---------------------------------------------------------------------

import {
  createTwoFilesPatch,
  diffArrays,
  diffWords,
  type ChangeObject,
  type DiffArraysOptionsAbortable,
  type DiffWordsOptionsAbortable,
} from "diff";

export const MAX_DIFF_CHARS = 300_000;
/** Give up rather than freeze the tab when two very different inputs make the diff expensive. */
export const DIFF_TIMEOUT_MS = 3000;

export type DiffMode = "lines" | "words";

export interface DiffOptions {
  mode: DiffMode;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

export type DiffResult =
  | { ok: true; parts: ChangeObject<string>[]; added: number; removed: number; identical: boolean }
  | { ok: false; message: string };

function splitLines(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines[lines.length - 1] === "") lines.pop(); // a trailing newline doesn't start another line
  return lines;
}

/**
 * Line-by-line diff via diffArrays, whose documented `comparator` lets us
 * ignore case and/or whitespace (diffLines supports neither ignoreCase nor
 * a comparator). Runs in jsdiff's async (callback) mode so a large diff is
 * computed in slices and never freezes the page. Resolves undefined if it
 * hits the time limit.
 */
function diffByLine(original: string, changed: string, options: DiffOptions): Promise<ChangeObject<string>[] | undefined> {
  const normalise = (line: string) => {
    const s = options.ignoreWhitespace ? line.trim().replace(/\s+/g, " ") : line;
    return options.ignoreCase ? s.toLocaleLowerCase() : s;
  };
  return new Promise((resolve) => {
    const arrayOptions: DiffArraysOptionsAbortable<string> = {
      timeout: DIFF_TIMEOUT_MS,
      comparator: (left, right) => normalise(left) === normalise(right),
      callback: (parts) => resolve(parts?.map((p) => ({ ...p, value: p.value.map((line) => `${line}\n`).join(""), count: p.value.length }))),
    };
    diffArrays(splitLines(original), splitLines(changed), arrayOptions);
  });
}

function diffByWord(original: string, changed: string, options: DiffOptions): Promise<ChangeObject<string>[] | undefined> {
  return new Promise((resolve) => {
    const wordOptions: DiffWordsOptionsAbortable = { ignoreCase: options.ignoreCase, timeout: DIFF_TIMEOUT_MS, callback: resolve };
    diffWords(original, changed, wordOptions);
  });
}

function countUnits(parts: ChangeObject<string>[], mode: DiffMode, which: "added" | "removed"): number {
  return parts.filter((p) => p[which]).reduce((n, p) => n + (mode === "lines" ? p.count ?? 0 : p.value.trim().split(/\s+/).filter(Boolean).length), 0);
}

export async function compareText(original: string, changed: string, options: DiffOptions): Promise<DiffResult> {
  if (!original && !changed) return { ok: false, message: "Paste text into both boxes to compare them." };
  if (original.length > MAX_DIFF_CHARS || changed.length > MAX_DIFF_CHARS) {
    return { ok: false, message: `Each text can be up to ${MAX_DIFF_CHARS.toLocaleString()} characters.` };
  }
  const parts = options.mode === "lines" ? await diffByLine(original, changed, options) : await diffByWord(original, changed, options);
  if (!parts) {
    return { ok: false, message: "These texts are too different to compare quickly. Try comparing smaller sections, or switch to line mode." };
  }
  const added = countUnits(parts, options.mode, "added");
  const removed = countUnits(parts, options.mode, "removed");
  return { ok: true, parts, added, removed, identical: added === 0 && removed === 0 };
}

/** Standard unified diff (the format `git diff` and `patch` use), or "" if it can't be built within the time limit. */
export function unifiedDiff(original: string, changed: string): Promise<string> {
  return new Promise((resolve) => {
    createTwoFilesPatch("original.txt", "changed.txt", original, changed, "", "", {
      context: 3,
      timeout: DIFF_TIMEOUT_MS,
      callback: (patch: string | undefined) => resolve(patch ?? ""),
    });
  });
}
