---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# HTML & Accessibility

## HTML Standards (This Project)

- Semantic landmarks: `<main role="main">`, `<header>`, `<footer>`, `<nav>`
- Skip-to-content link in `layout/theme.liquid`: `<a class="skip-to-content-link" href="#MainContent">`
- Heading hierarchy managed via schema `heading_size` settings (h0, h1, h2)
- Forms use proper `<label>` associations and `name` attributes
- Hidden accessibility messages in `<ul hidden>` for live region announcements
- `<main data-template="{{ template.name }}">` for page context (not a11y-related but structural)

## Accessibility Standards

**Target: WCAG 2.1 AA** as baseline.

This project implements Dawn's accessibility patterns plus Jane-specific fixes noted in `release-notes.md`:

- Fixed ARIA labels and focus management on search and filtering components
- Star rating components use `aria-label` with translated review info
- `visually-hidden` class for screen-reader-only text
- Live regions for cart updates (`cart-live-region-text` section)
- Keyboard-trap and focus management in modals (`global.js` — `trapFocus`, `removeTrapFocus`)
- Disclosure accordions use `<details>`/`<summary>` or custom component with keyboard support (`disclosures.js`)

### Keyboard Navigation

- Focus trap in cart drawer, modals, and search (`global.js`)
- `summary` elements used for collapsible content (facets, disclosures)
- Tab order preserved via `tabindex` management in custom elements
- Escape key closes modals/drawers (details-modal.js, cart-drawer.js)

### ARIA Usage

- `aria-label` on rating stars, icon buttons, and search inputs
- `aria-hidden="true"` on decorative elements (review count duplicates)
- `role="main"`, `role="status"` where appropriate
- Live region text for dynamic cart/content updates

## Accessibility Testing Tools

Before shipping interactive features, verify against:

| Tool | Purpose |
|------|---------|
| **axe-core** | Automated accessibility scan (browser extension or CI) |
| **Lighthouse** | Accessibility score audit (target: 90+) |
| **Manual keyboard pass** | Tab through cart, search, facets, disclosures, navigation without mouse |
| **Screen reader spot-check** | VoiceOver (macOS/iOS) or NVDA (Windows) on cart add/remove, search, checkout handoff |

**Current baseline**: Not measured/documented — see Recommendations in [project-patterns.md](./project-patterns.md).

## Shopify Accessibility Patterns

### Product Forms

- Variant picker accessible labels via `product-variant-picker.liquid`
- Quantity input with label association (`quantity-input.liquid`)
- Buy buttons with loading states and disabled states during submission

### Collection Filtering

- Facets use `<details>`/`<summary>` for expandable filter groups
- Price range inputs with labels (`price-facet.liquid`)
- Sort dropdown with accessible label

### Navigation

- Mega menu and drawer menu with keyboard support (`header-mega-menu.liquid`, `header-drawer.liquid`)
- Mobile menu drawer with focus trap

### Search

- Predictive search with ARIA live region updates
- Search form with proper label (`header-search.liquid`, `search-form.js`)

### Cart

- Cart drawer focus management on open/close
- Line item quantity changes announce via live region
- Disclosure indicators in cart with accessible expand/collapse

## Project-Specific Findings

- **Recent a11y fixes** (per release-notes): search and filtering ARIA labels and focus management improved
- **CLS improvement**: body layout styles changed for reduced cumulative layout shift
- **Disclosure icons**: decorative images use `alt=""` (correct for decorative)
- **Rating display**: dual visible/hidden text pattern for screen readers vs. visual display
