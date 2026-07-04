---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Project Patterns

Primary reference for feature development in the Jane Shopify theme.

## Reusable Patterns

### Shared Snippets

| Snippet | Used By | Notes |
|---------|---------|-------|
| `card-product.liquid` | featured-collection, related-products, main-collection-product-grid, collection-list | Primary product card |
| `card-collection.liquid` | collection-list, main-list-collections | Collection card |
| `product-disclosures.liquid` | disclosures section, main-product block, cart-drawer | Param `surface` filters display |
| `cart-disclosure-indicator.liquid` | cart-drawer, main-cart-items | Per-line cart disclosures |
| `facets.liquid` | main-collection-product-grid, main-search | Filtering UI |
| `price.liquid` | main-product, featured-product, card-product | Price with sale/compare |
| `buy-buttons.liquid` | main-product, featured-product | Add to cart form |
| `product-variant-picker.liquid` | main-product, featured-product | Variant/swatch selection |
| `product-media-gallery.liquid` | main-product | Image/video gallery |
| `cart-drawer.liquid` | layout/theme.liquid | Drawer markup |
| `pagination.liquid` | main-collection-product-grid, main-blog, main-search | Page navigation |
| `loading-spinner.liquid` | Various | Loading state indicator |

### Reusable Sections

| Section | Purpose |
|---------|---------|
| `main-product.liquid` | Full product page with 12+ block types |
| `featured-collection.liquid` | Homepage/collection product grid |
| `image-banner.liquid` | Hero banners with heading/button blocks |
| `rich-text.liquid` | Flexible text content blocks |
| `slideshow.liquid` | Image carousel |
| `collapsible-content.liquid` | FAQ/accordion content |
| `disclosures.liquid` | Jane product disclosure accordion |
| `apps.liquid` | Dedicated app block container |

### Shared Utilities (JS)

| File | Purpose |
|------|---------|
| `global.js` | HTMLUpdateUtility, SectionId, focus trap, 13+ custom elements |
| `pubsub.js` | Event bus for cart/variant/quantity events |
| `constants.js` | PUB_SUB_EVENTS and shared constants |
| `standard-actions-override.js` | Standard Actions ↔ Dawn cart bridge |

## Theme Conventions

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Sections | kebab-case | `main-product.liquid`, `email-signup-banner.liquid` |
| Snippets | kebab-case | `card-product.liquid`, `cart-disclosure-indicator.liquid` |
| CSS | `component-*.css`, `section-*.css` | `component-disclosures.css` |
| JS | kebab-case matching component | `cart-disclosure-modal.js` |
| Custom elements | kebab-case HTML tags | `<cart-drawer>`, `<product-form>` |
| CSS classes | BEM-like | `.disclosures-item__header` |
| Translation keys | hierarchical snake_case | `products.product.add_to_cart` |
| Schema t: keys | `t:sections.{name}.*` | `t:sections.disclosures.name` |

### File Organization

- One section per file in `sections/`
- One snippet per file in `snippets/`
- Component CSS/JS paired by name in `assets/`
- JSON templates in `templates/` with customer subfolder
- Section groups as JSON in `sections/` (header-group.json, footer-group.json)

### Code Organization Within Sections

1. CSS `stylesheet_tag` imports at top
2. `{%- style -%}` block for dynamic settings
3. HTML/Liquid markup with block loops
4. Conditional script loading at bottom
5. `{% schema %}` JSON at end

## Key Feature Architecture

### Product Page

```
templates/product.json
├── main-product (blocks: vendor, title, price, variant_picker, quantity_selector, buy_buttons, description, share, disclosures, @app)
├── disclosures (standalone section)
└── related-products (card-product grid)
```

Metafields: `shopify.disclosure`, `reviews.rating`, `reviews.rating_count`

### Collection Page

```
templates/collection.json
├── main-collection-banner
└── main-collection-product-grid (facets + card-product + pagination)
```

Filtering via `facets.js` AJAX section rendering.

### Cart

Three modes via `settings.cart_type`: drawer, notification, page.

```
Cart flow:
product-form.js → POST /cart/add.js → pubsub cartUpdate
→ cart-drawer.js / cart.js → getSectionsToRender() → partial HTML swap
→ standard-actions-override.js (external Standard Actions path)
→ cart-disclosure-indicator.liquid (line-item disclosures)
```

### Search

- Header: `predictive-search` section + `predictive-search.js`
- Full page: `main-search` section + `main-search.js` + facets

### Navigation

- Desktop: dropdown (`header-dropdown-menu.liquid`) or mega menu (`header-mega-menu.liquid`)
- Mobile: drawer (`header-drawer.liquid`)
- Configured via header section settings: `menu_type_desktop`, `logo_position`, `sticky_header_type`

## Custom Functionality

### Product Disclosures (Jane-Specific)

Metaobject-driven disclosures via `product.metafields.shopify.disclosure`:

- **Surfaces**: `product_page`, `cart` (filtered by `display_preferences.value.surfaces`)
- **Fields**: title, symbol (image), content (rich text via `metafield_tag`)
- **UI**: Accordion with summary line + expandable details
- **Files**: `disclosures.liquid`, `product-disclosures.liquid`, `cart-disclosure-indicator.liquid`, `disclosures.js`, `component-disclosures.css`

### Standard Storefront Events (Jane-Specific)

- CDN module in `theme.liquid`
- Custom elements: `collection-component`, `product-component`
- PageViewEvent with template name tracking

### Standard Actions Override (Jane-Specific)

Bridges external cart mutations (apps, agents, AI) with Dawn's pubsub + section refresh pattern. See `assets/standard-actions-override.js` header comments for maintenance notes.

## Recommendations Log

Gaps identified during analysis — backlog for future planning:

| # | Recommendation | Priority |
|---|---------------|----------|
| 1 | **Add CI pipeline** with `shopify theme check` on PRs | High |
| 2 | **Add `.theme-check.yml`** config file for project-specific lint rules | Medium |
| 3 | **Add LiquidDoc headers** to all existing snippets (only `unit-price.liquid` has one) | Medium |
| 4 | **Record Lighthouse/CWV baseline** scores from production/staging | Medium |
| 5 | **Record accessibility baseline** (Lighthouse a11y score, axe-core scan results) | Medium |
| 6 | **Evaluate `{% stylesheet %}` migration** for high-traffic components (verify Shopify CSS subsetting docs) | Low |
| 7 | **Document store-specific app integrations** (which apps use `@app` blocks in production) | Low |
| 8 | **Add pre-push hook** for local Theme Check validation | Medium |

## Frequently Modified Areas

When implementing features, check these files first:

- **Product changes**: `sections/main-product.liquid`, `snippets/buy-buttons.liquid`, `assets/product-form.js`
- **Cart changes**: `assets/cart.js`, `assets/cart-drawer.js`, `assets/standard-actions-override.js`, `snippets/cart-drawer.liquid`
- **Collection changes**: `sections/main-collection-product-grid.liquid`, `snippets/facets.liquid`, `assets/facets.js`
- **Disclosure changes**: `snippets/product-disclosures.liquid`, `sections/disclosures.liquid`
- **Global/layout**: `layout/theme.liquid`, `assets/global.js`, `config/settings_schema.json`
- **Styling**: `assets/base.css` (global), relevant `component-*.css`
- **Translations**: `locales/en.default.json`, `locales/en.default.schema.json`
