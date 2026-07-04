---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# CSS Guidelines

## CSS Architecture (This Project)

**Dawn external-asset pattern** — CSS lives in `assets/` and is loaded per-section/snippet:

```
assets/
├── base.css                    # Global styles, CSS custom properties, typography
├── component-*.css             # Per-component styles (card, cart, facets, disclosures, etc.)
├── section-*.css               # Per-section styles (footer, main-product, etc.)
└── template-*.css              # Template-specific (collection, giftcard)
```

Sections load CSS at the top:

```liquid
{{ 'component-card.css' | asset_url | stylesheet_tag }}
{{ 'section-main-product.css' | asset_url | stylesheet_tag }}
```

Snippets load their own CSS when rendered (e.g., `product-disclosures.liquid` loads `component-disclosures.css`).

### CSS Custom Properties

Theme settings map to CSS variables in `layout/theme.liquid` `{% style %}` block:

- Font families, scales, letter spacing
- Color scheme variables via `.color-scheme-*` classes
- Animation durations when enabled

Dynamic per-section/block settings use inline CSS variables:

```liquid
style="--rating: {{ rating | floor }}; --rating-max: {{ scale_max }};"
```

## Standards

- **BEM-like naming**: `.component-name__element`, `.component-name--modifier`
- **Section-scoped padding**: `.section-{{ section.id }}-padding` via `{% style %}`
- **Color schemes**: `.color-{{ section.settings.color_scheme }}` + `.gradient`
- **Responsive**: Mobile-first with `@media screen and (min-width: 750px)` breakpoint (Dawn standard)
- **State classes**: `.loading`, `.hidden`, `.visually-hidden`, `.disabled`
- **Spacing utility**: `.spacing-style` used in disclosures

## Shopify CSS Patterns

**These take precedence over existing project convention if the two conflict.**

- Prefer `{% stylesheet %}` inside sections, blocks, and snippets for colocated component styles
- Use `{% style %}` for settings that should live-update in the Theme Editor (colors, spacing, etc.)
- Liquid is NOT rendered inside `{% stylesheet %}` tags — do not put Liquid variables inside them
- For a single dynamic CSS property from schema settings, use a CSS variable on the wrapper element
  - Example: `style="--gap: {{ block.settings.gap }}px"` with `gap: var(--gap)` in stylesheet
- For multiple dynamic CSS properties, use CSS class toggles from select/radio/checkbox settings
- Avoid creating new global CSS files for small component changes when colocated styles are appropriate

### Project Convention Note

This Dawn fork uses **external CSS files** (`assets/component-*.css`) rather than colocated `{% stylesheet %}` tags. When modifying existing components, edit the corresponding asset file. For **new** small components, consider `{% stylesheet %}` per Shopify best practices, but match surrounding section patterns for consistency within a file.

The project extensively uses `{% style %}` for Theme Editor live-preview settings (padding, fonts) — this is the established pattern here.

## Maintainability

- One CSS file per component/section — avoid monolithic additions to `base.css`
- Component CSS loaded only where needed (conditional loading in snippets)
- Reuse Dawn utility classes: `.page-width`, `.gradient`, `.caption`, `.h0`/`.h1`/`.h2`
- Color scheme system avoids hardcoded colors — use scheme variables

## Performance

- Component CSS loaded per-section (not all CSS on every page)
- `font-display: swap` on all `@font-face` declarations
- Responsive images via `image_url` widths (not CSS scaling of large images)
- Animation CSS gated by `settings.animations_reveal_on_scroll`
- Shopify may automatically subset CSS loaded via `{% stylesheet %}` tags — verify current behavior against live docs when adopting colocated styles

## Jane-Specific CSS Files

| File | Component |
|------|-----------|
| `component-disclosures.css` | Product/cart disclosure accordion |
| `component-cart-items.css` | Cart line items + disclosure indicators |
| `component-facets.css` | Collection filtering |
| `component-predictive-search.css` | Search dropdown |
| `component-cart-drawer.css` | Cart drawer overlay |

## Dynamic Styling Pattern

Rating stars use CSS variables for dynamic values:

```liquid
style="--rating: {{ rating | floor }}; --rating-max: {{ scale_max }}; --rating-decimal: {{ decimal }};"
```

Section padding uses `{% style %}` with mobile multiplier:

```liquid
{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
    }
  }
{%- endstyle -%}
```
