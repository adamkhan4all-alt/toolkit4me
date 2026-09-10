import type { ToolDefinition } from "../types/tool";

export interface FileValidationError {
  message: string;
}

export interface FileValidationResult {
  valid: File[];
  error?: FileValidationError;
}

/**
 * Shared validation used by every upload surface (mocked server-tool
 * workspace and the real client-processing workspace alike) — format,
 * size, and single/multiple-file rules, all driven by the tool's own
 * ToolDefinition so there is exactly one place this logic lives.
 */
export function validateFiles(tool: ToolDefinition, incoming: File[], existingCount: number): FileValidationResult {
  if (!tool.multiple && incoming.length + existingCount > 1) {
    return { valid: [], error: { message: "This tool accepts only one file at a time. Remove the current file first." } };
  }
  for (const file of incoming) {
    const isAccepted =
      tool.acceptedMime.includes(file.type) ||
      tool.acceptedFormats.some((f) => file.name.toLowerCase().endsWith(f.toLowerCase()));
    if (!isAccepted) {
      return {
        valid: [],
        error: { message: `"${file.name}" isn't a supported file type. Accepted formats: ${tool.acceptedFormats.join(", ")}.` },
      };
    }
    if (file.size > tool.maxFileSize * 1024 * 1024) {
      return {
        valid: [],
        error: { message: `"${file.name}" exceeds the ${tool.maxFileSize}MB limit. Try a smaller file or compress it first.` },
      };
    }
    if (file.size === 0) {
      return { valid: [], error: { message: `"${file.name}" is empty and can't be processed.` } };
    }
  }
  return { valid: incoming };
}
