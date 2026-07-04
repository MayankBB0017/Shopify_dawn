---
last_analyzed: 2026-07-03
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
---

# Shopify Development Rules

## General Rules

- Prefer native Shopify functionality first
- Reuse existing Dawn sections/snippets before creating new ones
- Follow existing architecture patterns (external assets, pubsub, web components)
- Avoid duplicate code — extend snippets with params
- Maintain merchant configurability via schema settings
- Preserve backwards compatibility with Theme Editor saved state
- Keep sections, blocks, and snippets reusable
- Avoid hardcoded business content — use settings, metafields, dynamic sources
- Prefer maintainability over quick fixes

## Precedence Rules (Conflict Resolution)

When "match existing project patterns" and "follow Shopify non-negotiable rules" conflict, resolve in this order:

1. **Non-Negotiable Shopify Rules** (below) always win — correctness and platform compatibility
2. **Live Shopify source validation** (Dev MCP / shopify.dev) wins over generated docs when they conflict
3. **Existing project naming/organizational conventions** win for stylistic choices not covered by #1 or #2
4. If legacy code violates a non-negotiable rule, follow the rule for new/modified code and flag legacy usage — do not mass-refactor unrelated legacy code without being asked

## Merchant-First Development Principle

Build for merchants using the Shopify Theme Editor, not developers editing code.

**Prioritize:** configurability, Theme Editor usability, accessibility, performance, maintainability, scalability

**Prefer:** theme settings, dynamic sources, metafields, metaobjects, reusable sections/blocks

**Avoid:** hardcoded business content, developer-only workflows, manual code updates for merchant-managed content

## Non-Negotiable Shopify Rules

### Liquid

- Use `{% render %}` — NEVER `{% include %}`
- Pass all required variables explicitly to `{% render %}`
- No parentheses in `{% if %}` conditions
- No ternary operator
- Use `{% paginate %}` for large arrays/collections (more than 50 items)
- `contains` works with strings only
- Use `image_url` + `image_tag` — NOT deprecated `img_url` / `img_tag`
- Never invent Liquid objects, filters, tags, schema properties, or APIs
- Verify against live Shopify sources (Dev MCP server if available, otherwise shopify.dev) before use

### Layout

- Keep `{{ content_for_header }}` in `<head>`
- Keep `{{ content_for_layout }}` in `<body>`

### Schema and Theme Editor

- Every section/block MUST have valid `{% schema %}` JSON
- Every block wrapper MUST include `{{ block.shopify_attributes }}` on its top-level HTML element
- Include presets so merchants can add sections/blocks in the Theme Editor
- Use `t:` keys in schema name/label fields
- Do NOT edit `config/settings_data.json` unless explicitly requested
- Preserve `"type": "@app"` support unless explicitly requested

### i18n

- ALL customer-facing and merchant-facing strings MUST use `{{ 'key' | t }}`
- Update `locales/en.default.json` when adding new text
- Use hierarchical snake_case translation keys

### CSS and JS

- Prefer `{% stylesheet %}` and `{% javascript %}` in sections, blocks, and snippets
- Liquid is NOT rendered inside `{% stylesheet %}` or `{% javascript %}`
- Use `{% style %}` for Theme Editor live-updating settings
- Single dynamic property → CSS variable; multiple properties → CSS classes

### Theme Blocks

- This project uses Dawn-style section-scoped blocks (no `/blocks/` folder)
- Add `{% doc %}` to new snippets and static blocks

### Accessibility

- Target WCAG 2.1 AA as baseline
- Validate against axe-core and/or Lighthouse accessibility scoring before considering a feature complete
- Manual keyboard-navigation check for any new interactive component

### Performance

- Lazy-load images where appropriate
- Use responsive `image_url` widths
- Avoid `all_products` in loops
- Paginate large lists
- Minimize unnecessary global JS/CSS

### Workflow

- Analyze real project before coding
- Reuse before creating
- Match existing theme patterns — unless they conflict with a rule in this section
- Minimal diffs only
- Use `shopify theme dev` and `shopify theme check` where applicable
- Run `shopify theme check` in CI/pre-push where configured; treat failures as merge-blocking, not advisory

### Documentation Integrity

- Verify claims in generated docs against live Shopify sources when the doc is stale (>90 days) or when platform-specific behavior is in question
- Never silently trust a generated doc over live/current Shopify documentation

### Scope

- Theme customization = Liquid/storefront
- App/extension work = TOML/GraphQL/Polaris
- Do not mix scopes incorrectly

## Internationalization (i18n) Rules

```liquid
{{ 'key' | t }}
```

- Use locale files for translatable content
- Avoid hardcoded customer-facing strings
- Preserve multi-language compatibility
- Update locale files whenever new customer-facing text is introduced
- Use hierarchical snake_case translation keys (max ~3 levels)
- Use `t:` translation keys in schema `"name"` and `"label"` fields
- Update `locales/en.default.json` and `locales/en.default.schema.json` for new translatable text

## Merchant Configuration Protection

**Never modify `config/settings_data.json` unless explicitly requested.**

Preserve merchant settings, Theme Editor data, and existing configurations. Document any impact before implementation.

## Shopify Validation Requirements

Validate before completing work:

- Theme Check (`shopify theme check`)
- Shopify CLI compatibility
- Theme Editor compatibility (block drag/drop, settings live preview)
- Online Store 2.0 compatibility
- Liquid syntax
- Schema syntax
- Dynamic sources
- Metafields / metaobjects usage

Implementation is not complete until validation has been performed.

## Development Commands

```bash
shopify theme dev      # Local development and preview
shopify theme check    # Lint and validate theme
shopify theme pull     # Sync merchant Theme Editor changes before push
shopify theme push     # Deploy (pull first to avoid overwriting merchant changes)
```

## CI / Automated Validation

**Status: Not configured** — no `.github/workflows/`, no pre-push hooks, no `.theme-check.yml` found.

Recommendation: Add GitHub Actions workflow running `shopify theme check` on PR — logged in [project-patterns.md](./project-patterns.md).

## Feature Planning and Requirement Validation

For new features, enhancements, integrations, refactors, new sections/blocks/templates, and custom business logic:

1. Analyze requirements
2. Review documentation (check freshness)
3. Review existing files
4. Identify reuse opportunities
5. Validate Shopify compatibility against live sources
6. Create an implementation plan
7. Ask clarification questions if needed

**Planning exceptions** (small, low-risk, fully-defined): typo fixes, single schema setting additions, minor CSS adjustments, small bug fixes with clear scope. Even for small requests, follow all Liquid, schema, i18n, Theme Editor, accessibility, and performance rules.

### Required Planning Output

**Requirement Summary:** user request, expected outcome, business objective

**Impact Analysis:** files, sections, blocks, snippets, templates, assets, Theme Editor, accessibility, performance

**Implementation Plan:** Analysis → Design → Implementation → Testing and Verification

## Token Efficiency

- Read only relevant files and documentation
- Reuse existing project context from `/docs/ai-context/`
- Avoid unnecessary file creation
- Prefer phased implementation for large tasks
- Keep generated docs lean

## Code Review Checklist

Before completing work verify:

- [ ] Architecture consistency with Dawn patterns
- [ ] No duplicate functionality
- [ ] Accessibility reviewed
- [ ] Performance reviewed
- [ ] Mobile responsiveness reviewed
- [ ] Theme Editor compatibility verified
- [ ] Merchant configurability preserved
- [ ] Shopify standards followed
- [ ] Theme Check compatibility maintained
- [ ] Existing reusable functionality evaluated
- [ ] `@app` block support preserved
- [ ] Locale files updated for new strings
- [ ] `standard-actions-override.js` cart contract not broken (if touching cart)
