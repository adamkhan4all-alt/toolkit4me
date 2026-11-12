import type { ToolDefinition } from "../types/tool";

// ---------------------------------------------------------------------
// Pixel Playground — creative photo and social tools. All of them run
// entirely in the browser (canvas); nothing is uploaded. Content below
// describes exactly what the code in src/lib/pixel does: no AI models
// are used, and the pages say so where it matters.
// ---------------------------------------------------------------------

const RELEASED = "2026-11-12";
const IMAGE_FORMATS = ["JPG", "PNG", "WEBP"];
const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_LIMIT = "One JPG, PNG or WebP image up to 25MB";
const SIZE_NOTE =
  "Photos larger than 4,096 pixels on the longest side are scaled down to 4,096 pixels before editing, and images over 60 megapixels are refused, so phones don't run out of memory.";

const base = {
  hub: "pixel" as const,
  addedOn: RELEASED,
  lastModified: RELEASED,
  acceptedFormats: IMAGE_FORMATS,
  acceptedMime: IMAGE_MIME,
  maxFileSize: 25,
  inputLimitLabel: IMAGE_LIMIT,
  multiple: false,
  processingMode: "CLIENT" as const,
  endpoint: null,
};

export const PIXEL_TOOLS: ToolDefinition[] = [
  {
    ...base,
    id: "photo-filters",
    slug: "photo-filters",
    featured: true,
    name: "Photo Filter Studio",
    shortName: "Photo Filters",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Give a photo a new look with ten one-click filters, then fine-tune brightness, contrast, saturation, warmth, fade and vignette.",
    actionLabel: "Download photo",
    icon: "FX",
    outputExtension: "jpg / .png / .webp",
    howItWorks: [
      "Choose a JPG, PNG or WebP photo.",
      "Tap a preset — Vivid, Golden hour, Noir, Faded film and more — to start from a look you like.",
      "Adjust the sliders until the preview looks right.",
      "Pick JPG, PNG or WebP and download the full-size result.",
    ],
    features: [
      "Ten presets, each a starting point you can adjust",
      "Seven sliders: brightness, contrast, saturation, warmth, sepia, fade and vignette",
      "Live preview while you adjust; the download is full resolution",
      "Same result in every browser — the maths runs in JavaScript, not browser-specific filters",
    ],
    useCases: [
      "Giving a set of photos for a post or album a consistent look",
      "Warming up a cold indoor shot or cooling an over-orange one",
      "Making a black-and-white or sepia version for a print or card",
    ],
    limitations: [
      "Edits apply to the whole photo — there's no selective or brush editing",
      "Filters don't fix blur, noise or badly out-of-focus shots",
      SIZE_NOTE,
      "Re-saving as JPG drops the photo's original EXIF details such as camera and location",
    ],
    faq: [
      {
        question: "Is this an AI photo editor?",
        answer: "No. The filters are colour adjustments calculated directly from each pixel — the same kind of maths as the sliders in a photo app. That makes them fast, predictable and private.",
      },
      {
        question: "Will the download be lower quality than my original?",
        answer: "It keeps the full resolution (up to 4,096 pixels on the longest side). Choose PNG for no compression, or JPG/WebP at 90%+ quality for a smaller file that looks the same.",
      },
      {
        question: "Can I apply the same filter to several photos?",
        answer: "Settings stay in place when you choose another image, so you can open each photo in turn and download it with the same look.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No. It's edited in your browser and never leaves your device.",
      },
    ],
    relatedTools: ["image-border-frame", "photo-to-sketch", "compress-image", "image-resizer"],
    intro: [
      "Photo Filter Studio gives you the quick looks people usually reach for in a phone app — vivid, warm, cool, black and white, faded film — and the sliders to fine-tune them. Start from a preset, nudge brightness, contrast or warmth, and watch the preview update as you go.",
      "Everything is calculated in your browser, so your photo isn't uploaded anywhere. The download is your full-size photo with the look applied, as JPG, PNG or WebP.",
    ],
    formatsNote: `Open a JPG, PNG or WebP photo up to 25MB. ${SIZE_NOTE} Download as JPG, PNG or WebP.`,
    seo: {
      title: "Photo Filters Online — Free Vintage, B&W & Warm Effects | Toolkit4Me",
      metaDescription: "Add free photo filters online: vivid, golden hour, noir, sepia and faded film, plus brightness, contrast, warmth and vignette sliders. Runs in your browser.",
      h1: "Photo Filter Studio",
      keywords: ["photo filters online", "free photo filter", "black and white photo", "vintage photo effect", "photo editor online"],
    },
  },
  {
    ...base,
    id: "image-border-frame",
    slug: "image-border-frame",
    name: "Image Border & Frame Maker",
    shortName: "Border & Frame",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Add a border or frame to a photo: even borders, an instant-photo frame, a gallery mat with an inner line, or rounded corners.",
    actionLabel: "Download framed image",
    icon: "FRAME",
    outputExtension: "png / .jpg / .webp",
    howItWorks: [
      "Choose the photo you want to frame.",
      "Pick a style: even border, instant photo, mat with inner line, or rounded corners.",
      "Set the border width and colour (and the corner radius or line colour, where offered).",
      "Download as PNG, JPG or WebP.",
    ],
    features: [
      "Four frame styles with one-click presets",
      "Border width set as a share of the photo, so it looks the same on any size",
      "Any border colour",
      "Rounded corners with a transparent outside when saved as PNG or WebP",
    ],
    useCases: [
      "Adding white space around a photo for Instagram or a print",
      "Making an instant-camera style picture for a card or scrapbook",
      "Rounding the corners of a screenshot or product photo for a website",
    ],
    limitations: [
      "The frame is added around the photo — the photo itself is never cropped",
      "Patterned or textured frames aren't available, only solid colours",
      "Transparent corners need PNG or WebP; in JPG they become white",
      SIZE_NOTE,
    ],
    faq: [
      {
        question: "How wide should a border be?",
        answer: "For social media, 3–6% of the shorter side gives a clean look. Instant-photo frames usually look right at 4–6%, with the deeper bottom added automatically.",
      },
      {
        question: "Why are my rounded corners white instead of see-through?",
        answer: "JPG can't store transparency, so transparent areas are filled with white. Choose PNG or WebP to keep them transparent.",
      },
      {
        question: "Does adding a border change my photo's size?",
        answer: "The image gets larger by the border on each side; the photo inside keeps its full resolution.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No — the frame is drawn in your browser.",
      },
    ],
    relatedTools: ["image-shadow-generator", "photo-filters", "profile-picture-border", "image-resizer"],
    intro: [
      "A plain border can make a photo look finished — on a feed, in a slideshow or printed. This tool adds one in a few clicks: an even border in any colour, an instant-photo frame with the deeper bottom edge, a gallery mat with a thin inner line, or rounded corners.",
      "The border width is a percentage of the photo's shorter side, so the preview matches the full-size download. The frame is added around your photo; nothing is cropped, and nothing is uploaded.",
    ],
    formatsNote: `Open a JPG, PNG or WebP image up to 25MB. ${SIZE_NOTE} Download as PNG, JPG or WebP.`,
    seo: {
      title: "Add Border to Photo — Free Image Frame Maker | Toolkit4Me",
      metaDescription: "Add a border or frame to any photo online: white or coloured borders, instant-photo frames, gallery mats and rounded corners. Free and private in your browser.",
      h1: "Image Border & Frame Maker",
      keywords: ["add border to photo", "image frame maker", "photo border online", "polaroid frame", "rounded corners image"],
    },
  },
  {
    ...base,
    id: "image-shadow-generator",
    slug: "image-shadow-generator",
    name: "Image Shadow Generator",
    shortName: "Image Shadow",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Add a soft drop shadow, floating shadow or glow behind an image, with rounded corners and a transparent or coloured background.",
    actionLabel: "Download image with shadow",
    icon: "SHADOW",
    outputExtension: "png / .webp / .jpg",
    howItWorks: [
      "Choose an image — a screenshot, product photo or logo works well.",
      "Start from a preset (Soft, Floating, Hard drop or Glow).",
      "Adjust offset, softness, strength, colour, corner rounding and the space around the image.",
      "Download as PNG or WebP to keep a transparent background, or JPG with a solid colour.",
    ],
    features: [
      "Four presets and full control of offset, softness, strength and colour",
      "Rounded corners on the image and its shadow",
      "Transparent background, or any solid colour",
      "Shadow sizes scale with the image, so the download matches the preview",
    ],
    useCases: [
      "Making screenshots stand out in a blog post, slide or app-store listing",
      "Giving product photos a lifted, catalogue-style look",
      "Adding a coloured glow behind a logo or avatar",
    ],
    limitations: [
      "The shadow follows the image's rectangle (with optional rounded corners), not the outline of the object inside it",
      "For a shadow around a cut-out object, first remove its background with Transparent Background Maker — the shadow will still be rectangular",
      "Transparent backgrounds need PNG or WebP",
      SIZE_NOTE,
    ],
    faq: [
      {
        question: "What's the best shadow for a screenshot?",
        answer: "The Soft or Floating presets with 2–4% corner rounding look natural on light pages. Keep strength around 25–35% so the shadow doesn't look heavy.",
      },
      {
        question: "Why is there empty space around my image?",
        answer: "Shadows extend beyond the image, so the canvas needs room for them. Reduce “Space around the image” to make it tighter — but too little will cut the shadow off.",
      },
      {
        question: "Can I put the shadow on a coloured background?",
        answer: "Yes. Switch Background to Solid colour and choose the colour of the page where the image will appear.",
      },
      {
        question: "Is my image uploaded?",
        answer: "No — the shadow is drawn in your browser.",
      },
    ],
    relatedTools: ["image-border-frame", "transparent-background", "compress-image", "webp-converter"],
    intro: [
      "A drop shadow lifts an image off the page — the effect you see on polished screenshots, product shots and portfolio images. This tool adds one behind any image, with presets for a soft shadow, a floating look, a hard graphic drop or a coloured glow.",
      "Choose a transparent background to place the result on any page, or a solid colour to match your design. It all happens in your browser; your image isn't uploaded.",
    ],
    formatsNote: `Open a JPG, PNG or WebP image up to 25MB. ${SIZE_NOTE} Download as PNG, WebP or JPG.`,
    seo: {
      title: "Add Drop Shadow to Image Online — Free Shadow Generator | Toolkit4Me",
      metaDescription: "Add a drop shadow, floating shadow or glow to any image online, with rounded corners and a transparent or coloured background. Free, in your browser.",
      h1: "Image Shadow Generator",
      keywords: ["add shadow to image", "drop shadow generator", "screenshot shadow", "image glow effect"],
    },
  },
  {
    ...base,
    id: "transparent-background",
    slug: "transparent-background",
    featured: true,
    name: "Transparent Background Maker",
    shortName: "Transparent Background",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Make a plain-coloured background transparent — ideal for logos, signatures, icons and product shots on white — and save a transparent PNG.",
    actionLabel: "Download transparent PNG",
    icon: "PNG✂",
    outputExtension: "png / .webp",
    howItWorks: [
      "Choose an image with a plain background, such as a logo on white.",
      "The background colour is detected from the corners; click the background in the original to choose a different one.",
      "Adjust Tolerance until the background disappears without eating into your subject, and add Edge softness for smoother edges.",
      "Download a transparent PNG or WebP.",
    ],
    features: [
      "Removes one background colour — detected automatically or picked with a click",
      "“Only touching the edges” mode keeps the same colour inside your subject",
      "Tolerance and edge softness controls with a side-by-side preview",
      "Transparent PNG or WebP output",
    ],
    useCases: [
      "Putting a logo with a white box onto a coloured website or slide",
      "Turning a scanned signature into a transparent PNG for documents",
      "Cutting out a product photographed on a plain backdrop",
    ],
    limitations: [
      "This removes a colour, not a “subject” — it works best on plain, evenly lit backgrounds",
      "Busy or photographic backgrounds (rooms, outdoors, people's hair) need an AI cut-out tool; this isn't one",
      "Shadows and gradients on the backdrop may need a higher tolerance, which can affect similar colours in the subject",
      SIZE_NOTE,
    ],
    faq: [
      {
        question: "Is this an AI background remover?",
        answer: "No. It makes pixels close to one chosen colour transparent. That's ideal for logos, signatures and items on a plain backdrop, and works instantly on any device — but it can't separate a person from a busy background.",
      },
      {
        question: "Parts of my logo disappeared too. How do I fix that?",
        answer: "Keep “Only remove background touching the edges” switched on, and lower the tolerance. That way only background connected to the image border is removed.",
      },
      {
        question: "The edges look jagged or have a white halo.",
        answer: "Increase Edge softness a little, and raise Tolerance slightly so the light pixels at the edge are included.",
      },
      {
        question: "Why can't I download a JPG?",
        answer: "JPG doesn't support transparency, so the background would come back as a solid colour. Use PNG, or WebP for a smaller file.",
      },
    ],
    relatedTools: ["image-shadow-generator", "png-to-jpg", "compress-image", "image-resizer"],
    intro: [
      "Logos, signatures and product shots often come on a white or coloured box that looks wrong on anything but a white page. This tool makes that background transparent: it detects the background colour from the corners — or you click it — and removes it, keeping your subject.",
      "It works by colour, so it's fast and precise on plain backgrounds. It isn't an AI cut-out tool and won't separate people from busy scenes. Your image is processed in your browser and never uploaded.",
    ],
    formatsNote: `Open a JPG, PNG or WebP image up to 25MB. ${SIZE_NOTE} Download as PNG or WebP with transparency.`,
    seo: {
      title: "Make Background Transparent — Free Transparent PNG Maker | Toolkit4Me",
      metaDescription: "Make a white or plain background transparent and save a transparent PNG. Ideal for logos, signatures and product shots. Free, private, in your browser.",
      h1: "Transparent Background Maker",
      keywords: ["make background transparent", "transparent png maker", "remove white background", "logo transparent background"],
    },
  },
  {
    ...base,
    id: "photo-to-sketch",
    slug: "photo-to-sketch",
    name: "Photo to Sketch",
    shortName: "Photo to Sketch",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Turn a photo into a pencil sketch or coloured-pencil drawing with adjustable stroke width and line darkness.",
    actionLabel: "Download sketch",
    icon: "✎ART",
    outputExtension: "jpg / .png / .webp",
    howItWorks: [
      "Choose a photo — portraits, pets and buildings with clear outlines work best.",
      "Pick Pencil or Coloured pencil, or start from a preset.",
      "Adjust stroke width and line darkness while comparing with the original.",
      "Download the sketch as JPG, PNG or WebP.",
    ],
    features: [
      "Pencil and coloured-pencil styles with four presets",
      "Stroke width and line darkness controls",
      "Side-by-side comparison with the original",
      "Full-resolution download",
    ],
    useCases: [
      "Making a sketch-style portrait for a card, cover or profile",
      "Creating a colouring-page outline from a photo",
      "Giving a set of images a hand-drawn look for a presentation",
    ],
    limitations: [
      "It's a classic image filter (the “colour dodge” technique), not AI — it traces the edges that are in the photo",
      "Low-contrast or very busy photos give faint or cluttered sketches",
      SIZE_NOTE,
    ],
    faq: [
      {
        question: "How does the sketch effect work?",
        answer: "The photo is turned to greyscale, an inverted and blurred copy is made, and the two are blended with a “colour dodge”. Flat areas turn white and edges stay dark, like pencil lines.",
      },
      {
        question: "Which photos work best?",
        answer: "Well-lit photos with clear outlines: faces, pets, buildings, objects against a plain background. Raise line darkness for soft photos.",
      },
      {
        question: "Is this an AI art generator?",
        answer: "No. It's a filter that redraws the photo's own edges, so the result always matches the original exactly — it doesn't invent details.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No — the effect is calculated in your browser.",
      },
    ],
    relatedTools: ["photo-filters", "image-border-frame", "image-resizer", "compress-image"],
    intro: [
      "Photo to Sketch redraws a photo as a pencil drawing: flat areas fade to paper-white while edges and shadows become pencil lines. Switch to coloured pencil to keep a soft wash of the original colours.",
      "It's a classic photo filter rather than AI, so the sketch follows your photo exactly and is ready in a moment. Everything runs in your browser and your photo isn't uploaded.",
    ],
    formatsNote: `Open a JPG, PNG or WebP photo up to 25MB. ${SIZE_NOTE} Download as JPG, PNG or WebP.`,
    seo: {
      title: "Photo to Sketch — Free Pencil Drawing Effect Online | Toolkit4Me",
      metaDescription: "Turn a photo into a pencil sketch or coloured-pencil drawing online, with adjustable stroke and line darkness. Free, instant and private in your browser.",
      h1: "Photo to Sketch",
      keywords: ["photo to sketch", "pencil sketch effect", "convert photo to drawing", "image to sketch online"],
    },
  },
  {
    ...base,
    id: "blur-image-areas",
    slug: "blur-image-areas",
    name: "Face Blur & Privacy Editor",
    shortName: "Blur Faces & Areas",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Hide faces, number plates, addresses and other private details in a photo by drawing boxes to pixelate, blur or black out.",
    actionLabel: "Download edited image",
    icon: "BLUR",
    outputExtension: "jpg / .png / .webp",
    howItWorks: [
      "Choose the photo or screenshot.",
      "Drag a box over each face, number plate or piece of text you want to hide.",
      "Choose Pixelate, Blur or Solid black box and set the strength.",
      "Download the edited copy — your original file isn't changed.",
    ],
    features: [
      "Hide as many areas as you need, with undo",
      "Pixelate, blur or solid black box",
      "Works with mouse, touch or pen",
      "Full-resolution download as JPG, PNG or WebP",
    ],
    useCases: [
      "Blurring faces of bystanders or children before posting a photo",
      "Hiding a number plate, house number or street sign",
      "Removing names, emails or account numbers from a screenshot",
    ],
    limitations: [
      "Areas are chosen by hand — there's no automatic face detection",
      "A light blur can sometimes be partly reversed; use Pixelate at high strength or a solid box for sensitive information",
      "Hidden details may still be readable in other copies of the photo, or in its EXIF data if you share the original",
      SIZE_NOTE,
    ],
    faq: [
      {
        question: "Which option hides information most securely?",
        answer: "A solid black box removes the details completely. Strong pixelation is also hard to reverse. Light blur is the weakest, because some of the original detail remains in the blurred pixels.",
      },
      {
        question: "Does it detect faces automatically?",
        answer: "No — you mark each area yourself. That keeps everything on your device and means nothing is missed by a detector, but check the whole photo before sharing.",
      },
      {
        question: "Is location data removed too?",
        answer: "Yes. The download is a newly drawn image, so the original's EXIF details such as GPS location aren't carried over.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No. Editing happens in your browser, which matters for exactly the kind of photo you'd want to blur.",
      },
    ],
    relatedTools: ["photo-filters", "compress-image", "image-resizer", "transparent-background"],
    intro: [
      "Before sharing a photo or screenshot, you often need to hide something: a stranger's face, a child, a car's number plate, an address or an account number. Drag a box over each one and choose how to hide it — pixelate, blur or a solid black box.",
      "Because the photo never leaves your browser, it's a safe place to edit images that contain private information. The download is a new image without the original's EXIF metadata.",
    ],
    formatsNote: `Open a JPG, PNG or WebP image up to 25MB. ${SIZE_NOTE} Download as JPG, PNG or WebP.`,
    seo: {
      title: "Blur Faces in Photos Online — Free Privacy Blur Tool | Toolkit4Me",
      metaDescription: "Blur faces, number plates and private text in photos and screenshots. Pixelate, blur or black out any area, privately in your browser — nothing is uploaded.",
      h1: "Face Blur & Privacy Editor",
      keywords: ["blur face in photo", "pixelate image online", "blur number plate", "censor screenshot", "hide text in image"],
    },
  },
  {
    ...base,
    id: "color-palette-extractor",
    slug: "color-palette-extractor",
    name: "Image Colour Palette Extractor",
    shortName: "Colour Palette",
    category: "photo",
    categoryLabel: "Photo Editing Lab",
    description: "Find the main colours in any image and copy them as hex codes, RGB values or CSS variables, or download a palette swatch.",
    actionLabel: "Extract colours",
    icon: "HEX",
    outputExtension: "png / CSS / hex",
    howItWorks: [
      "Choose an image — a photo, illustration, logo or screenshot.",
      "The main colours appear instantly, most common first, with roughly how much of the image each covers.",
      "Change the number of colours from 3 to 12.",
      "Copy a single colour, all hex codes or CSS variables, or download a palette image.",
    ],
    features: [
      "3–12 dominant colours, ordered by how much of the image they cover",
      "Hex and RGB values for each colour",
      "One-click copy of hex codes or ready-made CSS variables",
      "Downloadable PNG palette swatch",
    ],
    useCases: [
      "Building a website or slide colour scheme from a brand photo or logo",
      "Matching text and background colours to an image",
      "Saving the colours of an inspiring photo for a design project",
    ],
    limitations: [
      "The image is analysed at up to 600 pixels — plenty for dominant colours, but tiny details may not appear",
      "Colours are averages of similar pixels, so they can differ slightly from any single pixel",
      "Transparent pixels are ignored",
    ],
    faq: [
      {
        question: "How are the colours chosen?",
        answer: "The tool uses median cut: it repeatedly splits the image's colours into groups along the widest colour range, then averages each group. Groups are sorted by how many pixels they contain.",
      },
      {
        question: "Why doesn't a small detail's colour show up?",
        answer: "Dominant colours favour large areas. Increase the number of colours to bring out smaller accents.",
      },
      {
        question: "Can I use the colours in CSS?",
        answer: "Yes — Copy CSS gives you a :root block with one variable per colour, ready to paste into a stylesheet.",
      },
      {
        question: "Is my image uploaded?",
        answer: "No. The colours are calculated in your browser.",
      },
    ],
    relatedTools: ["photo-filters", "meta-tag-generator", "image-resizer", "compress-image"],
    intro: [
      "Every image has a handful of colours that define its mood. This tool finds them: choose an image and you'll see its main colours, most common first, with hex and RGB values and roughly how much of the picture each covers.",
      "Copy the colours as hex codes or CSS variables for a website or slide deck, or download a swatch image to share. The analysis runs in your browser — the image isn't uploaded.",
    ],
    formatsNote: "Open a JPG, PNG or WebP image up to 25MB; it's analysed at up to 600 pixels on the longest side. Results can be copied as hex, RGB or CSS, or downloaded as a PNG swatch.",
    seo: {
      title: "Colour Palette from Image — Free Hex Colour Extractor | Toolkit4Me",
      metaDescription: "Extract the main colours from any image and copy them as hex codes, RGB values or CSS variables, or download a palette swatch. Free, in your browser.",
      h1: "Image Colour Palette Extractor",
      keywords: ["color palette from image", "extract colors from image", "image color picker", "hex color extractor"],
    },
  },
  {
    ...base,
    id: "profile-picture-border",
    slug: "profile-picture-border",
    name: "Profile Picture Border Maker",
    shortName: "Profile Picture Border",
    category: "social",
    categoryLabel: "Social Creator Studio",
    description: "Turn any photo into a round profile picture with a gradient or solid ring, sized 512 or 1024 pixels with a transparent outside.",
    actionLabel: "Download profile picture",
    icon: "◎",
    outputExtension: "png / .webp",
    howItWorks: [
      "Choose a photo of yourself, your logo or your pet.",
      "Zoom and move the photo so your face sits in the middle of the circle.",
      "Pick a ring colour or gradient, its thickness and the white gap inside it.",
      "Download a 512 or 1024 pixel PNG and upload it as your profile picture.",
    ],
    features: [
      "Circular crop with zoom and position controls",
      "Gradient or solid-colour ring with five presets",
      "Adjustable ring thickness and inner white gap",
      "Square PNG or WebP with a transparent outside",
    ],
    useCases: [
      "Making a profile picture stand out on LinkedIn, WhatsApp, X, Instagram or Discord",
      "Matching team or event profile pictures with the same coloured ring",
      "Giving a logo a neat round avatar for social accounts",
    ],
    limitations: [
      "Most platforms crop pictures to a circle themselves — keep important parts away from the very edge",
      "The ring is a design, not an official platform badge (such as “Open to work”)",
      "Output is 512 or 1024 pixels square",
    ],
    faq: [
      {
        question: "What size should a profile picture be?",
        answer: "Most platforms accept 400 pixels or more and display it much smaller. 1024 × 1024 pixels gives a sharp result everywhere; choose 512 for a smaller file.",
      },
      {
        question: "Why are the corners transparent?",
        answer: "So the round picture blends into any background. Platforms that show square avatars will fill the corners with their own background colour.",
      },
      {
        question: "Can I use my company's colours?",
        answer: "Yes — choose Solid colour or Gradient and set the colours to match your brand.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No. The picture is created in your browser.",
      },
    ],
    relatedTools: ["image-border-frame", "photo-filters", "image-resizer", "transparent-background"],
    intro: [
      "A coloured ring makes a profile picture easy to spot in a busy feed or chat list. Choose a photo, zoom and position it in the circle, and pick a gradient or solid ring — the preview updates as you go.",
      "The result is a square PNG or WebP with a round picture and transparent corners, at 512 or 1024 pixels, ready for any social platform. Your photo stays in your browser.",
    ],
    formatsNote: "Open a JPG, PNG or WebP photo up to 25MB. Output is a square 512 × 512 or 1024 × 1024 PNG or WebP with transparent corners.",
    seo: {
      title: "Profile Picture Border Maker — Add a Ring to Your PFP | Toolkit4Me",
      metaDescription: "Make a round profile picture with a gradient or coloured ring for LinkedIn, Instagram, WhatsApp or Discord. Free 1024 px PNG, made privately in your browser.",
      h1: "Profile Picture Border Maker",
      keywords: ["profile picture border", "pfp ring", "circle profile picture maker", "linkedin profile picture frame"],
    },
  },
  {
    id: "fancy-text-generator",
    slug: "fancy-text-generator",
    hub: "pixel",
    addedOn: RELEASED,
    lastModified: RELEASED,
    name: "Fancy Text Generator",
    shortName: "Fancy Text",
    category: "social",
    categoryLabel: "Social Creator Studio",
    description: "Turn plain text into bold, italic, script, gothic, bubble, small-caps and upside-down styles you can copy into bios, posts and names.",
    acceptedFormats: ["Plain text"],
    acceptedMime: [],
    maxFileSize: 1,
    inputKind: "text",
    inputLimitLabel: "Up to 500 characters",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Copy",
    icon: "𝓐a",
    outputExtension: "text",
    howItWorks: [
      "Type or paste your text.",
      "See it in 17 styles at once — bold, script, gothic, double-struck, circled, upside down and more.",
      "Select Copy next to the style you like.",
      "Paste it into a bio, post, username or message.",
    ],
    features: [
      "17 styles generated as you type",
      "Uses real Unicode characters, so it works where fonts can't be changed",
      "One-click copy for each style",
      "Correct characters for the letters Unicode stores separately (such as script ℬ and italic ℎ)",
    ],
    useCases: [
      "Adding emphasis to an Instagram, TikTok or X bio",
      "Styling a heading in a post on platforms without bold or italic",
      "Making a gaming or Discord display name stand out",
    ],
    limitations: [
      "Only A–Z, a–z and (for some styles) 0–9 are styled; accented letters and other scripts stay as they are",
      "Screen readers may read styled letters one by one or skip them — keep important information in plain text",
      "Styled text may not be found by search, and some apps or older devices show boxes for unsupported characters",
      "Some platforms don't allow these characters in usernames",
    ],
    faq: [
      {
        question: "How does fancy text work without changing the font?",
        answer: "Unicode includes many look-alike letter sets — mathematical bold, script, Fraktur and more — originally for maths and technical writing. This tool swaps each letter for its look-alike, so the style travels with the text wherever you paste it.",
      },
      {
        question: "Why do some characters appear as boxes?",
        answer: "The device or app doesn't have a font containing that character. Modern phones and browsers support the common styles; very old devices may not.",
      },
      {
        question: "Is fancy text bad for accessibility?",
        answer: "It can be. Screen readers may announce styled letters as “mathematical bold capital A” or skip them. Use it for decoration, and keep names, links and key information in normal text.",
      },
      {
        question: "Is my text sent anywhere?",
        answer: "No — the styles are generated in your browser.",
      },
    ],
    relatedTools: ["word-counter", "profile-picture-border", "text-compare", "qr-code-generator"],
    intro: [
      "Most social apps don't let you change fonts, but Unicode contains whole alphabets of look-alike letters — bold, italic, script, gothic, double-struck, circled and more. Type your text and copy any of 17 styles straight into a bio, post or display name.",
      "Use them for flair rather than essentials: screen readers and search may not treat them as normal letters. The text is styled in your browser and isn't sent anywhere.",
    ],
    formatsNote: "Type or paste up to 500 characters. Output is Unicode text you copy and paste; letters A–Z, a–z and digits are styled.",
    seo: {
      title: "Fancy Text Generator — Bold, Script & Cool Fonts to Copy | Toolkit4Me",
      metaDescription: "Generate fancy text in 17 styles — bold, italic, script, gothic, bubble, small caps and upside down — and copy it into Instagram, TikTok or Discord.",
      h1: "Fancy Text Generator",
      keywords: ["fancy text generator", "cool fonts copy and paste", "bold text generator", "instagram fonts", "cursive text generator"],
    },
  },
];
