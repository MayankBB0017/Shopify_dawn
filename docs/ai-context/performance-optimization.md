---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Performance Optimization

## Liquid Performance

### Current Practices

- Disclosure rendering uses `{%- capture -%}` to skip empty section output
- Collection product grids controlled by `products_to_show` setting (not unbounded loops)
- No `all_products` usage found in codebase
- Pagination via Shopify's built-in collection pagination in grid sections
- Metafield access is direct (`.value`) — no redundant lookups in loops

### Recommendations

- Keep disclosure loop single-pass with capture accumulation (current pattern)
- Avoid adding nested product loops in sections
- Use `{% paginate %}` if displaying large article/blog lists
- Limit metafield iterations — disclosure arrays are typically small

## Frontend Performance

### Images

- Responsive `image_url` with width/srcset parameters throughout
- Lazy loading: `loading="lazy"` on disclosure icons, product cards, collection images
- No deprecated `img_url`/`img_tag` — all use modern filters
- Product media gallery with deferred loading (`component-deferred-media.css`)
- **Jane aspect ratio & resolution targets:** see [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) (Figma source of truth for per-section ratios, formats, and file-weight goals)

### Fonts

- `font-display: swap` on all `@font-face` declarations in theme.liquid
- Preconnect to `fonts.shopifycdn.com` when using non-system fonts
- System font fallback when Shopify font picker selects system fonts

### JavaScript

- All scripts loaded with `defer="defer"` — non-blocking
- Conditional loading: `animations.js` only when `settings.animations_reveal_on_scroll`
- Component-scoped JS files — not monolithic bundle
- Pubsub prevents redundant full-page reloads for cart operations

### CSS

- Per-section CSS loading — only required component CSS on each page
- `base.css` contains global essentials only
- No `@import` chains in CSS files

## Shopify Performance

- Assets served via Shopify CDN (`asset_url` filter)
- Section rendering API used for AJAX updates (partial HTML, not full page)
- Standard Actions enable cart updates without page navigation
- App blocks load via Shopify's app embed system (not theme-bundled)

### Core Web Vitals

| Metric | Project Status |
|--------|---------------|
| **LCP** | CLS improvements noted in release-notes (body layout styles) |
| **CLS** | Explicitly addressed in recent release |
| **INP** | Not measured — deferred JS and pubsub patterns support good INP |

**Baseline scores**: Not documented — run Lighthouse on production/staging and record in [project-patterns.md](./project-patterns.md) Recommendations Log.

## Project-Specific Opportunities

| Area | Opportunity |
|------|-------------|
| **CSS delivery** | Consider migrating high-traffic component CSS to `{% stylesheet %}` for automatic subsetting (verify live docs) |
| **StandardEvents module** | Inline module import in theme.liquid — evaluate preload hints if LCP impacted |
| **Disclosure images** | Already optimized with srcset + lazy loading |
| **Theme Check CI** | Add automated performance lint rules via CI pipeline |
| **Font subsetting** | Review if all font weights loaded are used |

## Performance Checklist

Before completing work:

- [ ] Images use `image_url` with appropriate widths
- [ ] Non-critical images have `loading="lazy"`
- [ ] No new render-blocking scripts (use `defer`)
- [ ] No unpaginated loops over large collections
- [ ] CSS loaded only where needed
- [ ] No unnecessary global JS additions
- [ ] Theme Editor live-preview settings use `{% style %}`, not inline style bloat
