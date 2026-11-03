// ---------------------------------------------------------------------
// Word Counter — text statistics using the browser's Intl.Segmenter
// (language-aware word/sentence boundaries, including languages written
// without spaces such as Chinese and Japanese), with a regex fallback for
// browsers that lack it. No library.
// ---------------------------------------------------------------------

export const MAX_COUNT_CHARS = 1_000_000;

/** Average adult silent-reading and speaking speeds, in words per minute. */
export const READING_WPM = 238;
export const SPEAKING_WPM = 140;

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingSeconds: number;
  speakingSeconds: number;
  topWords: { word: string; count: number }[];
}

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have he her his i if in into is it its me my of on or our she so that the their them there they this to was we were what when which who will with you your not no do does did can could would should than then these those been being had".split(
    " "
  )
);

type SegmenterCtor = new (locale?: string, options?: { granularity: "grapheme" | "word" | "sentence" }) => {
  segment(text: string): Iterable<{ segment: string; isWordLike?: boolean }>;
};

function getSegmenter(): SegmenterCtor | undefined {
  return (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
}

const WORD_FALLBACK = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

const HYPHENS = new Set(["-", "‐", "‑"]);

export function wordList(text: string): string[] {
  const Segmenter = getSegmenter();
  if (!Segmenter) return text.match(WORD_FALLBACK) ?? [];
  const segments = Array.from(new Segmenter(undefined, { granularity: "word" }).segment(text));
  const words: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (!s.isWordLike) continue;
    // ICU splits hyphenated compounds ("over-think"); word processors count them as one word, so join them back.
    let word = s.segment;
    while (HYPHENS.has(segments[i + 1]?.segment ?? "") && segments[i + 2]?.isWordLike) {
      word += segments[i + 1].segment + segments[i + 2].segment;
      i += 2;
    }
    words.push(word);
  }
  return words;
}

function graphemeCount(text: string): number {
  const Segmenter = getSegmenter();
  if (!Segmenter) return Array.from(text).length;
  let n = 0;
  for (const _ of new Segmenter(undefined, { granularity: "grapheme" }).segment(text)) n++;
  return n;
}

function sentenceCount(text: string): number {
  const Segmenter = getSegmenter();
  const segments = Segmenter
    ? Array.from(new Segmenter(undefined, { granularity: "sentence" }).segment(text), (s) => s.segment)
    : text.split(/(?<=[.!?])\s+/);
  return segments.filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
}

export function analyzeText(text: string): TextStats {
  const words = wordList(text);
  const frequency = new Map<string, number>();
  for (const w of words) {
    const key = w.toLocaleLowerCase();
    if (key.length < 2 || STOP_WORDS.has(key) || /^\d+$/.test(key)) continue;
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }
  const topWords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const trimmed = text.trim();
  return {
    words: words.length,
    characters: graphemeCount(text),
    charactersNoSpaces: graphemeCount(text.replace(/\s+/g, "")),
    sentences: sentenceCount(text),
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
    lines: trimmed ? text.split(/\r?\n/).filter((l) => l.trim()).length : 0,
    readingSeconds: Math.round((words.length / READING_WPM) * 60),
    speakingSeconds: Math.round((words.length / SPEAKING_WPM) * 60),
    topWords,
  };
}

/** "45 sec", "3 min", "1 hr 5 min". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}
