import { useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FANCY_STYLES } from "../../../lib/pixel/fancyText";
import { CopyButton, PrivacyLine, labelClass, panelClass, textareaClass } from "./shared";

const MAX_LENGTH = 500;

export default function FancyTextWorkspace({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = useState("Toolkit4Me makes text fun");
  const input = text.slice(0, MAX_LENGTH);

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor={`${tool.id}-input`} className={labelClass}>
          Your text
        </label>
        <textarea id={`${tool.id}-input`} value={text} maxLength={MAX_LENGTH} rows={2} onChange={(e) => setText(e.target.value)} className={`${textareaClass} font-sans`} placeholder="Type something…" />
        <p className="mt-1 text-xs text-neutral-600">
          {input.length} / {MAX_LENGTH} characters. Letters A–Z and digits are styled; other characters are left as they are.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200" aria-label="Styled versions of your text">
        {FANCY_STYLES.map((style) => {
          const out = style.convert(input);
          return (
            <li key={style.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-600">{style.name}</p>
                <p className="break-words text-base text-neutral-900" lang="und">
                  {out || " "}
                </p>
              </div>
              <CopyButton text={out} label="Copy" />
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-neutral-600">
        Screen readers may read styled letters one by one or skip them, and some may not appear in search. Keep important information — names, links,
        contact details — in plain text.
      </p>
      <PrivacyLine />
    </div>
  );
}
