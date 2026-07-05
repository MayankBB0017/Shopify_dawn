---
last_analyzed: 2026-07-04
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/jane-blocks-banner.liquid
---

# JANÉ Blocks Banner — Implementation Reference

> **Purpose:** Document what is **built and shipped** in this theme for the JANÉ Blocks Banner section. Use this when maintaining, debugging, or extending the section.
>
> **Original build brief:** [jane-blocks-banner.md](../ai-agent-prompts/jane-blocks-banner.md) (agent prompt — design spec and Figma targets)

---

## Summary

Responsive category / typology card grid for home and landing pages. Merchants add **card blocks** (image, title, link, optional hover content). Layout is chosen **automatically** from block count — no manual layout mode toggle.

- **1–4 cards:** horizontal **strip** variant (equal-width columns; mobile horizontal scroll when enabled)
- **5+ cards:** **grid** variant (extended layouts: 2+4 or 3+3)
- **Desktop hover** (optional): blur overlay + description + button; static title on page load
- **Mobile:** title only (no description, no button, no hover layer)
- Custom `<jane-blocks-banner>` web component handles scroll fade-in via `IntersectionObserver`

**Does not extend** Dawn `multicolumn.liquid` or `collection-list.liquid`.

---

## File map

| File | Role |
|------|------|
| `sections/jane-blocks-banner.liquid` | Section markup, auto-layout logic, schema, preset |
| `snippets/jane-blocks-banner-card.liquid` | Single card: media, overlays, static title, hover content |
| `assets/section-jane-blocks-banner.css` | Layouts, placement, hover, spacing, fade, padding |
| `assets/jane-blocks-banner.js` | `<jane-blocks-banner>` custom element (fade-in) |
| `assets/component-slider.css` | Mobile horizontal scroll (Dawn `slider-component`) |
| `assets/component-buttons.css` | Button / link CTA styles (shared with hero) |
| `locales/en.default.json` | `sections.jane_blocks_banner.*` customer strings |
| `locales/en.default.schema.json` | Schema `t:` labels |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [button-guidelines.md](./button-guidelines.md) | CTA variants and hover |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | Card image upload specs |
| [typography-guidelines.md](./typography-guidelines.md) | Title size classes |
| [javascript-guidelines.md](./javascript-guidelines.md) | Web component patterns |
| [liquid-guidelines.md](./liquid-guidelines.md) | Schema and `{% render %}` rules |

---

## Auto layout

Layout is derived from **card block count** (type `card` only):

| Cards | `auto_layout` class | Variant | Desktop behaviour |
|-------|---------------------|---------|-------------------|
| 1 | `layout-1` | strip | Full-width single card |
| 2 | `layout-2` | strip | Two equal columns (4:5 aspect) |
| 3 | `layout-3` | strip | Three equal columns (4:5 aspect) |
| 4 | `layout-4` | strip | Four equal columns (4:5 aspect) |
| 5+ | `layout-2-plus-4` or `layout-3-plus-3` | grid | Extended grid (see below) |

### Extended grid (5+ cards)

Controlled by section setting `extended_layout`:

| Value | Desktop grid | Block size mapping |
|-------|--------------|-------------------|
| `2_plus_4` (default) | Row 1: 2 large (50% each) · Row 2: remaining small (25% each) | Blocks 1–2 → large; blocks 3+ → small |
| `3_plus_3` | 3-column uniform grid | All blocks equal |

Mobile (grid variant): always **2-column** uniform grid.

### Mobile slider (strip, 2–4 cards)

When `enable_mobile_slider` is on and card count is 2–4, cards render inside Dawn `slider-component` with `grid--peek` for horizontal swipe. Disabled for 1 card, 5+ grid, or when setting is off.

---

## DOM structure

```
<section class="shopify-section section">
  <jane-blocks-banner id="JaneBlocksBanner-{id}" class="jane-blocks-banner …">
    [optional .jane-blocks-banner__header + heading]
    <slider-component> or <div class="jane-blocks-banner__grid-wrapper">
      <ul class="jane-blocks-banner__grid jane-blocks-banner__grid--{layout}">
        <li class="jane-blocks-banner__item">          ← card block
          <a class="jane-blocks-banner__card" href="…">
            <div class="jane-blocks-banner__media">    ← images / placeholder
            <span class="jane-blocks-banner__overlay"> ← optional per-card
            <span class="jane-blocks-banner__gradient"> ← strip or typology variant
            <span class="jane-blocks-banner__hover-blur"> ← desktop hover only
            <div class="jane-blocks-banner__content--static">  ← page-load title
            <div class="jane-blocks-banner__content--interactive"> ← hover layer
          </a>
        </li>
      </ul>
    </slider-component or grid-wrapper>
  </jane-blocks-banner>
</section>
```

Each card is a **single `<a>`** wrapping the full card. CTA and static title use `aria-hidden="true"`; the link `aria-label` combines title + “View category”.

---

## Content layers

Two content layers per card (when hover is enabled):

| Layer | Class | When visible | Contents |
|-------|-------|--------------|----------|
| **Static** | `.jane-blocks-banner__content--static` | Always (desktop + mobile) | Title only — the “page load” title |
| **Interactive** | `.jane-blocks-banner__content--interactive` | Desktop hover / focus only | Title (duplicate) + description + button |

### Desktop (≥ 750px, hover capable)

1. Static title visible on load at **title position (desktop)**
2. On `:hover` / `:focus-within`: static title fades out; blur overlay appears; interactive layer fades in with description + button at **hover content position (desktop)**

### Mobile (< 750px)

- Static title only at **title position (mobile)**
- Interactive layer hidden (`display: none`)
- No description or button on storefront

### Hover disabled (`enable_hover_effect` = false)

- Section gets class `jane-blocks-banner--hover-disabled`
- No blur, no interactive layer markup, no hover CMS fields in Theme Editor
- Static title remains on all breakpoints
- Existing sections without the setting saved default to **hover enabled** (Liquid treats unset as true)

---

## Section settings

| Setting ID | Type | Default | Notes |
|------------|------|---------|-------|
| `extended_layout` | select | `2_plus_4` | `2_plus_4` \| `3_plus_3` — used when 5+ cards |
| `enable_block_spacing` | checkbox | false | Gap between cards; enables border radius |
| `block_border_radius` | range 0–24px | 8 | `visible_if` spacing enabled |
| `container_width` | select | `standard` | `standard` (`.page-width`) \| `full_width` |
| `overlay_color` | color | `#000000` | RGB passed as `--jbb-overlay-rgb`; per-card opacity on block |
| `heading` | inline_richtext | — | Optional section heading (typology) |
| `heading_size` | select | `h2` | `h2` \| `h1` \| `h0` |
| `card_height_desktop` | select | `adapt` | `adapt` \| `large_659` \| `medium_418` |
| `card_height_mobile` | select | `adapt` | `adapt` \| `medium_418` \| `small_250` |
| `enable_hover_effect` | checkbox | **true** | Master toggle for hover + description + button CMS |
| `enable_mobile_slider` | checkbox | true | Horizontal scroll for 2–4 strip cards on mobile |
| `enable_fade_in_desktop` | checkbox | true | Scroll fade-in on desktop |
| `enable_fade_in_mobile` | checkbox | true | Scroll fade-in on mobile |
| `padding_top_desktop` | range 0–100 | 0 | Section padding via CSS variables |
| `padding_bottom_desktop` | range 0–100 | 24 | |
| `padding_top_mobile` | range 0–100 | 0 | |
| `padding_bottom_mobile` | range 0–100 | 24 | |
| `color_scheme` | color_scheme | `scheme-1` | Dawn color scheme |
| `accessibility_label` | text | — | Optional `aria-label` on host element |

### Host CSS modifier classes

| Class | When |
|-------|------|
| `jane-blocks-banner--layout-{1\|2\|3\|4\|2-plus-4\|3-plus-3}` | Auto layout |
| `jane-blocks-banner--variant-{strip\|grid}` | 1–4 vs 5+ cards |
| `jane-blocks-banner--container-{standard\|full}` | Container width |
| `jane-blocks-banner--spaced` | Block spacing enabled |
| `jane-blocks-banner--hover-disabled` | Hover effect off |
| `jane-blocks-banner--fade-in-desktop` / `--fade-in-mobile` | Fade toggles |
| `jane-blocks-banner--fade-visible` | JS / Theme Editor / reduced motion |

### CSS custom properties (host)

Set in Liquid on `#JaneBlocksBanner-{id}` / inline `style`:

| Variable | Source |
|----------|--------|
| `--jbb-padding-top-mobile` / `--jbb-padding-bottom-mobile` | Section padding (mobile) |
| `--jbb-padding-top-desktop` / `--jbb-padding-bottom-desktop` | Section padding (desktop) |
| `--jbb-card-height-desktop` / `--jbb-card-height-mobile` | Card height settings |
| `--jbb-card-radius` | Border radius when spacing on |
| `--jbb-overlay-rgb` | Section overlay color |
| `--jbb-stagger-index` | Per-card stagger (on `<li>`) |
| `--jbb-stagger-step` | `0.15s` (CSS default) |

**Padding note:** `jane-blocks-banner { display: block; }` is required — custom elements default to inline, which breaks vertical padding from CMS.

---

## Card block settings

Block type: `card` · max blocks: **12** · `{{ block.shopify_attributes }}` on `<li>`

### Always visible

| Setting ID | Type | Notes |
|------------|------|-------|
| `image` | image_picker | Desktop image |
| `image_mobile` | image_picker | Optional; falls back to desktop |
| `title` | text | Card title + image alt |
| `link` | url | Whole-card link target |
| `title_position_desktop` | select | 9-position grid + `auto` — **static title** on desktop |
| `title_position_mobile` | select | 9-position grid + `auto` — **static title** on mobile |
| `title_style` | select | `h2` \| `h3` \| `typology` |
| `text_alignment_desktop` | select | `left` \| `center` \| `right` |
| `text_alignment_mobile` | select | `left` \| `center` \| `right` |
| `enable_overlay` | checkbox | Per-card color overlay |
| `overlay_opacity` | range 0–100 | `visible_if` overlay enabled |
| `enable_gradient` | checkbox | Strip or typology gradient variant |

### Visible when `enable_hover_effect` is true

| Setting ID | Type | Notes |
|------------|------|-------|
| `description` | richtext | Shown on desktop hover only |
| `content_position_desktop` | select | Hover content placement; `auto` inherits title position |
| `button_label` | text | Default “Ver detalles” |
| `button_type` | select | Same types as hero (`none`, filled, stroke, link, customize) |
| `link_size` | select | 14 \| 16 — link types only |
| `button_text_color` / `button_border_color` / `button_bg_color` | color | When `button_type` = `customize` |

### Auto position defaults (`auto`)

| Layout | Desktop title | Mobile title |
|--------|---------------|--------------|
| strip (1–4) | top-left | top-left |
| grid (5+) | bottom-left | bottom-center |

---

## Button visibility rules

The storefront button renders **only when all** of the following are true:

1. Section `enable_hover_effect` is not explicitly `false`
2. Block `title` is not blank
3. Block `link` is not blank
4. Block `button_label` is not blank (default translation counts)
5. Block `button_type` is not `none`

Button styles reuse hero patterns via `component-buttons.css` and `jane-hero__link` classes.

---

## Positioning & alignment

### 9-position grid

`top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`

- **Static title:** `.jane-blocks-banner__content--desktop-{position}` / `--mobile-{position}` on static wrapper
- **Hover content:** `.jane-blocks-banner__content--desktop-{position}` on interactive wrapper (desktop only)

### Text alignment

Classes: `.jane-blocks-banner__text--align-desktop-{alignment}`, `.jane-blocks-banner__text--align-mobile-{alignment}`

Static title alignment uses `.jane-blocks-banner__title-static` rules per breakpoint.

---

## Hover effect

| Property | Value |
|----------|-------|
| Blur overlay | `backdrop-filter: blur(15px)` + `rgba(128, 128, 128, 0.5)` |
| Trigger | `@media (hover: hover)` — `:hover` and `:focus-visible` on card |
| Transition | 550ms ease out on blur; 600ms ease on content `translateY` |

When hover is disabled, all hover swap rules are scoped with `:not(.jane-blocks-banner--hover-disabled)`.

---

## Animations

### Scroll fade-in (`assets/jane-blocks-banner.js`)

| Feature | Behaviour |
|---------|-----------|
| Element | `<jane-blocks-banner>` custom element |
| Trigger | `IntersectionObserver` threshold `0.12` → adds `jane-blocks-banner--fade-visible` |
| Desktop | Whole card fades (`opacity` + `translateY(2rem)`); stagger via `--jbb-stagger-index` |
| Mobile | Card fade + static title secondary fade (0.15s extra delay) |
| Reduced motion | `--fade-visible` applied immediately on connect |
| Theme Editor / Add section preview | `Shopify.designMode` → `playFadeIn()` replays staggered card fade (100ms delay + double rAF) |
| Theme Editor updates | `shopify:section:load` / `shopify:section:select` → `refreshAfterUpdate()` |

---

## Media & images

Per card in `snippets/jane-blocks-banner-card.liquid`:

| Context | `image_url` width | Notes |
|---------|-------------------|-------|
| Strip desktop | 960 | |
| Strip mobile | 574 | |
| Grid large desktop | 1400 | Blocks 1–2 in 2+4 layout |
| Grid small desktop | 700 | Blocks 3+ in 2+4 layout |
| Grid mobile | 340 | |

- `loading="eager"` for first 2 cards; `lazy` for rest
- Empty image: `hero-apparel-1` placeholder SVG
- Separate `image_mobile` for art direction (falls back to desktop)

### Gradients

| Variant | Desktop | Mobile |
|---------|---------|--------|
| strip | Bottom 180px gradient | Top 145px gradient |
| grid (typology) | Full-card bottom gradient | Same |

---

## Spacing & container

| Setting | Effect |
|---------|--------|
| `enable_block_spacing` | `gap: 0.8rem` desktop / `0.4rem` mobile on grid |
| `block_border_radius` | `--jbb-card-radius` on `.jane-blocks-banner__card` |
| `container_width: full_width` | Removes `.page-width`; uses `width: 100%` (not `100vw` — avoids horizontal scroll) |

---

## Accessibility

- Entire card is one focusable link
- `aria-label`: `{title} — View category` (or “View category” if no title)
- Disabled link (`role="link" aria-disabled="true"`) when URL blank
- Decorative overlays, blur, static title, and CTA marked `aria-hidden="true"`
- Focus ring on `.jane-blocks-banner__card:focus-visible`

---

## Preset

**JANÉ Blocks Banner** ships with **6 card blocks** (typology grid):

- Spacing on, radius 8px
- Padding: 48px desktop / 64px mobile (top + bottom)
- Sample Spanish titles and descriptions (Carritos, Novedades, Sillas de coche, etc.)
- Button type: `link_white`

---

## Schema constraints

- **`visible_if` does not support parentheses.** Combine conditions with repeated `and` / `or` instead.
  - ✅ `section.settings.enable_hover_effect and block.settings.button_type == 'link_white' or section.settings.enable_hover_effect and block.settings.button_type == 'link_black'`
  - ❌ `(block.settings.button_type == 'link_white' or …)`
- Block settings may reference `section.settings` in `visible_if` (e.g. hover toggle, spacing → radius).
- Do **not** edit `config/settings_data.json` unless explicitly requested.

---

## Maintenance checklist

- [ ] Desktop: static title on load; hover reveals description + button
- [ ] Mobile: title only; no button when title or link missing
- [ ] Hover off: no interactive layer; CMS hides description/button fields
- [ ] Padding sliders affect section top/bottom space
- [ ] 1 / 2 / 3 / 4 / 6 card counts produce expected layouts
- [ ] Full-width container does not cause page horizontal scroll
- [ ] `shopify theme check` on changed files before merge

---

## Changelog (implementation)

| Date | Change |
|------|--------|
| 2026-07-04 | Initial section: auto layout, strip + grid, hover layers, fade-in, spacing, container width |
| 2026-07-04 | Separate title position desktop/mobile for static title; mobile hides description/button |
| 2026-07-04 | Section padding via CSS variables + `display: block` on custom element |
| 2026-07-04 | `enable_hover_effect` section toggle; button requires title + link; conditional CMS fields |
