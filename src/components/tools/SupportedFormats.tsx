import type { ToolDefinition } from "../../types/tool";

/** Dedicated "Supported formats" section — explicit input/output/size-limit info as real page content, not just dropzone copy. */
export function SupportedFormats({ tool }: { tool: ToolDefinition }) {
  return (
    <section aria-labelledby="formats-heading" className="flex flex-col gap-4">
      <h2 id="formats-heading" className="text-2xl font-semibold text-neutral-900">
        Supported formats
      </h2>
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">Accepts</dt>
            <dd className="mt-1 text-sm text-neutral-900">{tool.acceptedFormats.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">Max file size</dt>
            <dd className="mt-1 text-sm text-neutral-900">{tool.maxFileSize}MB per file</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">Output</dt>
            <dd className="mt-1 text-sm text-neutral-900">.{tool.outputExtension}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{tool.formatsNote}</p>
      </div>
    </section>
  );
}
