---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Jane Shopify Theme — Overview

> **Read this file first** before any code changes. Check `last_analyzed` dates on all docs; re-verify Shopify-platform claims against live sources (Dev MCP / shopify.dev) if older than 90 days.

## Theme Summary

| Field | Value |
|-------|-------|
| **Theme name** | Dawn (Jane fork) |
| **Version** | 15.5.0 |
| **Architecture** | Shopify Online Store 2.0 — Dawn-style section-scoped blocks |
| **Purpose** | E-commerce storefront for Jane brand |
| **Complexity** | Medium — standard Dawn base with Jane-specific cart/disclosure/Standard Events customizations |

Dawn 15.5.0 provides the foundation: JSON templates, section groups, app blocks, color schemes, and web-component JavaScript. Jane customizations focus on **product disclosures**, **cart disclosure indicators**, and **Shopify Standard Storefront Events/Actions** for app/agent/AI cart interactions without full page reloads.

## Project Overview

### Key Functionality

- Product pages with variant picker, media gallery, buy buttons, related products
- Cart drawer / notification / page modes (Theme Editor configurable)
- Collection filtering (facets), predictive search, quick add
- Product disclosures via `shopify.disclosure` metaobjects (product page + cart)
- Standard Storefront Events (page view, product/collection view tracking)
- Standard Actions override for AJAX cart updates compatible with Dawn's pubsub pattern
- Quick order list / bulk ordering (B2B-style)
- Multilingual + multi-currency localization

### Custom Implementations

#### JANÉ Custom Sections

Net-new sections grouped under **JANÉ Custom Sections** in the Theme Editor “Add section” picker (`presets[].category` → `t:sections.all.jane_custom_sections.category`).

| Theme Editor name | Section file | Doc |
|-------------------|--------------|-----|
| JANÉ Hero banner | `sections/jane-hero-banner.liquid` | [jane-hero-banner.md](./jane-hero-banner.md) |
| JANÉ Blocks Banner | `sections/jane-blocks-banner.liquid` | [jane-blocks-banner.md](./jane-blocks-banner.md) |
| JANÉ Recommender | `sections/recommender.liquid` | [recommender.md](./recommender.md) |
| JANÉ Instagram grid | `sections/instagram-grid.liquid` | [instagram-grid.md](./instagram-grid.md) |
| JANÉ Highlighted product | `sections/highlighted-product.liquid` | [highlighted-product.md](./highlighted-product.md) |

#### Jane feature customizations (not new sections)

Disclosures use the theme’s existing `sections/disclosures.liquid` section with Jane snippets and assets:

- `snippets/product-disclosures.liquid` — shared disclosure renderer (product page + cart block)
- `snippets/cart-disclosure-indicator.liquid` — cart-line disclosure UI
- `assets/disclosures.js`, `assets/component-disclosures.css` — disclosure accordion web component
- `assets/cart-disclosure-modal.js`, `assets/cart-disclosure-tooltip.js` — cart disclosure UX
- `assets/standard-actions-override.js` — custom Standard Actions cart refresh
- `layout/theme.liquid` — StandardEvents CDN import + `data-template` on `<main>`

Supporting assets for JANÉ custom sections are documented in each section’s reference file (e.g. `section-jane-hero-banner.css`, `recommender.js`).

See [project-patterns.md](./project-patterns.md) for full pattern reference.

## Third-Party Integrations

| Integration | Location | Notes |
|-------------|----------|-------|
| **Shopify Standard Events** | `layout/theme.liquid` | CDN: `storefront/standard-events.js` |
| **Shopify Standard Actions** | `assets/standard-actions-override.js` | Overrides Dawn cart refresh path |
| **Shopify Product Reviews** | Metafields `reviews.rating`, `reviews.rating_count` | Used in `card-product`, `main-product`, `featured-product` |
| **Shopify Disclosure metaobjects** | `product.metafields.shopify.disclosure` | Jane-specific disclosure feature |
| **App Blocks (`@app`)** | header, footer, main-product, main-article, newsletter, featured-product, main-cart-footer, apps section | Preserve `"type": "@app"` in schemas |
| **Shopify Apps (via App Blocks)** | Theme Editor | No hardcoded app scripts found in theme code — apps inject via `@app` blocks |

No hardcoded analytics (GTM/gtag/Klaviyo) found in theme source; tracking likely via apps or `content_for_header`.

## Theme Structure Overview

| Folder | Role |
|--------|------|
| `layout/` | `theme.liquid` (main), `password.liquid` |
| `templates/` | JSON templates (OS 2.0) + `gift_card.liquid` |
| `sections/` | 54 Liquid sections |
| `snippets/` | 39 reusable partials |
| `blocks/` | **Not present** — Dawn-style local blocks in section schemas |
| `assets/` | ~60 JS + ~40 CSS files, SVG icons |
| `config/` | `settings_schema.json`, `settings_data.json` (merchant data — do not edit) |
| `locales/` | 30+ languages + schema translation files |

## Development Standards Summary

| Area | This Project |
|------|--------------|
| **Liquid** | `{% render %}` only; `t:` schema keys; dynamic sources in templates |
| **CSS** | External `assets/*.css` loaded via `stylesheet_tag` (Dawn pattern); `{% style %}` for live Theme Editor settings |
| **JS** | Web components in `assets/`; pubsub event bus; deferred script loading |
| **Accessibility** | Skip link, ARIA labels, live regions, keyboard nav in cart/search/facets |
| **Performance** | Lazy images, responsive `image_url`, deferred JS, font-display swap |
| **i18n** | All strings via `{{ 'key' \| t }}`; schema labels via `t:` keys |

Details: [liquid-guidelines.md](./liquid-guidelines.md), [css-guidelines.md](./css-guidelines.md), [javascript-guidelines.md](./javascript-guidelines.md), [html-accessibility.md](./html-accessibility.md), [performance-optimization.md](./performance-optimization.md).

## Key Project Patterns

- **Pubsub cart updates**: `pubsub.js` → `PUB_SUB_EVENTS.cartUpdate` — see `assets/cart.js`, `cart-drawer.js`
- **Section AJAX refresh**: Custom elements expose `getSectionsToRender()` — see `standard-actions-override.js`
- **Product cards**: `snippets/card-product.liquid`
- **Pricing**: `snippets/price.liquid`, `snippets/unit-price.liquid`
- **Facets/filtering**: `snippets/facets.liquid` + `assets/facets.js`
- **Disclosures**: `snippets/product-disclosures.liquid` (param: `surface`)

## Important Files and Directories

```
layout/theme.liquid          — Global layout, Standard Events, script loading
sections/main-product.liquid — Product page blocks (largest section)
sections/header.liquid       — Navigation, mega menu, app blocks
sections/disclosures.liquid  — Jane disclosure section
assets/global.js             — Core web components + utilities
assets/standard-actions-override.js — Standard Actions cart bridge
assets/pubsub.js             — Event bus
config/settings_schema.json  — Theme settings (Dawn 15.5.0)
templates/product.json       — Product template (includes disclosures section)
```

## Known Considerations

- **Legacy CSS architecture**: Dawn uses external CSS files, not colocated `{% stylesheet %}` — match this pattern unless migrating.
- **LiquidDoc gap**: Only `snippets/unit-price.liquid` has `{% doc %}` — add docs to new snippets.
- **No CI / Theme Check automation**: Not configured — see Recommendations in [project-patterns.md](./project-patterns.md).
- **No `/blocks/` folder**: Theme blocks (Horizon-style) not used; all blocks are section-local.
- **`config/settings_data.json`**: Contains merchant Theme Editor state — never modify unless explicitly requested.
- **Standard Actions override**: Required for Jane's cart contract; removing it reverts to Shopify defaults.

## Documentation Index

| File | `last_analyzed` | Summary |
|------|-----------------|---------|
| [theme-overview.md](./theme-overview.md) | 2026-07-03 | This file — start here |
| [theme-architecture.md](./theme-architecture.md) | 2026-07-03 | Structure, data flow, OS 2.0 patterns |
| [liquid-guidelines.md](./liquid-guidelines.md) | 2026-07-03 | Liquid rules, schema, snippets |
| [html-accessibility.md](./html-accessibility.md) | 2026-07-03 | Semantic HTML, WCAG, a11y testing |
| [css-guidelines.md](./css-guidelines.md) | 2026-07-03 | CSS organization, Dawn styling patterns |
| [javascript-guidelines.md](./javascript-guidelines.md) | 2026-07-03 | Web components, pubsub, cart JS |
| [performance-optimization.md](./performance-optimization.md) | 2026-07-03 | Liquid, frontend, Core Web Vitals |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | 2026-07-04 | Figma image/video aspect ratios, resolutions, upload specs |
| [typography-guidelines.md](./typography-guidelines.md) | 2026-07-04 | Figma typography spec, Dawn dynamic scale system, class mapping |
| [button-guidelines.md](./button-guidelines.md) | 2026-07-04 | Button variants, hover animations, form fields, variant pills, accordions |
| [jane-hero-banner.md](./jane-hero-banner.md) | 2026-07-04 | JANÉ Hero banner — implemented section reference |
| [jane-blocks-banner.md](./jane-blocks-banner.md) | 2026-07-04 | JANÉ Blocks Banner — implemented section reference |
| [recommender.md](./recommender.md) | 2026-07-04 | JANÉ Recommender — tabs, split layout, schema, deferred Figma card UI |
| [instagram-grid.md](./instagram-grid.md) | 2026-07-05 | JANÉ Instagram grid — 5-col desktop, 2-col mobile, 8 posts, app mode |
| [highlighted-product.md](./highlighted-product.md) | 2026-07-05 | JANÉ Highlighted product — hotspots, per-block tooltip placement, CTA CMS, hero heights, product fallbacks |
| [shopify-development-rules.md](./shopify-development-rules.md) | 2026-07-03 | Workflow, precedence, planning, validation |
| [project-patterns.md](./project-patterns.md) | 2026-07-03 | Reusable patterns, conventions, backlog |

## AI Agent Rule Files

| Environment | Rule file | Activation |
|-------------|-----------|------------|
| **Cursor** | `.cursor/rules/shopify-theme.mdc` | `alwaysApply: true` |
| **Claude Code** | `CLAUDE.md` | Auto-loaded at session start |
| **Antigravity** | `.agents/rules/shopify-theme.md` | `trigger: always_on` |

All rule files point to this documentation folder for depth. See [Antigravity Rules docs](https://antigravity.google/docs/rules-workflows).

## AI Agent Startup Instructions

Before making code changes:

1. Read this file.
2. Check `last_analyzed` — verify stale docs (>90 days) against live Shopify sources.
3. Review relevant topic docs from the index above.
4. Search for reusable snippets/sections before creating new code.
5. Follow [shopify-development-rules.md](./shopify-development-rules.md) — Analyze → Plan → Clarify → Implement → Test → Verify.
6. Use Dev MCP / shopify.dev to validate Liquid, schema, and API usage.
7. Preserve Theme Editor configurability and `@app` block support.
8. Ask clarification questions when requirements are ambiguous.
