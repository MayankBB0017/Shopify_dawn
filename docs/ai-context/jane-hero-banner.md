---
last_analyzed: 2026-07-04
figma_file: https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19954
figma_node: "2:19954"
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/jane-hero-banner.liquid
---

# JANÉ Hero Banner — Implementation Reference

> **Purpose:** Document what is **built and shipped** in this theme for the JANÉ Hero banner section. Use this when maintaining, debugging, or extending the hero.
>
> **Original build brief:** [jane-hero-banner.md](../ai-agent-prompts/jane-hero-banner.md) (agent prompt — unchanged)

**Figma:** [Hero banner frame (2:19954)](https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19954)

---

## Summary

Multi-slide carousel hero for home/landing pages and PDP. Up to **5 slide blocks**, each with one of three layout modes. Custom `<jane-hero-banner>` web component handles carousel, fade animations, drag/swipe, and optional transparent header overlay.

**Does not extend** Dawn `image-banner.liquid` or `slideshow.liquid`.

---

## File map

| File | Role |
|------|------|
| `sections/jane-hero-banner.liquid` | Section markup, schema, preset, content-source guards |
| `assets/section-jane-hero-banner.css` | Layout, heights, positioning, bullets, fade, transparent header |
| `assets/jane-hero-banner.js` | `<jane-hero-banner>` custom element |
| `snippets/jane-hero-slide.liquid` | Slide layouts + whole-slide link logic |
| `snippets/jane-hero-media.liquid` | Desktop/mobile image or video + overlays |
| `snippets/jane-hero-content.liquid` | Title, description, buttons, position classes |
| `snippets/jane-hero-button.liquid` | Button type → Jane button classes |
| `assets/theme-editor.js` | Block select → scroll carousel to slide |
| `locales/en.default.json` | `sections.jane_hero_banner.*` customer strings |
| `locales/en.default.schema.json` | Schema `t:` labels |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [typography-guidelines.md](./typography-guidelines.md) | Title/body size classes |
| [button-guidelines.md](./button-guidelines.md) | CTA variants and hover |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | Hero media upload specs |
| [javascript-guidelines.md](./javascript-guidelines.md) | Web component patterns |
| [liquid-guidelines.md](./liquid-guidelines.md) | Schema and `{% render %}` rules |

---

## DOM structure

```
<section class="shopify-section section">          ← Shopify wrapper
  <jane-hero-banner class="jane-hero-banner …">    ← Custom element (tabindex="0")
    <div class="jane-hero-banner__stage">          ← Fade target (whole stage)
      [admin notices: metafield / metaobject]
      <div id="JaneHeroSlider-{id}" class="jane-hero__slider">
        <div class="jane-hero__slide …">             ← One per slide block
          … layout-specific markup …
        </div>
      </div>
      <div class="jane-hero__controls">            ← Bullets (≥2 slides)
        <button class="jane-hero__bullet">…</button>
      </div>
    </div>
  </jane-hero-banner>
</section>
```

Inside each slide (layout-dependent):

- **Fullwidth:** `.jane-hero__fullwidth` → media + `.jane-hero__content`
- **50-50:** `.jane-hero__split` → two `.jane-hero__panel` (media + content each)
- **Image with text:** `.jane-hero__image-text` → media column + `.jane-hero__image-text-content`

---

## Layout modes

| `layout_mode` | Desktop | Mobile |
|---------------|---------|--------|
| `fullwidth` | Full-bleed media, overlaid content | Same (default content position: bottom-center) |
| `split_50_50` | Two 50% panels side-by-side | Panels stacked vertically |
| `image_with_text` | Image left/right at `image_width_percent` (30–70) | Image top, text below on light background |

Panel 2 in 50-50 mode uses `panel_2_*` settings (media, overlay, content, buttons).

---

## Section settings

| Setting ID | Type | Notes |
|------------|------|-------|
| `height_desktop` / `height_mobile` | select | `adapt`, `fit_screen`, `large` (770px), `medium` (550px), `small` (400px) |
| `enable_transparent_header` | checkbox | Overlays header on hero; first section in `<main>` only |
| `padding_top_desktop` / `padding_bottom_desktop` | range 0–100 | Applied via `{% style %}` on `#JaneHeroBanner-{id}` |
| `padding_top_mobile` / `padding_bottom_mobile` | range 0–100 | Same |
| `enable_fade_in_desktop` / `enable_fade_in_mobile` | checkbox | Section + active-slide content fade |
| `autoplay` | checkbox | Active only when ≥2 slides |
| `autoplay_speed` | range 3–10s | Default 5s |
| `content_source` | select | `manual`, `product_metafield`, `metaobject` |
| `product_metafield` | text | `namespace.key`; `visible_if` when metafield source |
| `metaobject` | metaobject | Type `jane_hero_banner`; conditional header (no `visible_if` on field) |
| `accessibility_label` | text | `aria-label` on `<jane-hero-banner>` |

Host CSS classes (from Liquid):

- `jane-hero-banner--height-desktop-{value}`
- `jane-hero-banner--height-mobile-{value}`
- `jane-hero-banner--fade-in-desktop` / `--fade-in-mobile`
- `jane-hero-banner--transparent-header`
- `jane-hero-banner--fade-visible` (Theme Editor / JS / reduced motion)

---

## Slide block settings (summary)

Block type: `slide` · limit: 5 · `{{ block.shopify_attributes }}` on `.jane-hero__slide`

**Theme Editor order:** `layout_mode` first, then conditional groups via `visible_if`:

1. Image with text options (`image_position`, `image_width_percent`) — when `image_with_text`
2. Media desktop/mobile (type + conditional image/video pickers)
3. Content, typography, colors
4. Content position + text alignment (desktop/mobile)
5. Overlay (panel 1); panel 2 overlay — when `split_50_50`
6. Button 1 & 2 (customize colors when type = `customize`)

**Schema constraint:** Shopify `metaobject` settings cannot use `visible_if` — use a conditional `header` instead.

---

## Content positioning & alignment

### 9-position grid (desktop + mobile independent)

`top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`

Classes: `.jane-hero__content--desktop-{position}`, `.jane-hero__content--mobile-{position}`

Mobile default: `bottom-center`

### Text alignment (desktop + mobile independent)

`left` | `center` | `right`

Classes: `.jane-hero__text--align-desktop-{alignment}`, `.jane-hero__text--align-mobile-{alignment}`

### Implementation notes

- **Do not** put `.page-width` on `.jane-hero__content-inner` — `margin: 0 auto` breaks flex-based 9-position placement. Max width is on `.jane-hero__text-group`.
- Button row alignment follows text alignment via `justify-content` / `align-items` in CSS.

---

## Typography & colors

Per slide (or `panel_2_*`):

| Setting | Maps to |
|---------|---------|
| `heading_size_desktop` / `_mobile` | `.h1`–`.h5` on `.jane-hero__title` |
| `body_size_desktop` / `_mobile` | `.text-body`, `.caption-large`, or `.caption` on `.jane-hero__description` |
| `title_color` / `description_color` | CSS vars `--hero-title-color`, `--hero-desc-color` on content wrapper |

Uses existing Dawn/Jane utility classes — no hardcoded px font sizes in hero CSS.

---

## Buttons

Up to 2 per slide/panel. Types: `filled_white`, `filled_black`, `stroke_white`, `stroke_black`, `link_white`, `link_black`, `customize`.

Rendered via `snippets/jane-hero-button.liquid` using [button-guidelines.md](./button-guidelines.md) classes and `component-buttons.css`.

### Whole-slide link

When **exactly one** button is configured, it is a **link type** (`link_white` / `link_black`), and there are no filled/stroke/customize buttons — the media is wrapped in `<a class="jane-hero__slide-link">` with `aria-label` from the slide title.

---

## Media & overlays

`snippets/jane-hero-media.liquid`:

- Breakpoint **750px**: mobile vs desktop asset
- Image or video per breakpoint (`media_type_desktop` / `media_type_mobile`)
- Video: autoplay, muted, loop, playsinline
- `image_url` + `image_tag`; lazy load; `draggable="false"` on images (for drag carousel)
- Empty: `hero-apparel-1` placeholder SVG

Overlay per panel (`overlay_type`: `none` | `opacity` | `gradient` | `both`; `overlay_opacity` 0–100).

---

## Carousel (`assets/jane-hero-banner.js`)

Custom element **`jane-hero-banner`** — horizontal scroll-snap slider. **Not** Dawn `SlideshowComponent`.

| Feature | Behavior |
|---------|----------|
| Navigation | Bullet indicators only; bottom-center; Jane dimensions |
| Autoplay | Section setting; pauses on hover/focus; resumes on leave |
| Keyboard | `ArrowLeft` / `ArrowRight` when element focused |
| Drag / swipe | Pointer events on entire `<jane-hero-banner>` (capture, 8px threshold); works on media and slide link; skips buttons, inputs, bullets |
| Scroll sync | `onScroll` updates bullets + content fade |
| `goToSlide(index, behavior)` | Public method used by Theme Editor |

Data attributes on host: `data-autoplay`, `data-speed`.

---

## Animations

Two coordinated layers when fade toggles are enabled.

### Layer 1 — Section fade (viewport entry)

- **Target:** `.jane-hero-banner__stage`
- **Trigger:** `IntersectionObserver` threshold `0.12` → adds `jane-hero-banner--fade-visible`
- **Effect:** opacity + `translateY(2rem)` → visible; 0.6s ease
- **Breakpoint:** Separate desktop/mobile toggles via media queries

### Layer 2 — Active slide content fade

- **When:** Section is visible and slide becomes active
- **Liquid:** `jane-hero__content--animate` when either fade toggle is on
- **JS:** `updateSlideContentFade(index)` sets `jane-hero__slide--active` and toggles `jane-hero__content--visible` on active slide content (double `requestAnimationFrame` to restart transition)
- **Effect:** Content inner fades in with 0.15s delay after section fade
- **Inactive slides:** Content hidden without transition

### Reduced motion

`prefers-reduced-motion: reduce` — both layers disabled; content shown immediately; `jane-hero-banner--fade-visible` applied on connect.

### Theme Editor

`request.design_mode` adds `jane-hero-banner--fade-visible` on load for immediate preview.

---

## Transparent header

Setting: `enable_transparent_header`

**Requirements:** Hero must be the **first** `.shopify-section` inside `<main>`.

| State | Behavior |
|-------|----------|
| At top of page | Header group (header + announcement bar) transparent; hero pulled up with negative margin |
| Scrolled past hero | `body.jane-hero-header-solid` — normal header background restored |

**JS:** `initTransparentHeader()` → body class `jane-hero-has-transparent-header`; sets `--jane-hero-header-offset` from header group height; scroll/resize listener toggles solid state when `heroBottom <= headerOffset`.

**CSS:** `main > .shopify-section:first-child:has(.jane-hero-banner--transparent-header)` negative margin; transparent `.header-wrapper` and `.utility-bar` while not solid.

Header text/icons still use the header color scheme — merchants should pick contrast appropriate for hero media.

---

## Content sources (PDP)

| Source | Current behavior |
|--------|------------------|
| `manual` | Renders slide blocks from Theme Editor |
| `product_metafield` | Validates `namespace.key` on PDP; shows notice if missing/invalid; falls back to manual blocks |
| `metaobject` | Validates picker; shows notice if empty; falls back to manual blocks |

Full metafield/metaobject-driven slide rendering depends on store definitions — guards and schema are in place.

---

## Theme Editor integration

`assets/theme-editor.js`:

- **`shopify:block:select`** on `.jane-hero__slide` → pauses autoplay, calls `goToSlide(index, 'auto')`
- **`shopify:block:deselect`** → resumes autoplay if enabled

Section loads `theme-editor.js` when `request.design_mode`.

---

## Spacing reference (CSS)

| Element | Mobile | Desktop |
|---------|--------|---------|
| Content horizontal padding | 16px | Varies by position |
| Content bottom padding | 24px | Varies by position |
| Title ↔ description | 16px | 16px |
| Text ↔ buttons | 24px | 24px |
| Button gap | 8px stacked, full width | 16px inline |
| CTA width | 100% of content area | 196px fixed |
| Bullets | 10×3px, gap 4px | 24×6px, gap 6px |
| Active bullet | `--color-negro` | Same |
| Inactive bullet | `--color-gris` | Same |

Bullets are always bottom-center regardless of content position.

---

## i18n keys

Customer-facing (`locales/en.default.json` → `sections.jane_hero_banner`):

| Key | Default |
|-----|---------|
| `carousel` | Carousel |
| `slide` | Slide |
| `load_slide` | Load slide |
| `metafield_empty` | Hero content is not available from the product metafield… |
| `metaobject_empty` | No hero metaobject selected… |

Schema labels: `locales/en.default.schema.json` → `sections.jane_hero_banner.*`

---

## Maintenance checklist

When changing the hero:

1. Read this doc + linked guidelines
2. Keep changes scoped to `jane-hero-*` files and `theme-editor.js` hero handlers
3. Do not edit `config/settings_data.json` unless requested
4. Preserve `{{ block.shopify_attributes }}` on slide wrapper
5. Run `shopify theme check` before completing
6. Test at **375px** and **1440px**; breakpoint **750px**

### Manual QA

- [ ] All 3 layout modes
- [ ] 9 positions + text alignment (desktop and mobile)
- [ ] Buttons follow text alignment
- [ ] Drag on media and non-interactive areas
- [ ] Section fade on viewport entry + content fade on active slide change
- [ ] Transparent header at top; solid after scroll
- [ ] Theme Editor: select slide block → carousel jumps
- [ ] Reduced motion: no animations
- [ ] Keyboard arrow navigation

---

## Boundaries

| Do | Don't |
|----|-------|
| Extend `jane-hero-*` files | Modify `image-banner.liquid` / `slideshow.liquid` |
| Use `{% render %}` with explicit params | Use `{% include %}` |
| Add `t:` keys + locale updates | Hardcode merchant-facing strings |
| Match Jane button/typography patterns | Change global tokens in `base.css` / `theme.liquid` for hero-only needs |

---

## Related links

- [Agent implementation prompt](../ai-agent-prompts/jane-hero-banner.md) — original Figma spec brief
- [Theme overview](./theme-overview.md)
- [Project patterns](./project-patterns.md)
