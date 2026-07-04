---
last_analyzed: 2026-07-04
source: Figma — Typography frame (node 2:19873)
figma_file: https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19873
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Typography Guidelines

> **Use this doc during section and component development** when applying text styles. Design targets come from Figma; implementation uses Dawn's **dynamic** typography system (font pickers + scale sliders). Values below are at **100% body scale** and **100% heading scale**.

## Dawn Dynamic Typography

Merchants control typography in **Theme Settings → Typography**:

| Setting | Schema ID | Range | CSS output |
|---------|-----------|-------|------------|
| Heading font | `type_header_font` | font_picker | `--font-heading-family`, weight, style |
| Heading scale | `heading_scale` | 100–150% | `--font-heading-scale` |
| Body font | `type_body_font` | font_picker | `--font-body-family`, weight, style |
| Body scale | `body_scale` | 100–130% | `--font-body-scale` |

**How scaling works** ([`layout/theme.liquid`](../../layout/theme.liquid)):

```liquid
--font-body-scale: {{ settings.body_scale | divided_by: 100.0 }};
--font-heading-scale: {{ settings.heading_scale | times: 1.0 | divided_by: settings.body_scale }};
html { font-size: calc(var(--font-body-scale) * 62.5%); }
```

- **Headings** (`.h1`–`.h4`): `calc(var(--font-heading-scale) * Xrem)` — scales with heading slider.
- **Body / caption / product name**: base `rem` values — scale via `html` root when body slider changes.
- **Accent font** (product description): `--font-accent-family` → currently aliases `--font-heading-family` until Playfair picker is added.

**Do not** hardcode fixed px font sizes or bypass scale variables in new code.

---

## Figma Design Targets (100% scale)

### Font roles

| Role | Design font | Current theme mapping |
|------|-------------|---------------------|
| Titles (H1–H4) | Instrument Sans | `type_header_font` → `--font-heading-family` |
| Body, buttons, links, product name | Instrument Sans | `type_body_font` → `--font-body-family` |
| Product description | Playfair Display | `--font-accent-family` (heading font placeholder) |

### Title scale

| Style | Breakpoint | Weight | Size | Line height |
|-------|------------|--------|------|-------------|
| H1 | Mobile | Regular (400) | 32px (3.2rem) | 36px (3.6rem) |
| H1 | Desktop (≥750px) | Regular (400) | 54px (5.4rem) | 61px (6.1rem) |
| H2 | Mobile | Regular (400) | 27px (2.7rem) | 30px (3rem) |
| H2 | Desktop | Regular (400) | 32px (3.2rem) | 36px (3.6rem) |
| H3 | Both | Medium (500) | 18px (1.8rem) | 22px (2.2rem) |
| H4 | Both | Medium (500) | 16px (1.6rem) | 20px (2rem) |

### Product name (body font, bold)

| Breakpoint | Weight | Size | Line height |
|------------|--------|------|-------------|
| Mobile | Bold | 16px (1.6rem) | 20px (2rem) |
| Desktop | Bold | 20px (2rem) | 24px (2.4rem) |

### Body scale

| Style | Weight | Size | Line height |
|-------|--------|------|-------------|
| Body L | 400 / 500 | 16px (1.6rem) | 20px (2rem) |
| Body M | 400 / 500 | 14px (1.4rem) | 17px (1.7rem) |
| Body S | 400 / 500 | 12px (1.2rem) | 15px (1.5rem) |

### Product description (accent font)

| Breakpoint | Size | Line height |
|------------|------|-------------|
| Mobile | 14px (1.4rem) | 18px (1.8rem) |
| Desktop | 16px (1.6rem) | 20px (2rem) |

### UI text (typography only)

| Style | Weight | Size | Line height | Notes |
|-------|--------|------|-------------|-------|
| Button | Medium (500) | 14px (1.4rem) | 16px (1.6rem) | Uppercase |
| Link L | Regular (400) | 16px (1.6rem) | 20px (2rem) | Underlined |
| Link S | Regular (400) | 14px (1.4rem) | 18px (1.8rem) | Underlined |

**Hero banner note:** Future Jane sections will expose title size (H1, H2, …) and body size (Body L/M/S) pickers — use existing `.h1`–`.h4` and body utility classes.

**Tags:** No separate Figma tag style — use Body S/M (`.caption`, `.caption-large`).

---

## Class & Selector Mapping

| Figma style | Dawn class / selector | File |
|-------------|----------------------|------|
| H1–H4 | `.h1`–`.h4`, `h1`–`h4` | `assets/base.css` |
| Body L | `body`, `.text-body` | `layout/theme.liquid`, `assets/base.css` |
| Body L Medium | `.text-body--medium` | `assets/base.css` |
| Body M | `.caption-large`, `.link` | `assets/base.css` |
| Body S | `.caption`, `.caption-with-letter-spacing` | `assets/base.css` |
| Body S/M Medium | `.caption--medium` | `assets/base.css` |
| Product name | `.product__title h1`, `.card__heading` | `section-main-product.css`, `component-card.css` |
| Product description | `.product__info-container .product__description` | `section-main-product.css` |
| Button text | `.button`, `.button-label` | `assets/base.css` |
| Link L | `.link--large` | `assets/base.css` |
| Link S | `.link` | `assets/base.css` |

**Legacy headings unchanged:** `.h0`, `.hxl`, `.hxxl`, `.h5` — used by existing Dawn sections until Jane Hero replaces them.

---

## Default CSS Variables (Figma @ 100% scale)

**Source of truth:** [`layout/theme.liquid`](../../layout/theme.liquid) `:root` block. Mobile-first values; desktop overrides at `min-width: 750px` for H1, H2, product title, and product description.

| Variable | Mobile (px @ 100%) | Desktop (px @ 100%) |
|----------|-------------------|---------------------|
| `--font-size-h1` / `--font-line-height-h1` | 32 / 36 | 54 / 61 |
| `--font-size-h2` / `--font-line-height-h2` | 27 / 30 | 32 / 36 |
| `--font-size-h3` / `--font-line-height-h3` | 18 / 22 | same |
| `--font-weight-h3` | 500 | same |
| `--font-size-h4` / `--font-line-height-h4` | 16 / 20 | same |
| `--font-weight-h4` | 500 | same |
| `--font-size-body` / `--font-line-height-body` | 16 / 20 | same |
| `--font-size-body-medium` / `--font-line-height-body-medium` | 14 / 17 | same |
| `--font-size-body-small` / `--font-line-height-body-small` | 12 / 15 | same |
| `--font-size-product-title` / `--font-line-height-product-title` | 16 / 20 | 20 / 24 |
| `--font-size-product-description` / `--font-line-height-product-description` | 14 / 18 | 16 / 20 |
| `--font-size-button` / `--font-line-height-button` | 14 / 16 | same |
| `--font-weight-button` | 500 | same |
| `--font-size-link` / `--font-line-height-link` | 14 / 18 | same |
| `--font-size-link-large` / `--font-line-height-link-large` | 16 / 20 | same |

Headings consume variables with scale: `calc(var(--font-heading-scale) * var(--font-size-h1))`. Body, caption, product, link, and button sizes use variables directly (scaled via `html` root `body_scale`).

Stylesheets referencing these variables: [`assets/base.css`](../../assets/base.css), [`assets/section-main-product.css`](../../assets/section-main-product.css), [`assets/component-card.css`](../../assets/component-card.css).

---

## Section & Component Coverage

Typography variables are consumed in:

| Area | File |
|------|------|
| Global utilities | `assets/base.css` |
| Product page | `assets/section-main-product.css` |
| Product cards | `assets/component-card.css` |
| Footer | `assets/section-footer.css` |
| Password page | `assets/section-password.css` |
| Blog article | `assets/section-blog-post.css` |
| Collection hero | `assets/component-collection-hero.css` |
| Menu drawer | `assets/component-menu-drawer.css` |
| Cart notification | `assets/component-cart-notification.css` |
| Prices | `assets/component-price.css` |

**Still using legacy Dawn sizes:** `.h0`, `.hxl`, `.hxxl`, `.h5` (intentional for oversized heroes). Some form/facet micro-labels in `component-facets.css` and similar may still use hardcoded rem — update when those surfaces are redesigned.

**Featured product section:** `h2.product__title` (with optional `.h1` heading class) uses product-name typography via `section-main-product.css` selectors.

---

## Base Rem Multipliers (at 100% scale)

Implemented via CSS variables above and consumed in [`assets/base.css`](../../assets/base.css). Headings use `calc(var(--font-heading-scale) * var(--font-size-hN))`.

| Element | Mobile base | Desktop base (≥750px) |
|---------|-------------|----------------------|
| `.h1` | 3.2rem / LH 3.6rem | 5.4rem / LH 6.1rem |
| `.h2` | 2.7rem / LH 3rem | 3.2rem / LH 3.6rem |
| `.h3` | 1.8rem / LH 2.2rem, weight 500 | same |
| `.h4` | 1.6rem / LH 2rem, weight 500 | same |
| `body` | 1.6rem / LH 2rem | 1.6rem / LH 2rem |
| `.caption` | 1.2rem / LH 1.5rem | same |
| `.caption-large` | 1.4rem / LH 1.7rem | same |
| `.link` | 1.4rem / LH 1.8rem | same |
| `.link--large` | 1.6rem / LH 2rem | same |
| `.button` | 1.4rem / LH 1.6rem, weight 500, uppercase | same |

Product name and description use `--font-size-product-*` variables in [`assets/section-main-product.css`](../../assets/section-main-product.css) and [`assets/component-card.css`](../../assets/component-card.css).

---

## Section Integration

When building Jane sections with Theme Editor size pickers:

| Merchant picker value | Apply class |
|----------------------|-------------|
| H1 | `h1` or `.h1` |
| H2 | `h2` or `.h2` |
| H3 | `h3` or `.h3` |
| Body L | `.text-body` or default RTE |
| Body M | `.caption-large` |
| Body S | `.caption` |

Use `sections.all.heading_size` schema pattern (existing Dawn) — values `h1`, `h2`, `h0`, etc. map directly to CSS classes.

---

## Future Font Swap

When brand fonts are provided:

1. Merchant selects **Instrument Sans** in `type_header_font` and `type_body_font`.
2. Add `type_accent_font` font_picker in `config/settings_schema.json` for **Playfair Display**.
3. Wire in `theme.liquid`:

```liquid
--font-accent-family: {{ settings.type_accent_font.family }}, {{ settings.type_accent_font.fallback_families }};
{{ settings.type_accent_font | font_face: font_display: 'swap' }}
```

4. No CSS multiplier changes required.

**Medium weight (500):** H3, H4, and buttons use `font-weight: 500`. Ensure the selected body/header font family includes a medium variant, or use `font_modify: 'weight', '500'` + `font_face` in `theme.liquid` when Instrument Sans is configured.

---

## Verification Checklist

- [ ] At 100%/100% scale, compare mobile (375px) and desktop (1280px) against Figma spec
- [ ] Increase `heading_scale` to 120% — headings grow proportionally
- [ ] Increase `body_scale` to 110% — body, captions, product titles grow proportionally
- [ ] Change body font in Theme Editor — product titles and body text update
- [ ] PDP: product title uses body bold; description uses accent family
- [ ] Collection grid: card headings match product name spec
- [ ] Run `shopify theme check` before completing typography-related PRs

---

## Related Docs

- [css-guidelines.md](./css-guidelines.md) — CSS organization
- [theme-architecture.md](./theme-architecture.md) — layout and asset loading
- [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) — companion Figma handover doc
