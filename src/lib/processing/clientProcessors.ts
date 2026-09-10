// ---------------------------------------------------------------------
// Maps a tool id to the function that actually performs its work,
// entirely client-side. This is the seam between the generic tool
// framework and real (non-mocked) processing: a tool with an entry here
// is rendered by ClientToolWorkspace instead of the mocked
// UploadWorkspace used by SERVER-mode tools that don't have a real
// backend yet.
// ---------------------------------------------------------------------

import { buildPdfFromImages, type PdfPageSize } from "./pdfProcessing";
import { convertImage, extensionForFormat, replaceExtension } from "./imageProcessing";
import { splitPdf } from "./pdfSplit";

export interface ClientProcessOutput {
  fileName: string;
  blob: Blob;
  originalSizeBytes: number;
  outputSizeBytes: number;
  width?: number;
  height?: number;
}

export interface ClientProcessorOptions {
  /** Quality slider value, 1–100. Used by compress-image. */
  quality?: number;
  /** "original" | "jpeg" | "png". Used by compress-image. */
  outputFormat?: string;
  /** Optional max width in px to downscale to. Used by compress-image. */
  maxWidth?: number;
  /** Used by jpg-to-pdf. */
  pageSize?: PdfPageSize;
  /** Used by split-pdf. */
  mode?: string;
  ranges?: string;
  everyN?: string;
}

export type ClientProcessor = (files: File[], options: ClientProcessorOptions) => Promise<ClientProcessOutput[]>;

const compressImage: ClientProcessor = async (files, options) => {
  const quality = (options.quality ?? 80) / 100;
  const results: ClientProcessOutput[] = [];

  for (const file of files) {
    const targetFormat: "jpeg" | "png" =
      options.outputFormat === "png" ? "png" : options.outputFormat === "jpeg" ? "jpeg" : file.type === "image/png" ? "png" : "jpeg";

    const { blob, width, height } = await convertImage(file, {
      format: targetFormat,
      quality,
      maxWidth: options.maxWidth,
    });

    results.push({
      fileName: replaceExtension(file.name, extensionForFormat(targetFormat)),
      blob,
      originalSizeBytes: file.size,
      outputSizeBytes: blob.size,
      width,
      height,
    });
  }

  return results;
};

const jpgToPng: ClientProcessor = async (files) => {
  const results: ClientProcessOutput[] = [];
  for (const file of files) {
    const { blob, width, height } = await convertImage(file, { format: "png" });
    results.push({
      fileName: replaceExtension(file.name, "png"),
      blob,
      originalSizeBytes: file.size,
      outputSizeBytes: blob.size,
      width,
      height,
    });
  }
  return results;
};

const pngToJpg: ClientProcessor = async (files) => {
  const results: ClientProcessOutput[] = [];
  for (const file of files) {
    const { blob, width, height } = await convertImage(file, { format: "jpeg", quality: 0.92 });
    results.push({
      fileName: replaceExtension(file.name, "jpg"),
      blob,
      originalSizeBytes: file.size,
      outputSizeBytes: blob.size,
      width,
      height,
    });
  }
  return results;
};

const jpgToPdf: ClientProcessor = async (files, options) => {
  const originalSizeBytes = files.reduce((sum, f) => sum + f.size, 0);
  const { blob } = await buildPdfFromImages(files, { pageSize: options.pageSize ?? "a4" });
  const fileName = files.length === 1 ? replaceExtension(files[0].name, "pdf") : "merged-images.pdf";
  return [{ fileName, blob, originalSizeBytes, outputSizeBytes: blob.size }];
};

const splitPdfProcessor: ClientProcessor = async (files, options) => {
  const file = files[0];
  const outputs = await splitPdf(file, {
    mode: options.mode === "every" ? "every" : "ranges",
    ranges: options.ranges ?? "",
    everyN: options.everyN ?? "1",
  });
  return outputs.map((o) => ({
    fileName: o.fileName,
    blob: o.blob,
    originalSizeBytes: file.size,
    outputSizeBytes: o.blob.size,
  }));
};

export const CLIENT_PROCESSORS: Record<string, ClientProcessor> = {
  "compress-image": compressImage,
  "jpg-to-png": jpgToPng,
  "png-to-jpg": pngToJpg,
  "jpg-to-pdf": jpgToPdf,
  "split-pdf": splitPdfProcessor,
};

export function getClientProcessor(toolId: string): ClientProcessor | undefined {
  return CLIENT_PROCESSORS[toolId];
}
