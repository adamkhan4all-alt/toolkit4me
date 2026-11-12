import { useId, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { Alert } from "../../ui/Alert";
import { buildUtmUrl, COMMON_MEDIUMS, type SpaceStyle, type UtmFields } from "../../../lib/linkTools/utm";
import { CopyButton, PrivacyLine, inputClass, labelClass, panelClass, textareaClass } from "./shared";

const FIELDS: { key: keyof UtmFields; label: string; placeholder: string; help: string; required?: boolean }[] = [
  { key: "source", label: "Campaign source", placeholder: "newsletter", help: "Where the link appears: newsletter, facebook, partner-site.", required: true },
  { key: "medium", label: "Campaign medium", placeholder: "email", help: "The type of channel: email, social, cpc, referral, display." },
  { key: "campaign", label: "Campaign name", placeholder: "spring-sale", help: "The promotion or campaign this link belongs to." },
  { key: "id", label: "Campaign ID (optional)", placeholder: "spring_2027", help: "Used by GA4 to join cost data you import." },
  { key: "term", label: "Campaign term (optional)", placeholder: "running shoes", help: "Paid search keyword." },
  { key: "content", label: "Campaign content (optional)", placeholder: "header-button", help: "Tells apart two links in the same email or ad." },
];

const EMPTY: UtmFields = { source: "", medium: "", campaign: "", term: "", content: "", id: "" };

export default function UtmBuilderWorkspace(_props: { tool: ToolDefinition }) {
  const id = useId();
  const [base, setBase] = useState("");
  const [fields, setFields] = useState<UtmFields>(EMPTY);
  const [lowercase, setLowercase] = useState(true);
  const [spaces, setSpaces] = useState<SpaceStyle>("keep");

  const touched = base.trim() !== "" || Object.values(fields).some((v) => v.trim() !== "");
  const result = touched ? buildUtmUrl(base, fields, { lowercase, spaces }) : null;

  return (
    <div className={panelClass}>
      <div>
        <label htmlFor={`${id}-base`} className={labelClass}>
          Landing page URL
        </label>
        <input
          id={`${id}-base`}
          type="url"
          inputMode="url"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="https://www.example.com/offer"
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`${id}-${f.key}`} className={labelClass}>
              {f.label}
              {f.required && <span className="text-error-600"> *</span>}
            </label>
            <input
              id={`${id}-${f.key}`}
              value={fields[f.key]}
              onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              maxLength={200}
              autoComplete="off"
              list={f.key === "medium" ? `${id}-mediums` : undefined}
              aria-describedby={`${id}-${f.key}-help`}
              className={inputClass}
            />
            <p id={`${id}-${f.key}-help`} className="mt-1 text-xs text-neutral-600">
              {f.help}
            </p>
          </div>
        ))}
        <datalist id={`${id}-mediums`}>
          {COMMON_MEDIUMS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="h-4 w-4" />
          Lowercase all values (recommended)
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          Spaces:
          <select value={spaces} onChange={(e) => setSpaces(e.target.value as SpaceStyle)} className="focus-ring h-9 rounded-[var(--radius-control)] border border-neutral-200 bg-white px-2 text-sm">
            <option value="keep">keep (encoded as %20)</option>
            <option value="dash">replace with -</option>
            <option value="underscore">replace with _</option>
          </select>
        </label>
      </div>

      {result && !result.ok && <Alert variant="error">{result.error}</Alert>}

      {result?.ok && (
        <>
          <div>
            <label htmlFor={`${id}-out`} className={labelClass}>
              Your campaign link
            </label>
            <textarea id={`${id}-out`} value={result.url} readOnly rows={3} spellCheck={false} className={`${textareaClass} break-all`} />
            <p className="mt-1 text-xs text-neutral-600">{result.url.length.toLocaleString()} characters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={result.url} label="Copy link" />
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="focus-ring inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-neutral-200 bg-white px-4 text-[15px] font-medium text-neutral-900 hover:border-brand-600"
            >
              Test link ↗
            </a>
          </div>
          {result.warnings.length > 0 && (
            <Alert variant="warning" title="Check before you use it">
              <ul className="ml-4 list-disc">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      )}

      {!touched && <p className="text-sm text-neutral-600">Fill in the landing page and campaign source to see your tagged link.</p>}

      <PrivacyLine>Built in your browser — the links you enter aren't sent to a server.</PrivacyLine>
    </div>
  );
}
