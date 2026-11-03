import { useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { breadcrumbUrl, buildMetaTags, checkMeta, DESCRIPTION_GUIDE, EMPTY_META, TITLE_GUIDE, type MetaInput } from "../../../lib/textTools/metaTags";
import { CharCount, CopyButton, DownloadTextButton, PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

const EXAMPLE: MetaInput = {
  ...EMPTY_META,
  title: "Handmade Leather Wallets | Smith & Co",
  description: "Slim, hand-stitched leather wallets made to order in our workshop. Choose your leather and thread colour, with free UK delivery.",
  url: "https://www.example.com/wallets",
  siteName: "Smith & Co",
  imageUrl: "https://www.example.com/images/wallets-share.jpg",
  imageAlt: "Three brown leather wallets on a wooden workbench",
  twitterHandle: "@smithandco",
};

const TEXT_FIELDS: { id: keyof MetaInput; label: string; placeholder: string; limit?: number; multiline?: boolean }[] = [
  { id: "title", label: "Page title", placeholder: "e.g. Handmade Leather Wallets | Smith & Co", limit: TITLE_GUIDE },
  { id: "description", label: "Description", placeholder: "One or two sentences summarising the page", limit: DESCRIPTION_GUIDE, multiline: true },
  { id: "url", label: "Page URL (canonical)", placeholder: "https://www.example.com/page" },
  { id: "siteName", label: "Site name", placeholder: "e.g. Smith & Co" },
  { id: "imageUrl", label: "Share image URL", placeholder: "https://www.example.com/share-image.jpg" },
  { id: "imageAlt", label: "Share image alt text", placeholder: "Describe the image" },
  { id: "twitterHandle", label: "X (Twitter) username", placeholder: "@yourbrand" },
];

export default function MetaTagWorkspace({ tool }: { tool: ToolDefinition }) {
  const [input, setInput] = useState<MetaInput>(EMPTY_META);
  const set = <K extends keyof MetaInput>(key: K, value: MetaInput[K]) => setInput((prev) => ({ ...prev, [key]: value }));
  const issues = checkMeta(input);
  const html = input.title.trim() ? buildMetaTags(input) : "";
  const issuesFor = (field: keyof MetaInput) => issues.filter((i) => i.field === field);

  return (
    <div className={panelClass}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((f) => (
          <div key={f.id} className={f.multiline || f.id === "title" ? "sm:col-span-2" : ""}>
            <label htmlFor={`meta-${f.id}`} className={labelClass}>
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                id={`meta-${f.id}`}
                value={String(input[f.id])}
                onChange={(e) => set(f.id, e.target.value as never)}
                rows={3}
                placeholder={f.placeholder}
                className={`${textareaClass} font-sans`}
              />
            ) : (
              <input id={`meta-${f.id}`} value={String(input[f.id])} onChange={(e) => set(f.id, e.target.value as never)} placeholder={f.placeholder} className={inputClass} />
            )}
            {f.limit !== undefined && <CharCount value={String(input[f.id]).trim()} limit={f.limit} />}
            {String(input[f.id]).trim() &&
              issuesFor(f.id).map((i) => (
                <p key={i.message} className={`mt-1 text-xs ${i.level === "error" ? "text-error-600" : "text-warning-600"}`}>
                  {i.message}
                </p>
              ))}
          </div>
        ))}

        <div>
          <label htmlFor="meta-type" className={labelClass}>
            Page type
          </label>
          <select id="meta-type" value={input.type} onChange={(e) => set("type", e.target.value as MetaInput["type"])} className={inputClass}>
            <option value="website">Website / general page</option>
            <option value="article">Article / blog post</option>
          </select>
        </div>
        <fieldset className="flex flex-col justify-end gap-2 pb-1 text-sm text-neutral-900">
          <legend className="sr-only">Search engine options</legend>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={input.index} onChange={(e) => set("index", e.target.checked)} className="h-4 w-4" />
            Allow search engines to index this page
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={input.follow} onChange={(e) => set("follow", e.target.checked)} className="h-4 w-4" />
            Allow search engines to follow its links
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={input.includeBasics} onChange={(e) => set("includeBasics", e.target.checked)} className="h-4 w-4" />
            Include charset and viewport tags
          </label>
        </fieldset>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="tertiary" onClick={() => setInput(EXAMPLE)}>
          Load example
        </Button>
        <Button variant="tertiary" onClick={() => setInput(EMPTY_META)}>
          Clear
        </Button>
      </div>

      {!input.index && <Alert variant="warning">“noindex” keeps this page out of search results. Only use it for pages you deliberately want hidden, such as thank-you or admin pages.</Alert>}

      {input.title.trim() && (
        <div aria-label="Search result preview" className="rounded-lg border border-neutral-200 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-600 uppercase">Search result preview (approximate)</p>
          <p className="truncate text-xs text-neutral-600">{breadcrumbUrl(input.url)}</p>
          <p className="truncate text-lg leading-snug text-brand-700">{input.title.trim()}</p>
          <p className="line-clamp-2 text-sm text-neutral-600">{input.description.trim() || "Search engines will pick a snippet from the page."}</p>
        </div>
      )}

      <div>
        <label htmlFor="meta-output" className={labelClass}>
          Your meta tags
        </label>
        <textarea
          id="meta-output"
          value={html || "Add a page title to generate your tags."}
          readOnly
          rows={14}
          spellCheck={false}
          className={`${textareaClass} ${html ? "" : "text-neutral-600"}`}
        />
        <p className="mt-1 text-xs text-neutral-600">Paste these inside the &lt;head&gt; of your page.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={html} label={tool.actionLabel} />
        <DownloadTextButton text={html} fileName="meta-tags.html" mime="text/html;charset=utf-8" label="Download .html" />
      </div>

      <PrivacyLine>Generated in your browser — nothing you type is sent to a server.</PrivacyLine>
    </div>
  );
}
