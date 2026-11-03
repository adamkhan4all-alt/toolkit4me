import { useDeferredValue, useMemo, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { analyzeText, formatDuration, MAX_COUNT_CHARS } from "../../../lib/textTools/wordCount";
import { CopyButton, PrivacyLine, labelClass, panelClass, textareaClass } from "./shared";

export default function WordCounterWorkspace({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = useState("");
  // Counting runs on a deferred copy, so typing stays responsive even in very long documents.
  const deferred = useDeferredValue(text);
  const tooLong = deferred.length > MAX_COUNT_CHARS;
  const stats = useMemo(() => analyzeText(tooLong ? deferred.slice(0, MAX_COUNT_CHARS) : deferred), [deferred, tooLong]);

  const tiles: [string, string][] = [
    ["Words", stats.words.toLocaleString()],
    ["Characters", stats.characters.toLocaleString()],
    ["Characters (no spaces)", stats.charactersNoSpaces.toLocaleString()],
    ["Sentences", stats.sentences.toLocaleString()],
    ["Paragraphs", stats.paragraphs.toLocaleString()],
    ["Reading time", formatDuration(stats.readingSeconds)],
    ["Speaking time", formatDuration(stats.speakingSeconds)],
    ["Lines", stats.lines.toLocaleString()],
  ];
  const summary = tiles.map(([k, v]) => `${k}: ${v}`).join("\n");

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor="word-count-text" className={labelClass}>
          Your text
        </label>
        <textarea
          id="word-count-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Start typing or paste your text here…"
          className={`${textareaClass} font-sans`}
        />
      </div>

      {tooLong && <Alert variant="warning">Only the first {MAX_COUNT_CHARS.toLocaleString()} characters are counted.</Alert>}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-100 p-3">
            <dt className="text-xs font-medium text-neutral-600">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-neutral-900">{value}</dd>
          </div>
        ))}
      </dl>

      {stats.topWords.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Most frequent words</h3>
          <ul className="flex flex-wrap gap-2">
            {stats.topWords.map(({ word, count }) => (
              <li key={word} className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
                {word} <span className="text-neutral-600">· {count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-neutral-600">Common words like “the” and “and” are left out.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton text={stats.words ? summary : ""} label={tool.actionLabel} />
        {text && (
          <Button variant="tertiary" onClick={() => setText("")}>
            Clear
          </Button>
        )}
      </div>

      <PrivacyLine>Counted in your browser — your text is never sent to a server.</PrivacyLine>
    </div>
  );
}
