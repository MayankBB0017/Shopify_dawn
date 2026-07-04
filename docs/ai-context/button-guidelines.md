---
last_analyzed: 2026-07-04
figma_frame: "2:19952 (JANÉ - Buttons)"
---

# Button, Input & Accordion Guidelines

Jane button types, hover animations, form fields, variant pills, and accordion styling aligned to Figma frame `2:19952` in [JANE — COPY](https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY).

**Typography** for button/link text is defined in [typography-guidelines.md](./typography-guidelines.md). Do not change typography tokens without merchant confirmation.

## Color tokens

Defined in `layout/theme.liquid` `:root`:

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-negro` | `#1a1919` | Text, filled black, borders |
| `--color-blanco` | `#ffffff` | White fills / text |
| `--color-gris` | `#f3f3f3` | Variant pill default |
| `--color-gris-medio` | `#e6e2dd` | Disabled CTA bg, pill selected, filter hover |
| `--color-gris-oscuro` | `#696969` | Disabled text, default input border |
| `--color-ui-disabled` | `#b4b4b4` | Disabled variant pill bg |
| `--button-radius-cta` | `0.8rem` | CTA / stroke / filter buttons |
| `--button-radius-variant` | `0.4rem` | Form inputs, variant pills |
| `--button-hover-in-duration` | `4000ms` | Circle-rise animation (hover in) |
| `--button-hover-out-duration` | `550ms` | Circle fill opacity fade (hover out) |
| `--button-text-color-duration` | `0.5s` | Button label color transition |
| `--button-dissolve-duration` | `450ms` | Dissolve hover crossfade |

## Global application (Option 2)

Brand button styles apply automatically via Dawn class mapping:

| Dawn / markup class | Maps to | Default hover |
|---------------------|---------|---------------|
| `.button--primary` | Filled black | Circle in + fade out |
| `.button--secondary` | Filled white | Circle in + fade out |
| Plain `.button` (no variant) | Filled black | Circle in + fade out |
| `.button--stroke-black` / `.button--stroke-white` | Stroke variants | Circle in + fade out |
| `.button--hover-dissolve` | Opt-out of circle | Dissolve crossfade |
| `.button--tertiary` | Utility/minimal (unchanged Dawn role) | Subtle |
| `.button--filter` | Filter trigger | Dissolve (gris-medio fill) |

Explicit `.button--filled-*` classes still work but are optional for primary/secondary.

**Circle hover** is the default for all filled and stroke CTAs. Use `.button-label` on label text (or rely on `component-buttons.js` auto-wrap for plain text buttons).

## Filled vs Stroke (Figma)

Both are **implemented in CSS**:

| Figma type | CSS class | Status |
|------------|-----------|--------|
| CTA Filled (black/white) | `.button--filled-black`, `.button--filled-white` | Auto via `.button--primary` / `.button--secondary` |
| Stroke (outline black/white) | `.button--stroke-black`, `.button--stroke-white` | CSS ready; add class manually or via future Theme Editor setting |

Theme Editor **Outline style** checkbox (Dawn `button_style_secondary_*`) maps to Jane stroke via `snippets/cta-button-class.liquid`:

| Section context | Outline stroke |
|-----------------|----------------|
| Image banner, slideshow (hero) | `.button--stroke-white` |
| Rich text, image with text, multirow | `.button--stroke-black` |
| Unchecked / Solid | `.button--primary.button--filled-black` |

Dawn `.button--secondary` without an explicit variant still maps to **filled white** (e.g. cart, PDP dynamic checkout) — do not use it for outline CTAs.

## Stylesheets

| File | Scope |
|------|-------|
| `assets/component-buttons.css` | Button variants, hover modifiers, link buttons |
| `assets/component-buttons.js` | Auto-wraps plain text in `.button-label` for circle hover stacking |
| `assets/component-form-fields.css` | `.field--labeled-top` form pattern |
| `assets/component-product-variant-picker.css` | Text variant pills |
| `assets/component-swatch-input.css` | Image variant swatches (product form) |
| `assets/component-accordion.css` | `.accordion--unfolding` modifier |

Loaded globally from `layout/theme.liquid` (buttons + form fields).

## Button variants

All variants extend Dawn `.button`. Combine with a hover modifier (see below).

| Class | Default | Hover | Disabled |
|-------|---------|-------|----------|
| `.button--filled-white` | White bg, negro text | Opposite fill via circle (negro), white text | Gris-medio bg, gris-oscuro text |
| `.button--filled-black` | Negro bg, white text | Opposite fill via circle (white), negro text | Same as filled-white disabled |
| `.button--stroke-white` | Transparent, white border + text | White fill via circle, negro text | Gris-oscuro border + text |
| `.button--stroke-black` | Transparent, negro border + text | Negro fill via circle, white text | Gris-oscuro border + text |
| `.button--filter` | White bg, negro border, filter icon | Gris-medio bg | Uses CTA disabled styles |

### Link buttons

| Class | Size | Behavior |
|-------|------|----------|
| `.link-button--16` | 16px / 20px LH | Underlined default; no underline on hover |
| `.link-button--14` | 14px / 18px LH | Same |

## Hover modifiers

Per Figma and merchant direction: **all filled and stroke CTAs** use circle-rise on hover in and opacity fade on hover out.

| Class | Effect | Used on |
|-------|--------|---------|
| *(default)* | **Hover in:** circle rise (`--button-hover-in-duration`). **Hover out:** circle fill opacity fade (`--button-hover-out-duration`). **Text:** color only, 0.5s | Primary, secondary, filled, stroke, plain `.button` |
| `.button--hover-dissolve` | Color/border crossfade (~450ms) — opt-out only | Filter trigger (`.button--filter`) |

`prefers-reduced-motion: reduce` disables circle transform; instant color swap only.

### Example markup

```liquid
{%- comment -%} Hero CTA — circle is default {%- endcomment -%}
<a class="button button--primary button--filled-black" href="...">
  <span class="button-label">Comprar</span>
</a>

{%- comment -%} Stroke cancel {%- endcomment -%}
<button class="button button--stroke-black">
  <span class="button-label">{{ 'customer.addresses.cancel' | t }}</span>
</button>

{%- comment -%} Filter trigger (dissolve opt-out) {%- endcomment -%}
<span class="mobile-facets__open button button--filter button--hover-dissolve">...</span>
```

## Form fields

Jane uses **static label above** the input via `.field--labeled-top`. Dawn floating labels remain the fallback when this class is absent.

```liquid
<div class="field field--labeled-top">
  <label class="field__label" for="ContactForm-email">Email</label>
  <input class="field__input" id="ContactForm-email" type="email" placeholder="Email">
</div>
```

| State | Border |
|-------|--------|
| Default | 0.5px `#696969` |
| Hover / focus / filled | 0.5px `#1a1919` |

Applied globally on: contact form, customer login/register/addresses/activate/reset-password.

**Newsletter** keeps Dawn inline field layout (arrow submit inside field).

## Variant pills & image swatches

**Text pills** (`.product-form__input--pill`):

- Default: `#f3f3f3` bg, 14px regular, sentence case, 4px radius
- Mobile padding: 8px / 4px; desktop: 16px / 8px
- Hover/selected: `#e6e2dd`
- Disabled: `#b4b4b4` bg, `#f3f3f3` text

**Image swatches** (`.product-form__input--swatch`):

- 56×56px container, 4px radius
- Selected/hover: 0.5px negro outline
- Disabled: 40% opacity

## Accordions

Use `.accordion--unfolding` on PDP collapsible tabs and collapsible content sections:

- 18px medium title, negro text
- Bottom border only (0.5px negro)
- 12px chevron (rotates on open)
- Body: 14px regular

Decorative block icons are hidden when the unfolding modifier is present.

## Theme Editor coexistence

Brand button CSS uses fixed radii and disables Dawn button pseudo-element hover on branded button classes. Recommended merchant settings (document only — do not edit `settings_data.json` unless requested):

- Button corner radius: 8px
- Button shadow: off
- Input corner radius: 4px

## Prototype QA

Circle timing/easing should be verified against [JANÉ — Mockups interno prototype](https://www.figma.com/proto/uPsucGoVngtsssbY35WpNi/JAN%C3%89---Mockups-interno?node-id=6170-156434) when file access is available.

## QA checklist

- [ ] Each button variant: default, hover, disabled, focus-visible (desktop + mobile)
- [ ] PDP add-to-cart: circle hover
- [ ] Product card CTA: dissolve hover
- [ ] Filter button on collection (mobile drawer)
- [ ] Variant pills: default, selected, disabled, keyboard
- [ ] Image swatches: 56px, border on selected
- [ ] Contact + customer forms: labeled-top pattern
- [ ] Accordions: open/close, keyboard, screen reader
- [ ] `prefers-reduced-motion`: circle buttons degrade gracefully
- [ ] `shopify theme check`
