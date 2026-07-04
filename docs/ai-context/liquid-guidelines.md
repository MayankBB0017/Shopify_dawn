---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Liquid Guidelines

## Liquid Standards (This Project)

- Use `{%- liquid -%}` tags for multi-line assignments (see `layout/theme.liquid`)
- Whitespace control (`{%-` / `-%}`) used consistently in Dawn sections
- Snippet params passed explicitly: `{% render 'product-disclosures', product: product, surface: 'product_page' %}`
- Schema labels/names use `t:` translation keys throughout
- Dynamic sources in JSON templates: `"text": "{{ product.vendor }}"`
- No `{% include %}` usage found — project uses `{% render %}` exclusively

## Liquid Hard Rules

**These take precedence over existing project convention if the two conflict.**

- Use `{% render 'snippet', param: value %}` — **NEVER** `{% include %}`
- `{% render %}` creates isolated scope — pass all required variables explicitly as parameters
- No parentheses in `{% if %}` conditions — use nested `{% if %}` tags instead
- No ternary operator — always use `{% if %}...{% else %}...{% endif %}`
- `{% for %}` loops are limited to 50 iterations — use `{% paginate %}` for collections, products, articles, and other large arrays
- `contains` works with strings only — it does NOT work on objects inside arrays
- Product, collection, image, and other resource-based schema settings return actual objects, not handles
- Verify all Liquid tags, filters, objects, and schema properties against **live Shopify sources (Dev MCP server if available, otherwise shopify.dev)** before use — never guess, invent, or rely purely on training memory

## Snippets and Components

### Render Pattern

```liquid
{%- render 'card-product',
  card_product: product,
  show_vendor: section.settings.show_vendor,
  show_rating: section.settings.show_rating
-%}
```

### Key Reusable Snippets

| Snippet | Required Params |
|---------|-----------------|
| `product-disclosures` | `product`, optional: `heading`, `heading_size`, `open_by_default`, `surface` |
| `card-product` | `card_product`, optional: `show_vendor`, `show_rating`, `section_id` |
| `price` | `product`, `use_variant`, optional: `show_badges` |
| `buy-buttons` | `product`, `block`, `product_form_id` |
| `facets` | `results`, `enable_filtering`, `enable_sorting` |

### Metafield Access Patterns

```liquid
{%- assign disclosures = product.metafields.shopify.disclosure.value -%}
{%- for disclosure in disclosures -%}
  {%- assign surfaces = disclosure.display_preferences.value.surfaces -%}
  {%- if surfaces contains disclosure_surface -%}
    {{ disclosure.content | metafield_tag }}
  {%- endif -%}
{%- endfor -%}
```

Reviews metafield pattern (Shopify Product Reviews standard):

```liquid
{%- if product.metafields.reviews.rating.value != blank -%}
  {%- assign decimal = product.metafields.reviews.rating.value.rating | modulo: 1 -%}
{%- endif -%}
```

## Schema Standards

- Settings grouped logically in schema JSON arrays
- Use `t:sections.*` and `t:settings_schema.*` translation keys for `name` and `label`
- Include `"presets"` on every section so merchants can add from Theme Editor
- Block types use descriptive IDs; `@app` type preserved for app compatibility
- `enabled_on` / `disabled_on` restrict section availability (e.g., disclosures → product only)
- Color scheme settings: `"type": "color_scheme"` with `"default": "scheme-1"`

### Schema i18n Requirements

- Use `t:` translation keys in schema `"name"` and `"label"` fields
  - Example: `"label": "t:labels.heading"`, `"name": "t:sections.hero.name"`
- Add corresponding translation keys to `locales/en.default.json` and `locales/en.default.schema.json`
- Include presets on every section and block so merchants can add them from the Theme Editor

## LiquidDoc Requirements

- All snippets **should** include a `{% doc %}` header with `@param` and `@example`
- Currently only `snippets/unit-price.liquid` has LiquidDoc — **add `{% doc %}` to all new snippets**
- Static blocks rendered via section schema should document params in snippet headers

Example (from this project):

```liquid
{%- doc -%}
  Renders the unit price, including its measurement.
  @param {object} price - The unit price (money or string).
  @param {object} measurement - The unit_price_measurement object.
  @example
  {% render 'unit-price', price: variant.unit_price, measurement: variant.unit_price_measurement %}
{%- enddoc -%}
```

## Security and Reliability

- Output escaping: use `| escape` for user-generated content in attributes (`page_description | escape`)
- Use `| default:` filters for optional params (`surface | default: 'product_page'`)
- Blank checks before rendering: `{%- unless disclosures_content == blank -%}`
- Capture pattern for conditional section output (see `disclosures.liquid`)

## Performance Considerations

- Use `{%- capture -%}` to avoid rendering empty sections
- Lazy-load disclosure images: `loading="lazy"` with responsive `srcset`
- Avoid `all_products` — not used in this project
- Collection grids paginate via section settings + Shopify pagination
- Minimize nested loops in disclosure rendering (single loop with capture accumulation)

## Shopify Liquid Anti-Patterns

**Never use:**

```liquid
{% include 'snippet' %}
```

**Use instead:**

```liquid
{% render 'snippet' %}
```

**Never use deprecated:**

```liquid
img_url
img_tag
```

**Prefer:**

```liquid
image_url
image_tag
```

(This project has zero `img_url`/`img_tag` usage — maintain this.)

**Never:**

- Invent Shopify Liquid objects, filters, tags, schema properties, or APIs
- Assume functionality exists without verification against live Shopify sources

**Avoid:**

- Excessive nested loops
- Excessive render chains
- `all_products` abuse
- Unpaginated large collections
- Repeated expensive calculations in loops

Use pagination when appropriate.

## Block Wrapper Requirement

Every block's top-level HTML element must include:

```liquid
<div ... {{ block.shopify_attributes }}>
```

Verified in: `main-product.liquid`, `rich-text.liquid`, `product-disclosures.liquid`, `buy-buttons.liquid`, and others.
