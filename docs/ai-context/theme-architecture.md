---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Theme Architecture

## Theme Structure

```
jane-shopify-theme/
├── assets/          # JS, CSS, SVG (~101 files)
├── config/          # settings_schema.json, settings_data.json
├── layout/          # theme.liquid, password.liquid
├── locales/         # en.default.json + 30+ languages + *.schema.json
├── sections/        # 53 section files + header-group.json, footer-group.json
├── snippets/        # 39 reusable partials
└── templates/       # JSON templates + gift_card.liquid, customers/*.json
```

**No `/blocks/` directory** — this theme uses Dawn-style section-scoped local blocks, not Horizon-style theme blocks.

## Layout Architecture

### `layout/theme.liquid`

Required Shopify layout tags are present and correctly placed:

- `{{ content_for_header }}` — in `<head>` (line ~66)
- `{{ content_for_layout }}` — inside `<main id="MainContent">` (line ~342)

Additional Jane customizations in layout:

- StandardEvents CDN module import + `PageViewEvent` on DOMContentLoaded
- Global deferred scripts: `constants.js`, `pubsub.js`, `global.js`, cart/disclosure/search scripts
- `{% style %}` block for font faces and CSS custom properties from theme settings
- Section groups: `{% sections 'header-group' %}`, `{% sections 'footer-group' %}`
- `<main data-template="{{ template.name }}">` for Standard Events page context
- Conditional cart drawer render when `settings.cart_type == 'drawer'`

### `layout/password.liquid`

Also includes `content_for_header` and `content_for_layout` correctly.

## Templates Architecture

All storefront pages use **JSON templates** (OS 2.0):

| Template | Key Sections |
|----------|--------------|
| `index.json` | image-banner, featured-collection, etc. |
| `product.json` | main-product, **disclosures**, related-products |
| `collection.json` | main-collection-banner, main-collection-product-grid |
| `cart.json` | main-cart-items, main-cart-footer |
| `search.json` | main-search |
| `customers/*.json` | account, login, register, order, addresses |

JSON templates reference sections by type; section order defined in `"order"` array. Dynamic sources used in block settings (e.g., `"text": "{{ product.vendor }}"`).

## Section Architecture

- **53 sections** — mix of content (slideshow, rich-text), commerce (main-product, featured-collection), and utility (cart-drawer, predictive-search)
- **Section groups**: `header-group.json`, `footer-group.json` — compose multiple sections into layout regions
- Sections load CSS via `{{ 'component-*.css' \| asset_url \| stylesheet_tag }}` at top of file
- Dynamic padding via `{%- style -%}` blocks with section-scoped classes (`.section-{{ section.id }}-padding`)
- Every section has `{% schema %}` with `t:` translation keys and presets

### Jane-Specific Sections

- `disclosures.liquid` — product-only (`enabled_on: product`); renders `product-disclosures` snippet
- `disclosures` block type inside `main-product.liquid` for inline product disclosures

## Block Architecture

**Dawn-style local blocks** defined in each section's `{% schema %}`:

- Blocks rendered inline in section Liquid via `{% for block in section.blocks %}`
- Top-level block wrappers include `{{ block.shopify_attributes }}` (verified in main-product, rich-text, slideshow, etc.)
- App blocks: `"type": "@app"` in header, footer, main-product, main-article, newsletter, featured-product, main-cart-footer, apps section

**Not used in this project:**

- Theme Blocks (`/blocks/` directory)
- `{% content_for 'blocks' %}` / `{% content_for 'block' %}`
- `"type": "@theme"` in schemas

## Snippet Architecture

39 snippets — parameterized via `{% render 'name', param: value %}`:

| Snippet | Purpose |
|---------|---------|
| `card-product.liquid` | Product card (collection grids, related products) |
| `product-disclosures.liquid` | Disclosure accordion (product page + cart) |
| `cart-disclosure-indicator.liquid` | Per-line-item disclosure in cart |
| `facets.liquid` | Collection filtering UI |
| `cart-drawer.liquid` | Drawer markup + disclosure blocks |
| `buy-buttons.liquid` | Add to cart + dynamic checkout |
| `price.liquid` | Price display with sale/compare logic |

Snippets receive isolated scope — pass all variables explicitly.

## Assets Structure

- **CSS**: `base.css` (global) + `component-*.css` (per-component) + `section-*.css`
- **JS**: Web component classes (`customElements.define`) in individual files
- **Shared utilities**: `global.js` (HTMLUpdateUtility, SectionId, focus trap), `pubsub.js`, `constants.js`
- **Theme Editor**: `theme-editor.js` for design mode behaviors

## Config Structure

- `settings_schema.json` — Dawn 15.5.0 theme settings (logo, colors, typography, cart type, animations)
- `settings_data.json` — **merchant Theme Editor state** — do not modify unless explicitly requested

## Locale Structure

- `locales/en.default.json` — customer-facing strings
- `locales/en.default.schema.json` — Theme Editor schema translations
- 30+ additional language files + matching `.schema.json` files

## Shopify OS 2.0 Features

| Feature | Status |
|---------|--------|
| JSON templates | ✅ All pages |
| Section groups | ✅ header-group, footer-group |
| App blocks (`@app`) | ✅ 8 sections |
| Dynamic sources | ✅ In template/block settings |
| Color schemes | ✅ `color_scheme` settings throughout |
| Metafields | ✅ reviews, shopify.disclosure |
| Metaobjects | ✅ Disclosure metaobjects via `shopify.disclosure` metafield |
| App embeds | Via `content_for_header` (app-injected) |

## Metafield & Metaobject Conventions

| Namespace | Key | Usage |
|-----------|-----|-------|
| `shopify` | `disclosure` | Product disclosure metaobjects — title, symbol, content, display_preferences.surfaces |
| `reviews` | `rating`, `rating_count` | Shopify Product Reviews app standard metafields |

Surfaces filter in `product-disclosures.liquid`: `product_page`, `cart` (via `surface` param).

Definitions are **implicit** — relied upon from Shopify/platform, not declared in theme code.

## Data Flow

### Template Rendering

```
Request → Shopify routes to JSON template → Sections loaded in "order" → Each section renders blocks → Snippets via {% render %}
```

### Product Page Flow

```
product.json
  → main-product (blocks: title, price, variant_picker, buy_buttons, disclosures block, etc.)
  → disclosures section (standalone accordion via product-disclosures snippet)
  → related-products (card-product snippets)
```

### Collection Flow

```
collection.json → main-collection-banner → main-collection-product-grid
  → card-product snippets → facets.liquid + facets.js for filtering
```

### Cart Flow

```
Add to cart (product-form.js) → /cart/add.js → pubsub cartUpdate
  → cart-drawer.js / cart.js refresh sections via getSectionsToRender()
  → Standard Actions override (standard-actions-override.js) for external cart mutations
  → cart-disclosure-indicator.liquid for line-item disclosures
```

### Search Flow

```
predictive-search section → predictive-search.js → /search/suggest.json
main-search section → main-search.js for full results page
```

## Section Development Guidelines

- Reuse existing Dawn sections before creating new ones
- Include `{% schema %}` with `t:` keys, presets, and `@app` block type when siblings have it
- Use `{%- style -%}` for padding/color scheme live-preview settings
- Load component CSS via `stylesheet_tag` (match Dawn pattern)
- Support `enabled_on` / `disabled_on` template restrictions where appropriate
- Include `{{ block.shopify_attributes }}` on every block wrapper element

## Block Development Guidelines

- Define blocks in section schema JSON
- Render with `{% case block.type %}` or dedicated block partials
- Always add `{{ block.shopify_attributes }}` on top-level block HTML element
- Include presets for merchant addability in Theme Editor
- Support drag-and-drop via shopify_attributes (verify in Theme Editor after changes)

## Theme Editor Compatibility

- Color scheme settings use `color-{{ section.settings.color_scheme }} gradient` pattern
- Section padding settings follow Dawn's mobile/desktop multiplier pattern (0.75× mobile)
- `theme-editor.js` handles design-mode-specific behaviors
- Block selection/reordering requires `shopify_attributes` on block wrappers
- Do not break `@app` block slots — apps depend on these schema entries

## Project-Specific Architecture

### Standard Storefront Events

`layout/theme.liquid` loads `standard-events.js` and registers:

- `collection-component` — view events on collections
- `product-component` — view events on products (intersect trigger)
- `PageViewEvent` on DOMContentLoaded with template name from `data-template`

### Standard Actions Override

`standard-actions-override.js` bridges Shopify's Standard Actions bundle with Dawn's cart custom elements (`cart-drawer`, `cart-items`, etc.) and pubsub `cart-update` events. Maintains a denylist (`DAWN_PUBSUB_REFRESHED_SECTIONS`) to prevent double-rendering.

### Disclosure System

Three-surface architecture:

1. **Product page section** — `sections/disclosures.liquid`
2. **Product page block** — block type in `main-product.liquid`
3. **Cart indicator** — `cart-disclosure-indicator.liquid` in cart drawer/items

All funnel through `snippets/product-disclosures.liquid` with `surface` param filtering metaobject display preferences.
