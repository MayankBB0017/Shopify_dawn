---
last_analyzed: 2026-07-04
figma_prototype: https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19870
figma_whiteboard: https://www.figma.com/design/uPsucGoVngtsssbY35WpNi/JAN%C3%89---Mockups-interno?node-id=6102-59856
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/recommender.liquid
---

# JANÉ Recommender — Implementation Reference

> **Purpose:** Document what is **built and shipped** in this theme for the JANÉ Recommender section (*Compra por edad*). Use this when maintaining, debugging, or extending the section.
>
> **Original build brief:** [jane-recommender.md](../ai-agent-prompts/jane-recommender.md) (agent prompt — design spec and Figma targets)

**Naming:** Theme Editor and preset use **JANÉ Recommender**. Code uses `recommender` / `gift-recommender` — **no `jane` prefix** in filenames, CSS namespace, or locale keys (per project convention).

---

## Summary

Tabbed gift/audience recommender: header (title + tab buttons + description) + panels (promotional image + 2×2 product grid). Each tab block maps to a **collection** and optional **promo image(s)**.

- **Min 2 tab blocks** required to render; fewer shows Theme Editor empty state only
- **All panels server-rendered** in Liquid; JS toggles visibility (SEO-friendly, no Section Rendering API in v1)
- **Standard Dawn `card-product`** — square media, section-scoped grid sizing; no custom card snippet
- **Quick add** optional; buttons get `button--hover-dissolve` via JS
- **Promo image fallback:** CMS image → collection featured image → Dawn placeholder SVG
- **Layout modifiers:** container standard/full width; promo left or right on desktop

**Does not extend** Dawn `featured-collection.liquid` — standalone section with dedicated CSS grid for the split layout.

---

## File map

| File | Role |
|------|------|
| `sections/recommender.liquid` | Section markup, schema, preset, asset loading |
| `snippets/recommender-tabs.liquid` | ARIA `tablist` button row |
| `snippets/recommender-panel.liquid` | Single tab panel: promo + product loop |
| `assets/section-recommender.css` | Layout, tabs, grid sizing, container/image modifiers |
| `assets/recommender.js` | `<gift-recommender>` tab controller |
| `locales/en.default.json` | `sections.recommender.*` storefront strings |
| `locales/en.default.schema.json` | Schema `t:` labels (section name: **JANÉ Recommender**) |

### Dawn assets loaded by section

| Asset | When |
|-------|------|
| `component-card.css`, `component-price.css`, `template-collection.css` | Always |
| `quick-add.css`, `product-form.js`, `quick-add.js` | When `enable_quick_add` is on |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [jane-recommender.md](../ai-agent-prompts/jane-recommender.md) | Original Figma spec and deferred features |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | Promo and product image upload specs |
| [button-guidelines.md](./button-guidelines.md) | Tab button variants (`button--filled-black`, `button--stroke-black`) |
| [javascript-guidelines.md](./javascript-guidelines.md) | Web component patterns |
| [liquid-guidelines.md](./liquid-guidelines.md) | Schema and `{% render %}` rules |

---

## DOM structure

```
<section class="shopify-section section">
  <gift-recommender id="GiftRecommender-{id}"
    class="gift-recommender gift-recommender--container-{standard|full}
           gift-recommender--image-{left|right} color-{scheme} gradient">

    <div class="gift-recommender__header [page-width]">
      [optional h2.gift-recommender__heading]
      <div class="gift-recommender__tabs-wrap">
        <div class="gift-recommender__tabs" role="tablist">
          <button role="tab" class="gift-recommender__tab button …">…</button>
        </div>
      </div>
      <div class="gift-recommender__description" data-recommender-description>…</div>
    </div>

    <div class="gift-recommender__panels [page-width]">
      <div class="gift-recommender__panel" role="tabpanel" [hidden when inactive]>
        <template id="GiftRecommenderDesc-{section}-{panel}">…per-tab description…</template>
        <div class="gift-recommender__layout gift-recommender__layout--split">
          <div class="gift-recommender__promo">…image or placeholder…</div>
          <div class="gift-recommender__grid-wrap">
            <ul class="gift-recommender__grid product-grid …">
              <li class="gift-recommender__grid-item">
                {% render 'card-product' … %}
              </li>
            </ul>
          </div>
        </div>
      </div>
      …one panel per recommendation block…
    </div>
  </gift-recommender>
</section>
```

First block = default active tab and panel on load.

---

## Layout

### Desktop (≥ 750px)

| Area | Behaviour |
|------|-----------|
| **Split columns** | CSS Grid `48.4fr` promo · `51.6fr` products (swapped when `image_position: right`) |
| **Promo** | Sized from **column width** (`width: 100%`, `aspect-ratio: 697/1004`) — not stretched to row height (prevents overlap bug) |
| **Promo radius (full width)** | Left: flush viewport left, radius on right only · Right: flush right, radius on left only |
| **Promo radius (standard)** | 8px on all corners |
| **Product grid** | Dedicated CSS Grid `repeat(2, 1fr)` — **not** Dawn `grid--2-col-*` / `grid__item` |
| **Card area max** | `2 × 33.1rem + 16px` gap (~678px); scales down in narrower columns |
| **Grid padding** | Left image: `0 48px 0 16px` on grid-wrap · Right image: mirrored |
| **Tabs** | Single row (`flex-wrap: nowrap`); header max-width fits up to 6 × 196px tabs |

### Mobile (< 750px)

| Area | Behaviour |
|------|-----------|
| **Stack** | Promo above product grid (`flex-direction: column`) |
| **Promo** | Full width, `aspect-ratio: 343/468`, 8px radius |
| **Product grid** | 2 columns, ~3px column gap · card max ~170px per cell |
| **Tabs** | Wrap to multiple lines when needed; 196px min button width |

### CSS variables (`.gift-recommender`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--gr-card-width-mobile` | `17rem` (~170px) | Max card column width mobile |
| `--gr-card-width-desktop` | `33.1rem` (~331px) | Max card column width desktop |
| `--gr-tab-width` | `19.6rem` (196px) | Tab button width |
| `--gr-tab-gap` | `1.6rem` (16px) | Horizontal gap between tabs |
| `--gr-tabs-row-max-width` | `calc(6 × tab + 5 × gap)` | Header/tabs max width desktop |
| `--gr-padding-*` | From section settings | Section vertical padding |

Padding injected via `{% style %}` on `#GiftRecommender-{{ section.id }}`.

---

## Section settings

| Setting | Type | Default | Notes |
|---------|------|---------|-------|
| `heading` | inline_richtext | Recomendador de regalos | |
| `heading_size` | select | `h2` | `h1` or `h2` |
| `description` | richtext | Spanish default copy | Shared; per-tab block can override |
| **Layout** | | | |
| `container_width` | select | `full_width` | `standard` → `page-width` on header + panels · `full_width` → edge-to-edge panels |
| `image_position` | select | `left` | Desktop only; mobile always promo above grid |
| **Products** | | | |
| `products_to_show` | range 2–8 | `4` | Applies to **all** tabs (no per-block override) |
| `enable_gallery` | checkbox | `true` | Second image on hover via `show_secondary_image` |
| `show_vendor` | checkbox | `false` | Passed to `card-product` |
| `show_rating` | checkbox | `false` | Passed to `card-product` |
| `enable_quick_add` | checkbox | `true` | Loads quick-add assets when on |
| **Padding** | range | 48/48 desktop · 32/32 mobile | Separate mobile/desktop top/bottom |
| `color_scheme` | color_scheme | `scheme-1` | |
| `accessibility_label` | text | — | Overrides `tablist` `aria-label` i18n default |

### Hardcoded (not in CMS)

| Behaviour | Value |
|-----------|-------|
| Product card media | `media_aspect_ratio: 'square'` |
| Product card shape | `image_shape: 'default'` |
| `extend_height` | `false` |

`image_ratio` and `image_shape` were removed from schema intentionally.

---

## Block: `recommendation`

**Limits:** min **2** blocks to display section · max **6** blocks.

| Setting | Type | Notes |
|---------|------|-------|
| `tab_label` | text | Tab button label (required for UX) |
| `collection` | collection | Product source for this tab |
| `promo_image` | image_picker | Desktop promo; falls back to collection featured image |
| `promo_image_mobile` | image_picker | Optional; fallback chain: mobile CMS → desktop CMS → collection image |
| `description` | richtext | When tab active, replaces section description (synced via JS from `<template>`) |

Each panel outputs a hidden `<template id="GiftRecommenderDesc-{section}-{index}">` for description swapping.

### Promo image fallback chain

```
Desktop:  block.promo_image → collection.featured_image → placeholder SVG
Mobile:   block.promo_image_mobile → block.promo_image → collection.featured_image → placeholder SVG
```

Alt text: `tab_label`, or `collection.title` if label blank.

First visible tab promo uses `loading="eager"`; others lazy.

---

## Product cards

Rendered via standard snippet:

```liquid
{% render 'card-product',
  card_product: product,
  media_aspect_ratio: 'square',
  image_shape: 'default',
  extend_height: false,
  quick_add: quick_add,
  show_secondary_image: enable_gallery,
  product_view_context: 'collection',
  …
%}
```

- Grid uses class `gift-recommender__grid` (not Dawn flex `grid__item` width overrides)
- Section CSS caps grid width and forces `display: grid` on `.gift-recommender__grid.product-grid`
- Placeholder products when collection empty (Theme Editor preview)

---

## JavaScript — `<gift-recommender>`

File: `assets/recommender.js`

| Feature | Implementation |
|---------|----------------|
| Tab click | `activateTab(index)` — toggles `aria-selected`, `hidden`, button classes |
| Keyboard | Arrow Left/Right/Up/Down, Home, End — WAI-ARIA tabs pattern; focus stays on tab |
| Description sync | Clones content from panel `<template>` into `[data-recommender-description]` |
| Quick add styling | Adds `button--hover-dissolve` to `.quick-add__submit.button` |
| Theme Editor | `shopify:section:load` re-binds · `shopify:block:select` activates matching panel |

**No-JS degradation:** First panel visible; other panels `hidden`. Only first collection visible without JS.

---

## Preset

**Name:** JANÉ Recommender

Three `recommendation` blocks:

1. PARA bebé  
2. PARA EMBARAZADAS  
3. PARA PAPÁ  

Collections and promo images are **not** pre-assigned — merchant configures in Theme Editor.

---

## Modifier classes

Applied on `<gift-recommender>`:

| Class | When |
|-------|------|
| `gift-recommender--container-standard` | `container_width: standard` |
| `gift-recommender--container-full` | `container_width: full_width` (default) |
| `gift-recommender--image-left` | `image_position: left` (default) |
| `gift-recommender--image-right` | `image_position: right` |

---

## i18n keys

### Storefront (`locales/en.default.json`)

| Key | Default |
|-----|---------|
| `sections.recommender.tablist_label` | Gift recommendations |
| `sections.recommender.empty_state` | Add at least two recommendation blocks to enable tabs. |

### Schema (`locales/en.default.schema.json`)

Namespace `sections.recommender` — section name **JANÉ Recommender**, preset name **JANÉ Recommender**.

---

## Known implementation notes

1. **Promo sizing:** Promo must size from column width, not row height. Do not re-add `min-height: 100%` on `.gift-recommender__promo` — it caused promo overflow over the product grid.
2. **Grid items:** Use `gift-recommender__grid-item`, not `grid__item`, to avoid Dawn flex width overrides.
3. **Section not in `templates/index.json`:** Added manually by merchant or in a follow-up task.
4. **`config/settings_data.json`:** Not edited during implementation.

---

## Deferred (not in current build)

From [jane-recommender.md](../ai-agent-prompts/jane-recommender.md) §11 — Figma custom product card UI:

- Badge row, wishlist heart, colour swatches  
- AÑADIR hover reveal (dissolve quick-add is in place instead of full Figma CTA)  
- Media gallery bullets on card  
- `card_context: 'recommender'` param on `card-product.liquid`  
- Optional CTA link on promo image  
- Per-tab `products_to_show` (removed — section-level only)  
- Section Rendering API for dynamic tab load  

---

## QA checklist

- [ ] Section appears as **JANÉ Recommender** with 3-tab preset  
- [ ] Fewer than 2 blocks → empty state in Theme Editor only  
- [ ] Tab click swaps collection products and promo without reload  
- [ ] Description updates when block has per-tab `description`  
- [ ] Promo fallback: collection image when CMS promo blank  
- [ ] Desktop: promo + 2×2 grid side by side, no overlap  
- [ ] `image_position: right` mirrors layout correctly  
- [ ] `container_width: standard` vs `full_width`  
- [ ] Mobile: stacked layout, tabs wrap  
- [ ] Desktop: all tabs on one row (up to 6)  
- [ ] Keyboard tab navigation (arrows, Home, End)  
- [ ] Quick add works when enabled  
- [ ] `shopify theme check` on section files  

---

## Changelog (implementation)

| Date | Change |
|------|--------|
| 2026-07-04 | Initial section: tabs, panels, split layout, Dawn cards |
| 2026-07-04 | Card width caps (~170px mobile / ~331px desktop); dedicated CSS grid |
| 2026-07-04 | Square images hardcoded; removed image ratio/shape CMS; removed block `products_to_show` |
| 2026-07-04 | Container width setting; JANÉ branding in schema/preset |
| 2026-07-04 | Promo fallback to collection featured image |
| 2026-07-04 | Tab row width increased; desktop single-line tabs |
| 2026-07-04 | Layout fix: promo overflow / grid overlap |
| 2026-07-04 | `image_position` left/right setting |
