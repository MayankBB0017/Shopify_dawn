---
last_analyzed: 2026-07-05
figma_whiteboard: https://www.figma.com/design/uPsucGoVngtsssbY35WpNi/JAN%C3%89---Mockups-interno?node-id=6102-59857
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/highlighted-product.liquid
---

# Highlighted Product — Implementation Reference

> **Purpose:** Document what is **built and shipped** for the Highlighted product section. Use when maintaining, debugging, or extending hotspots, tooltips, typography, CTA, or fade-in behaviour.
>
> **Original build brief:** [jane-highlighted-product.md](../ai-agent-prompts/jane-highlighted-product.md)

**Naming:** Theme Editor label **JANÉ Highlighted product** (section + preset). Preset category **JANÉ Custom Sections**. Code uses `highlighted-product` / `sections.highlighted_product` — **no `jane` prefix** in filenames or Liquid keys.

---

## Summary

Full-bleed lifestyle image with **interactive feature hotspots** (80×80 thumbnail + title + description) and a configurable **Descubrir** CTA linking to a featured product. Not Shop the look — no price, quick-add, or product cards.

| Breakpoint | Layout |
|------------|--------|
| Desktop ≥750px | Hero image with overlaid heading/subheading; 35.2px hotspots; tooltip positioned beside active dot |
| Mobile <750px | Text above image; 26.4px hotspots; tooltip fixed top-center (48px from top) |

**Key behaviours:**

- One active hotspot at a time; desktop hover/focus + mobile tap
- Desktop tooltip stays open after hover-out until another hotspot activates or click outside (tooltip links remain clickable)
- Per-block desktop tooltip placement (auto / left / right / top / bottom) with spacing and fine-tune offsets
- CMS typography: title H1–H5 and body Body big / Regular / Small (desktop + mobile)
- Hero image height modes (adapt, fit screen, large / medium / small) — same pattern as Jane hero banner
- Scroll fade-in: text → image → staggered dots → tooltip wrap → CTA
- Featured product fallbacks for subheading, CTA URL, hero images, and hotspot tooltip images
- Keyboard: Tab, Enter/Space, Escape, arrow keys between hotspots
- `prefers-reduced-motion`: no pulse or fade-in

---

## File map

| File | Role |
|------|------|
| `sections/highlighted-product.liquid` | Section markup, Liquid fallbacks, schema, preset (6 hotspots), JSON hotspot data |
| `snippets/highlighted-product-hotspot.liquid` | Positioned hotspot `<button>` with CSS variable positions |
| `assets/section-highlighted-product.css` | Layout, container, heights, tooltip, hotspots, CTA, fade-in |
| `assets/section-highlighted-product.js` | `<highlighted-product-section>` web component |
| `assets/component-buttons.css` | Shared button / link styles for CTA variants |
| `locales/en.default.json` | `sections.highlighted_product.*` storefront strings |
| `locales/en.default.schema.json` | Schema `t:` labels |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [jane-highlighted-product.md](../ai-agent-prompts/jane-highlighted-product.md) | Original Figma spec |
| [jane-hero-banner.md](./jane-hero-banner.md) | Hero height CMS pattern |
| [instagram-grid.md](./instagram-grid.md) | Fade-in animation reference |
| [button-guidelines.md](./button-guidelines.md) | CTA button / link variants |
| [typography-guidelines.md](./typography-guidelines.md) | H1–H5 and body utility classes |

---

## DOM structure

```
<highlighted-product-section
  id="HighlightedProduct-{section.id}"
  class="highlighted-product
         highlighted-product--container-{full|standard}
         highlighted-product--height-desktop-{adapt|fit_screen|large|medium|small}
         highlighted-product--height-mobile-{…}
         highlighted-product--cta-desktop-{left|right}
         highlighted-product--cta-mobile-{left|right}
         highlighted-product--fade-in-{desktop|mobile}
         highlighted-product--fade-visible [design mode]
         color-{scheme} gradient"
  data-section-id
  data-open-mode="hover_and_click|hover|click"
  data-default-hotspot="first|none">

  <div class="highlighted-product__stage">
    <div class="highlighted-product__shell [page-width]">
      <div class="highlighted-product__inner">
        <div class="highlighted-product__text--mobile highlighted-product__animate">…</div>
        <div class="highlighted-product__media">
          <div class="highlighted-product__text--desktop highlighted-product__animate">…</div>
          <div class="highlighted-product__image-wrap highlighted-product__animate">
            <picture>…</picture>
          </div>
          <div class="highlighted-product__hotspots" role="group">
            <button class="highlighted-product__hotspot highlighted-product__hotspot--animate is-active">…</button>
          </div>
          <div class="highlighted-product__tooltip-wrap highlighted-product__animate">
            <div id="HighlightedProductTooltip-{id}"
                 class="highlighted-product__tooltip highlighted-product__tooltip--mobile"
                 role="region" hidden>
              <div class="highlighted-product__tooltip-inner"></div>
            </div>
          </div>
          <a class="highlighted-product__cta highlighted-product__animate …">…</a>
        </div>
      </div>
    </div>
  </div>

  <script type="application/json" data-hotspot-data>[…]</script>
  <noscript>…</noscript>
</highlighted-product-section>
```

Hotspot positions use inline CSS variables on each button:

- `--hotspot-x`, `--hotspot-y` — desktop %
- `--hotspot-x-mobile`, `--hotspot-y-mobile` — mobile % (when `custom_mobile_position` is enabled)
- `--reveal-order` — fade-in stagger index

Section-scoped CSS variables (via `{% style %}`):

| Variable | Source |
|----------|--------|
| `--hp-padding-top/bottom-{mobile\|desktop}` | Section padding |
| `--hp-cta-bottom-{mobile\|desktop}` | CTA distance from bottom (%) |
| `--hp-cta-inset-x-{mobile\|desktop}` | CTA horizontal inset (fixed rem) |
| `--hp-hotspot-color-default/active` | Hotspot dot + ring colors |
| `--hp-container-radius` | Corner radius when container is Standard |

---

## Liquid fallbacks

Applied at top of `sections/highlighted-product.liquid`:

| Field | Fallback chain |
|-------|----------------|
| Subheading | `subheading` → featured product title |
| CTA URL | `button_link` → featured product URL → `#` if label set but no URL |
| CTA label | `button_label` → `sections.highlighted_product.descubrir` translation |
| Desktop hero image | `image` → `product.featured_image` |
| Mobile hero image | `image_mobile` → desktop (or product) image |
| Image alt | heading (stripped) → product title → accessibility label |
| Hotspot tooltip image | block `image` → section featured product `featured_image` |

---

## CMS settings — section

Settings are grouped in the Theme Editor as follows.

### Content

| Setting | ID | Notes |
|---------|-----|-------|
| Heading | `heading` | Inline richtext |
| Subheading | `subheading` | Falls back to product title |
| Featured product | `product` | Drives subheading, CTA URL, image fallbacks |

### Hero image

| Setting | ID | Default | Notes |
|---------|-----|---------|-------|
| Background image (desktop) | `image` | — | Uses product image when blank |
| Background image (mobile) | `image_mobile` | — | Art direction; falls back to desktop / product |
| Desktop height | `height_desktop` | `large` | adapt / fit_screen / large (77rem) / medium (55rem) / small (40rem) |
| Mobile height | `height_mobile` | `medium` | Same options |

### Button

| Setting | ID | Default |
|---------|-----|---------|
| Button label | `button_label` | Descubrir |
| Button link override | `button_link` | — |
| Button style | `button_style` | `stroke_black` |
| Link size | `link_size` | `14` — visible only for link styles |

**Button style options:** `stroke_black`, `stroke_white`, `filled_black`, `filled_white`, `link_black`, `link_white`.

Non-link styles render as `<a>` with `button` classes (fixed width, absolute positioning). Link styles use `link-button--{14|16}` classes.

### Button placement

| Setting | ID | Default |
|---------|-----|---------|
| Horizontal position (desktop) | `cta_horizontal_desktop` | `left` |
| Distance from bottom (desktop) | `cta_bottom_desktop` | 11% |
| Horizontal position (mobile) | `cta_horizontal_mobile` | `left` |
| Distance from bottom (mobile) | `cta_bottom_mobile` | 9% |

### Typography

| Setting | ID | Options |
|---------|-----|---------|
| Heading size desktop / mobile | `heading_size_desktop`, `heading_size_mobile` | h1–h5 |
| Body size desktop / mobile | `body_size_desktop`, `body_size_mobile` | Body big / Regular / Small |

### Hotspots

| Setting | ID | Default |
|---------|-----|---------|
| Active hotspot on load | `default_hotspot` | `first` (or `none`) |
| Open hotspot on | `open_hotspot_on` | `hover_and_click` |
| Hotspot color (default) | `hotspot_color_default` | `#1A1919` |
| Hotspot color (active) | `hotspot_color_active` | `#FFFFFF` |

### Animation

| Setting | ID | Default |
|---------|-----|---------|
| Enable fade-in on desktop | `enable_fade_in_desktop` | true |
| Enable fade-in on mobile | `enable_fade_in_mobile` | true |

### Layout

| Setting | ID | Default | Notes |
|---------|-----|---------|-------|
| Container width | `container_width` | `full_width` | Standard = `page-width` shell |
| Container corner radius | `container_border_radius` | 8px | Visible when Standard |
| Padding top/bottom desktop | `padding_top`, `padding_bottom` | 32px | |
| Padding top/bottom mobile | `padding_top_mobile`, `padding_bottom_mobile` | 64px | |
| Color scheme | `color_scheme` | scheme-1 | |
| Accessibility label | `accessibility_label` | — | Hotspot group + section aria-label |

---

## CMS settings — hotspot block

Min 1 · max 12 blocks. Preset ships 6 blocks at Figma-derived positions.

### Feature content

| Setting | ID |
|---------|-----|
| Feature title | `title` |
| Feature description | `description` |
| Feature image | `image` — 80×80 in tooltip; falls back to featured product image |
| Optional link | `link` — makes title a link in tooltip |

### Hotspot placement

| Setting | ID | Notes |
|---------|-----|-------|
| Horizontal position | `position_x` | Desktop % |
| Vertical position | `position_y` | Desktop % |
| Use custom mobile position | `custom_mobile_position` | Default true |
| Horizontal position (mobile) | `position_x_mobile` | Visible when custom mobile enabled |
| Vertical position (mobile) | `position_y_mobile` | Visible when custom mobile enabled |

### Tooltip placement (desktop only)

| Setting | ID | Default | Visible when |
|---------|-----|---------|--------------|
| Tooltip position | `tooltip_position` | `auto` | Always |
| Spacing from hotspot | `tooltip_spacing` | 24px | Always |
| Vertical adjustment | `tooltip_offset_y` | 0 | `auto`, `left`, or `right` |
| Horizontal adjustment | `tooltip_offset_x` | 0 | `top` or `bottom` |

Mobile tooltips ignore these settings — fixed top-center via CSS.

---

## Hotspot JSON (`data-hotspot-data`)

Rendered once per section inside `<script type="application/json" data-hotspot-data>`:

```json
{
  "id": "block_id",
  "title": "…",
  "description": "…",
  "image": "https://…/image.jpg",
  "imageAlt": "…",
  "link": "https://…",
  "tooltipPosition": "auto",
  "tooltipSpacing": 24,
  "tooltipOffsetX": 0,
  "tooltipOffsetY": 0
}
```

JS reads this map in `parseHotspotData()` and renders tooltip HTML in `renderTooltip()`. Tooltip inner layout classes:

- `highlighted-product__tooltip-inner--split` — image + text
- `highlighted-product__tooltip-inner--image-only`
- `highlighted-product__tooltip-inner--content-only`

If both image and content are empty, tooltip stays hidden.

---

## JavaScript (`<highlighted-product-section>`)

**File:** `assets/section-highlighted-product.js`

### Interaction modes

| `data-open-mode` | Hover | Click |
|------------------|-------|-------|
| `hover_and_click` | ✓ | ✓ |
| `hover` | ✓ | ✗ |
| `click` | ✗ | ✓ |

Mobile is detected via `(hover: hover) and (pointer: fine)` **and** `min-width: 750px`. Touch / narrow viewports use mobile behaviour.

### Desktop behaviour

- **Hover / focus** opens tooltip; **does not close** on hotspot or tooltip mouseleave
- Closes on: click outside (not on hotspot/tooltip), another hotspot, Escape, blur (unless focus moves to tooltip or another hotspot)
- **Tooltip positioning** (`positionTooltip`): reads per-block placement, spacing, offsets; clamps within media bounds; `auto` flips left when overflowing right edge
- **Resize** repositions active tooltip (desktop only)

### Mobile behaviour

- First hotspot active on load when `default_hotspot` is `first`
- Tap hotspot to activate; tap active hotspot again to close
- Tooltip uses `--mobile` class; inline `left`/`top` cleared; CSS fixed top-center
- Click outside section deactivates all

### Tooltip animation

- Fade-out: 250ms (`HIGHLIGHTED_PRODUCT_TOOLTIP_FADE_OUT_MS`)
- Fade-in: 350ms (CSS variables `--hp-tooltip-fade-in/out`)
- Switching hotspots: fade out → swap content → fade in (`swapTooltip`)
- Uses `hidden` attribute + `--visible` class (not `display: none` during transition)

### Fade-in

- `IntersectionObserver` threshold 0.12 on `.highlighted-product__stage`
- Adds `--fade-visible` and staggers `.highlighted-product__animate--visible` on children
- Design mode: section starts visible (`highlighted-product--fade-visible`)
- Theme Editor: `shopify:section:load`, `shopify:block:select` → `refreshAfterUpdate()` + activate selected hotspot

### Keyboard

| Key | Action |
|-----|--------|
| Tab | Move between hotspots |
| Enter / Space | Activate (click mode rules apply) |
| Arrow keys | Cycle hotspots |
| Escape | Close all |

---

## CSS architecture

**File:** `assets/section-highlighted-product.css`

| Area | Notes |
|------|-------|
| Breakpoint | 750px (`max-width: 749px` mobile) |
| Container | `--container-full` edge-to-edge; `--container-standard` uses `page-width` + border radius |
| Heights | Modifier classes on section root set `.highlighted-product__media` min-height |
| Hotspots | Absolute % positioning; ring uses default color; active dot + ring use active color; pulse animation on active ring |
| Tooltip desktop | `top: 0; left: 0` — positioned by JS |
| Tooltip mobile | `top: 4.8rem; left: 50%; translate: -50% …; width: calc(100% - 3.2rem)` |
| CTA | Absolute bottom positioning via `--hp-cta-bottom`; horizontal via modifier classes |
| Reduced motion | Disables transitions, pulse, and fade-in transforms |

**Do not use `100vw`** on shell — causes horizontal scroll. Section uses `width: 100%`.

---

## i18n keys

**Storefront** (`locales/en.default.json` → `sections.highlighted_product`):

| Key | Default |
|-----|---------|
| `descubrir` | Descubrir |
| `hotspot_label` | Product feature: {{ title }} |
| `hotspot_label_default` | Product feature |
| `accessibility` | Highlighted product features |

**Schema labels:** `locales/en.default.schema.json` → `sections.highlighted_product.*`

---

## Common maintenance tasks

| Task | Files to touch |
|------|----------------|
| New section setting | `highlighted-product.liquid` schema + Liquid + CSS vars if needed + `en.default.schema.json` |
| Hotspot block field | Block schema + JSON script + JS `renderTooltip` / config + locale |
| Tooltip positioning logic | `section-highlighted-product.js` → `positionTooltip`, `getHotspotTooltipConfig` |
| Hotspot visual size / colors | CSS `--hp-hotspot-*` + section color settings |
| CTA styles | `button_style` case in Liquid + `component-buttons.css` |
| Hero height values | CSS height modifiers (match jane-hero-banner rem values) |
| Fade-in timing | CSS animation delays + JS observer threshold |

---

## QA checklist

**Viewports:** 375px mobile · 1440px desktop · breakpoint 750px

- [ ] With / without featured product picker
- [ ] Hero images: custom desktop, custom mobile, product fallback, placeholder
- [ ] All height modes desktop + mobile
- [ ] Container full width vs standard + border radius
- [ ] All button styles + link sizes + CTA placement
- [ ] Typography pickers desktop + mobile
- [ ] Hotspot: 1 / 3 / 6 blocks; custom mobile positions
- [ ] Tooltip: each placement + spacing + X/Y offsets; swap between hotspots
- [ ] Desktop: hover persistence; tooltip link clickable; click outside closes
- [ ] Mobile: first hotspot open; fixed tooltip; tap to toggle
- [ ] `default_hotspot: none`; each `open_hotspot_on` mode
- [ ] Hotspot colors default / active
- [ ] Fade-in toggles desktop / mobile
- [ ] Theme Editor: block select activates hotspot; settings visible_if
- [ ] Keyboard navigation + Escape
- [ ] `prefers-reduced-motion`

Run `shopify theme check` before completing changes.

---

## Out of scope (by design)

- Editing `config/settings_data.json` or templates unless explicitly requested
- Shop the look UI, product cards, prices, quick-add
- Mobile tooltip placement CMS (fixed layout only)
- Section-level tooltip placement (per-block only)
- Figma asset downloads

---

## Boundaries

- Preserve `"type": "@app"` if added to schema in future
- Use `{% render %}` for snippets; pass variables explicitly
- Customer-facing strings via `{{ 'key' | t }}`
- Match existing external CSS/JS file pattern (not colocated `{% stylesheet %}`)
