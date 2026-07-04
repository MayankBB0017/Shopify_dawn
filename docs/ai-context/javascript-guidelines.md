---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# JavaScript Guidelines

## JavaScript Architecture (This Project)

**Web Components + PubSub event bus** — Dawn's established pattern extended with Jane cart/disclosure scripts.

```
assets/
├── global.js              # Core utilities, 13+ custom elements, HTMLUpdateUtility
├── pubsub.js              # PUB_SUB_EVENTS event bus
├── constants.js           # Shared constants (PUB_SUB_EVENTS, etc.)
├── cart.js                # CartItems custom element
├── cart-drawer.js         # CartDrawer custom element
├── product-form.js        # Product form submission
├── facets.js              # Collection filtering
├── standard-actions-override.js  # Jane: Standard Actions bridge
├── cart-disclosure-modal.js      # Jane: cart disclosure modal
├── cart-disclosure-tooltip.js    # Jane: cart disclosure tooltip
├── disclosures.js         # Jane: disclosure accordion component
└── theme-editor.js        # Design mode helpers
```

Scripts loaded in `layout/theme.liquid` with `defer`:

```liquid
<script src="{{ 'constants.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'pubsub.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'global.js' | asset_url }}" defer="defer"></script>
```

Section-specific scripts loaded conditionally or via section Liquid.

## Shopify-Specific Development

### Theme Editor Compatibility

- `theme-editor.js` handles design-mode events
- Custom elements re-initialize on section load via Shopify's section rendering API
- `shopify:section:load` and `shopify:section:unload` event listeners in cart/product components

### Section Lifecycle

Dawn custom elements listen for Theme Editor section events to re-bind handlers after AJAX section replacement.

### Dynamic Section Rendering

`HTMLUpdateUtility.viewTransition()` in `global.js` swaps DOM nodes during cart section refreshes. Custom elements expose `getSectionsToRender()` returning section IDs and selectors for AJAX partial updates.

## Shopify JavaScript Patterns

**These take precedence over existing project convention if the two conflict.**

- Prefer `{% javascript %}` inside sections, blocks, and snippets for colocated component scripts
- Liquid is NOT rendered inside `{% javascript %}` tags — do not put Liquid variables inside them
- Use progressive enhancement — HTML/CSS first, JavaScript only when needed
- Avoid adding global scripts or third-party CDN libraries unless the project already uses them
- Keep JavaScript scoped to the component and lean in size
- Prefer Shopify section lifecycle patterns and Theme Editor-safe initialization where applicable

### Project Convention Note

This Dawn fork uses **external JS files** in `assets/` loaded via `script_tag`, not colocated `{% javascript %}`. Match this pattern when modifying existing components. The exception is `layout/theme.liquid` which uses an inline `<script type="module">` for StandardEvents CDN import.

## PubSub Event Bus

`pubsub.js` provides publish/subscribe for decoupled cart updates:

```javascript
// Publishing (product-form.js, cart.js)
publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', cartData: response });

// Subscribing (cart-drawer.js, cart.js)
subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => { /* refresh sections */ });
```

Key events in `constants.js`: `cartUpdate`, `quantityUpdate`, `variantChange`, etc.

## Jane-Specific: Standard Actions Override

`standard-actions-override.js` configures Shopify Standard Actions for Dawn:

- **`openCart`**: Opens `<cart-drawer>` or falls back to `/cart`
- **`updateCart`**: After Storefront API mutation, refreshes cart sections and publishes `cart-update`
- Maintains `DAWN_CART_TAGS` and `DAWN_PUBSUB_REFRESHED_SECTIONS` denylist to prevent double-rendering

**Do not remove** unless reverting to Shopify defaults intentionally.

## Jane-Specific: Disclosure JS

- `disclosures.js` — custom element for accordion expand/collapse
- `cart-disclosure-modal.js` — modal for cart-line disclosure details
- `cart-disclosure-tooltip.js` — tooltip variant for compact cart display

## Common Implementations

| Feature | Files |
|---------|-------|
| **Variant selection** | `product-info.js`, `product-form.js`, `global.js` (VariantSelects) |
| **Cart add/update** | `product-form.js` → `/cart/add.js` → pubsub |
| **Cart drawer** | `cart-drawer.js`, `cart-drawer.liquid` snippet |
| **Collection filtering** | `facets.js` → `/collections/{handle}?section_id=...` |
| **Predictive search** | `predictive-search.js` → `/search/suggest.json` |
| **Quick add** | `quick-add.js`, `quick-add-bulk.js` |
| **Media gallery** | `media-gallery.js`, `product-modal.js` |

## Standards

- **ES6+ classes** for custom elements: `class CartDrawer extends HTMLElement`
- **Deferred loading**: all scripts use `defer="defer"`
- **No jQuery** — vanilla JS throughout
- **Error handling**: try/catch around `getSectionsToRender()` calls in standard-actions-override
- **Fetch API** for AJAX: `/cart/add.js`, `/cart/change.js`, section rendering endpoints
- **Module import** only for StandardEvents CDN in theme.liquid

## Standard Storefront Events

Loaded as ES module in `layout/theme.liquid`:

```javascript
import * as StandardEvents from 'https://cdn.shopify.com/storefront/standard-events.js';
customElements.define('product-component', StandardEvents.createViewEventElement(HTMLElement, { defaultTrigger: 'intersect' }));
```

Do not duplicate or conflict with this initialization.
