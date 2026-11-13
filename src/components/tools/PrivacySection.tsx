import type { ToolDefinition } from "../../types/tool";

/**
 * Full "Privacy & security" section — a dedicated, scannable page section
 * (as opposed to the one-line notice near the upload area) explaining
 * exactly what happens to a user's file, worded accurately for the tool's
 * actual processing mode rather than generic boilerplate.
 */
export function PrivacySection({ tool }: { tool: ToolDefinition }) {
  const isClient = tool.processingMode === "CLIENT";

  return (
    <section aria-labelledby="privacy-heading" className="flex flex-col gap-4">
      <h2 id="privacy-heading" className="text-2xl font-semibold text-neutral-900">
        Privacy &amp; security
      </h2>
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600">
        {tool.privacyNote ? (
          tool.privacyNote.map((p) => <p key={p}>{p}</p>)
        ) : (
          <>
        {/* Standard wording by processing mode (tools without a privacyNote). */}
        {isClient && tool.inputKind === "text" ? (
          <p>
            {tool.shortName} runs entirely in your browser — the text you enter is processed on your device and is
            never sent to our servers or stored anywhere. Closing or refreshing the page clears it.
          </p>
        ) : isClient ? (
          <p>
            {tool.shortName} runs entirely in your browser using local processing — your file is never uploaded to a
            server. Nothing about its contents leaves your device at any point, which makes this a good option for
            sensitive files.
          </p>
        ) : (
          <p>
            When you use {tool.shortName}, your file is transferred to our servers over an encrypted connection
            purely to run the conversion, then automatically deleted within 1 hour. We don't inspect, share, or
            retain your files beyond what's needed to process the job and let you download the result.
          </p>
        )}
          </>
        )}
      </div>
    </section>
  );
}
