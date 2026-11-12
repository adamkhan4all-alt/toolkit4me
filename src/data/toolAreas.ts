import type { ToolCategory } from "../types/tool";

/**
 * One plain-language line per tool area, used by the About page's "What's
 * here" list and its prerendered HTML. Update it when a tool is added to,
 * or removed from, a category.
 */
export const TOOL_AREAS: { category: ToolCategory; summary: string }[] = [
  {
    category: "convert",
    summary: "PDF to Word and back; Word, PowerPoint and Excel to PDF; PDF to JPG and JPG to PDF; and converting images between JPG, PNG and WebP.",
  },
  { category: "compress", summary: "shrinking PDFs and images to fit email and upload limits." },
  { category: "merge", summary: "combining several PDFs into one, in the order you choose." },
  { category: "ocr", summary: "pulling editable text out of photos, screenshots and scans." },
  { category: "edit", summary: "reordering, rotating and deleting PDF pages, splitting PDFs, adding page numbers, and resizing images." },
  { category: "security", summary: "adding a password to a PDF, removing one you know, or lifting printing and copying restrictions." },
  { category: "text", summary: "counting words and characters, and comparing two versions of a text." },
  { category: "photo", summary: "photo filters, borders and frames, drop shadows, transparent backgrounds, pencil-sketch effects, colour palettes and blurring private details." },
  { category: "social", summary: "profile picture rings and fancy text for bios and posts." },
  { category: "video", summary: "turning short video clips into GIFs." },
  { category: "web", summary: "formatting and validating JSON, Base64 encoding and decoding, generating meta tags, and creating QR codes." },
];
