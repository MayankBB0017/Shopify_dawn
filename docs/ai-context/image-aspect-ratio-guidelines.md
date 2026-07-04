---
last_analyzed: 2026-07-04
source: Figma — Images & Videos - Aspect ratio & resolution recommendations (node 2:19971)
figma_file: https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19971
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Image & Video — Aspect Ratio & Resolution Guidelines

> **Use this doc during section development** when choosing `image_url` widths, CSS `aspect-ratio`, crop behavior, and merchant upload guidance. Source: Figma handover frame *Images - Aspect ratio & resolution recommendations*.

## Quick Reference — Content Categories

| Category | Aspect ratio | Resolution (target) | Format | Weight goal |
|----------|--------------|---------------------|--------|-------------|
| Hero / lifestyle / banners | Long edge **1920 px** (keep proportion) | 1920 × 1080 (16:9 desktop) · 1080 × 1920 (9:16 mobile) | WEBP | 700–900 KB |
| Product images (gallery, cards, grids) | **4:5** | **1536 × 1920 px** | WEBP | 700–900 KB |
| Product option / variant swatch images | **1:1** | **1200 × 1200 px** | WEBP | 700–900 KB |
| Product features (static grid) | **1:1** | **1920 × 1920 px** | WEBP | 700–900 KB |
| Interactive features (mobile) | **9:16** | **1080 × 1920 px** | WEBP | 700–900 KB |
| Interactive features (desktop) | **1:1** | **1920 × 1920 px** | WEBP | 700–900 KB |
| Technical product info (mobile) | **1:1** or flexible* | **1920 × 1920 px** | WEBP | 700–900 KB |
| Technical product info (desktop) | **3:2** or flexible* | **1920 × 1280 px** | WEBP | 700–900 KB |
| Image with text — full-bleed slider | **9:16** mobile · **16:9** desktop | 1080 × 1920 · 1920 × 1080 | WEBP | 700–900 KB |
| Image with text — split / store finder | **5:4** or flexible* | 1080 × 1536 mobile · 1920 × 1536 desktop | WEBP | 700–900 KB |
| Logos & graphic assets | Up to **800 px** width | — | PNG (transparency) · WEBP (otherwise) | 300–500 KB |
| Product videos | **16:9** desktop · **9:16** mobile | 1920 × 1080 · 1080 × 1920 | MP4 (H.264) | Under 10–15 MB |
| Home / banner videos | — | — | MP4 (H.264) | Under 10–15 MB |

\* *Flexible* = section/block adapts to image height; still prefer the listed ratio for visual consistency.

---

## General Recommendations

### Shopify platform

- Product and collection images display across Online Store and Shopify POS.
- Shopify accepts PNG, JPEG, PSD, TIFF, BMP, GIF, SVG, HEIC, and WebP. The image service delivers the best supported format per browser (WebP, AVIF when available).
- **Upload limits:** max **5000 × 5000 px** or **20 MB** per file; max **20 megapixels**.
- Files **above 2 MB** can hurt performance — treat 2 MB as a hard ceiling, not a target.

### Jane performance targets

| Target | Value |
|--------|-------|
| Ideal file weight | **500 KB – 1 MB** (context-dependent) |
| Maximum recommended weight | **2 MB** per image or video |
| DPI for export | **72 dpi** default; **100–150 dpi** only when quality drops noticeably |
| Large image long edge | **1920 px** (maintain aspect ratio) |
| Square product example | **1200 × 1200 px** is sufficient for many square use cases |
| Color profile | **sRGB** |

### Image formats (priority order)

1. **WEBP** — preferred upload format (best quality-to-weight ratio).
2. **JPEG/JPG** — second choice when WEBP export is unavailable.
3. **PNG** — only when transparency is required; keep within weight targets.

Other Shopify-supported formats: progressive JPEG, GIF, HEIC, AVIF. GIFs are auto-converted to animated WebP on delivery.

### Video formats

| Use case | Duration | Format | Weight goal |
|----------|----------|--------|-------------|
| Product videos | 10–30 seconds | MP4 · H.264 | Under 10–15 MB |
| Home / banner videos | 10–40 seconds | MP4 · H.264 | Under 10–15 MB |

Product videos repeat across navigation — keeping them in this range reduces total page weight without hurting UX.

### Automatic compression & delivery

- Shopify compresses images on delivery; **pre-compress before upload** when possible.
- Modern browsers receive WebP/AVIF automatically when supported.
- Do not rely on platform compression alone for performance budgets.

### Do not embed text in images

- Text in images breaks on responsive layouts and is invisible to search engines.
- Use HTML/Liquid text overlays and `alt` attributes instead (Google developer guidelines cited in Figma).

### Pre-upload checklist

Before uploading any asset to the store:

- [ ] Format matches content type (WEBP for photos, PNG only if transparency needed, MP4 H.264 for video)
- [ ] Resolution is within recommended range — not below minimum, not far above target
- [ ] File weight meets performance goal, not just Shopify's 20 MB cap
- [ ] Color profile is **sRGB**
- [ ] Aspect ratio matches other assets of the same type
- [ ] Autoplay videos have **audio removed**
- [ ] Separate **mobile asset** exists where Figma specifies dual breakpoints
- [ ] Filename is descriptive; avoid reserved suffixes: `pico`, `icon`, `thumb`, `small`, `medium`, `large`, `grande`

---

## Section-Specific Specs (from Figma)

### PDP — Product gallery

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 4:5 | 4:5 |
| Resolution | 1536 × 1920 px | 1536 × 1920 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB (approx.) | 700–900 KB (approx.) |

**Theme mapping:** `sections/main-product.liquid` · `snippets/product-media-gallery.liquid` · product media metafields.

---

### PDP — Product features (static carousel/grid)

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 1:1 | 1:1 |
| Resolution | 1920 × 1920 px | 1920 × 1920 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB (approx.) | 700–900 KB (approx.) |

**Theme mapping:** JANÉ — Product features section (planned).

---

### PDP — Video section

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 9:16 or other* | 16:9 or other* |
| Resolution | 1080 × 1920 px | 1920 × 1080 px |
| Format | mp4 | mp4 |
| Weight goal | Under 10–15 MB | Under 10–15 MB |

\* Section can adapt to video height.

**Theme mapping:** JANÉ — Video Section · Shopify-hosted video files in section settings.

---

### PDP — Product options (variant image swatches)

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 1:1 | 1:1 |
| Resolution | 1200 × 1200 px | 1200 × 1200 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB (approx.) | 700–900 KB (approx.) |

**Theme mapping:** `snippets/product-variant-picker.liquid` · variant images · JANÉ — Product options section.

---

### PDP — Technical product info

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 1:1 or other* | 3:2 or other* |
| Resolution | 1920 × 1920 px | 1920 × 1280 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB | 700–900 KB |

\* Block adapts to image height.

**Theme mapping:** JANÉ — Technical product info section · diagram/measurement images.

---

### HOME — Hero banner

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 9:16 or other* | 16:9 or other* |
| Resolution | 1080 × 1920 px | 1920 × 1080 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB | 700–900 KB |

\* Section can adapt to video/image height. Support separate mobile and desktop image/video uploads (per Hero banner Figma spec).

**Theme mapping:** JANÉ — Hero banner section · `templates/index.json`.

---

### HOME — Interactive features section

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | **9:16** | **1:1** |
| Resolution | 1080 × 1920 px | 1920 × 1920 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB (approx.) | 700–900 KB (approx.) |

**Theme mapping:** JANÉ — Interactive features section.

---

### HOME / PDP — Image with text (full-width slider)

Used for layouts like *Es para ti si...* with full-bleed background slides.

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 9:16 or other* | 16:9 or other* |
| Resolution | 1080 × 1920 px | 1920 × 1080 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB | 700–900 KB |

\* Section adapts to image height.

**Theme mapping:** JANÉ — Image with text section (slider variant).

---

### HOME — Image with text (split / store finder)

Used for *Encuentra tu tienda* style split layouts.

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 5:4 or other* | 5:4 or other* |
| Resolution | 1080 × 1536 px | 1920 × 1536 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB | 700–900 KB |

\* Section adapts to image height.

**Theme mapping:** JANÉ — Image with text section (split variant).

---

### Product gallery (cards) — collection grids & carousels

Same spec as PDP product gallery — used in *También te puede gustar* and `card-product` contexts.

| | Mobile | Desktop |
|---|--------|---------|
| Aspect ratio | 4:5 | 4:5 |
| Resolution | 1536 × 1920 px | 1536 × 1920 px |
| Format | WEBP | WEBP |
| Weight goal | 700–900 KB (approx.) | 700–900 KB (approx.) |

**Theme mapping:** `snippets/card-product.liquid` · featured collection · recommender · related products.

---

## Sections Without Dedicated Specs in Figma

The following JANÉ sections are not individually documented in the aspect-ratio frame. Until section-specific specs are added, use the closest category above:

| Section | Recommended category |
|---------|---------------------|
| JANÉ — Blocks Banner | Hero / lifestyle (1920 px long edge, 700–900 KB WEBP) |
| JANÉ — Recommender | Product gallery cards (4:5 · 1536 × 1920) |
| JANÉ — Highlighted Product | Product gallery (4:5) or hero for full-bleed promo |
| JANÉ — Shop the look | Hero / lifestyle or 4:5 product overlays |
| JANÉ — Blog section | 16:9 or 5:4 editorial — align with blog card design |
| JANÉ — Instagram grid | 1:1 (typical social grid) |
| JANÉ — Multicolumn | Per-column: 1:1 or 4:5 depending on block design |
| JANÉ — Collection banners | Hero / lifestyle |
| JANÉ — Product benefits | Icons: logos & graphics (800 px · PNG/WEBP) · photos: 4:5 or 1:1 |
| JANÉ — FAQS Section | Text-only or minimal imagery — no image spec required |

Confirm with design when implementing these sections if Figma is updated.

---

## Theme Implementation Reference

Use these patterns in Liquid/CSS to match Figma ratios. Values come from the specs above — verify in Theme Editor after implementation.

### CSS `aspect-ratio` values

```css
/* Product card / gallery — 4:5 portrait */
.aspect-product { aspect-ratio: 4 / 5; }

/* Hero / video — desktop */
.aspect-hero-desktop { aspect-ratio: 16 / 9; }

/* Hero / video — mobile */
.aspect-hero-mobile { aspect-ratio: 9 / 16; }

/* Variant swatch / square feature */
.aspect-square { aspect-ratio: 1 / 1; }

/* Image with text — split layout */
.aspect-split { aspect-ratio: 5 / 4; }

/* Technical info — desktop diagram */
.aspect-tech-desktop { aspect-ratio: 3 / 2; }
```

Apply with `object-fit: cover` on `<img>` unless the design requires `contain` (e.g. technical diagrams).

### Liquid `image_url` width hints

Pass widths close to delivery size — Shopify generates responsive srcset automatically.

| Context | Suggested `image_url` width param |
|---------|-----------------------------------|
| Product card (desktop) | `width: 750` (grid) · `width: 1536` (zoom source) |
| Product card (mobile) | `width: 450` |
| Hero desktop | `width: 1920` |
| Hero mobile | `width: 1080` |
| Variant swatch | `width: 120` (display) · upload at 1200 |
| Logo | `width: 800` max |

Example:

```liquid
{{ image | image_url: width: 1536 | image_tag:
  loading: 'lazy',
  widths: '375, 550, 750, 1100, 1536',
  sizes: '(min-width: 750px) 25vw, 50vw'
}}
```

### Dual mobile/desktop media

Hero banner and several sections require **independent mobile and desktop** image or video settings in schema:

- `image` + `image_mobile` (or `video` + `video_mobile`)
- Render mobile asset below Dawn's `750px` breakpoint unless section schema defines otherwise
- Use `{% render %}` with explicit params; lazy-load non-LCP images

### Product media note

Figma product atoms are labeled `5:4` in component names but the **documented spec is 4:5 portrait** (1536 × 1920). Implement **4:5** for product imagery unless design confirms otherwise.

---

## External Resources

| Resource | URL |
|----------|-----|
| Aspect ratio calculator (Figma link) | [calculateaspectratio.com](https://calculateaspectratio.com/) |
| Shopify theme images docs | [help.shopify.com — Theme images](https://help.shopify.com/es/manual/online-store/images/theme-images) |
| Figma source frame | [JANE — COPY · node 2:19971](https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19971) |

---

## Related Project Docs

- [performance-optimization.md](./performance-optimization.md) — lazy loading, Core Web Vitals, frontend budgets
- [css-guidelines.md](./css-guidelines.md) — responsive breakpoints, component CSS
- [liquid-guidelines.md](./liquid-guidelines.md) — `image_url` / `image_tag` rules
- [project-patterns.md](./project-patterns.md) — `card-product`, media gallery snippets
