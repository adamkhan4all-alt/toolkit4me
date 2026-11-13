// Short, memorable addresses that permanently redirect to the tools' real (already indexed) pages, so there is
// never a second copy of a page (owner decision D11, docs/RELEASE_6_AUDIT.md). vercel.json carries the same list
// as 308 redirects for direct visits; App.tsx uses it for in-app navigation. A test keeps the two in sync.
export const SHORT_PATH_REDIRECTS: { from: string; to: string }[] = [
  { from: "/url-tools", to: "/link-studio" },
  // Shortening is admin-only, so these lead to the hub, which explains short links and links to the team console.
  { from: "/url-shortener", to: "/link-studio" },
  { from: "/bulk-url-shortener", to: "/link-studio" },
  { from: "/qr-code-generator", to: "/tools/qr-code-generator" },
  { from: "/url-validator", to: "/tools/url-validator" },
  { from: "/url-encoder-decoder", to: "/tools/url-encoder-decoder" },
  { from: "/utm-builder", to: "/tools/utm-builder" },
  { from: "/url-parser-cleaner", to: "/tools/url-parser-cleaner" },
  { from: "/whatsapp-sticker-maker", to: "/tools/whatsapp-sticker-maker" },
  { from: "/picture-avatar", to: "/tools/picture-avatar" },
  { from: "/picture-to-anime", to: "/tools/picture-to-anime" },
];
