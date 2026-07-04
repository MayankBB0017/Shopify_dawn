---
last_analyzed: 2026-07-04
figma_whiteboard: https://www.figma.com/design/uPsucGoVngtsssbY35WpNi/JAN%C3%89---Mockups-interno?node-id=6111-70977
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/instagram-grid.liquid
---

# Instagram Grid — Implementation Reference

> **Purpose:** Document what is **built and shipped** in this theme for the Instagram grid section (*BloqueRrss*). Use this when maintaining, debugging, or extending the section.
>
> **Original build brief:** [jane-instagram-grid.md](../ai-agent-prompts/jane-instagram-grid.md) (agent prompt — design spec and Figma targets)

**Naming:** Theme Editor and preset use **Instagram grid**. Code uses `instagram-grid` / `sections.instagram_grid` — **no `jane` prefix** in filenames, CSS namespace, or locale keys (per project convention).

---

## Summary

Instagram-style masonry grid: linked handle heading, image/video tiles, **Ver más** CTA. Two content modes:

| Mode | Behaviour |
|------|-----------|
| **Manual** | Up to **8 post blocks** (6 images + 2 videos). Desktop uses fixed **5-column** masonry; layout follows block order automatically. |
| **App** | Renders `@app` blocks only (Instagram feed apps). Manual grid hidden. |

**Key behaviours shipped:**

- Desktop **5-col** masonry (fixed); mobile always **2-col** — slot maps assign tiles by block order
- **Container width** standard (`page-width`) or full (max 1440px / 144rem)
- **Slot assignment** by block order (1–8) with `tile_size: auto`; videos force tall when `media_type: video`
- **Dual masonry markup** — desktop + mobile columns in DOM; CSS shows one set per breakpoint
- **Scroll fade-in** (JANÉ hero banner pattern): stage fade + staggered tiles; explicit video `.play()` after reveal
- **Video tiles** — Shopify-hosted `video_tag`, poster fallback, height aligned to two square rows + gap
- **Placeholder images** — `object-fit: cover`, fill tile; cycle `hero-apparel-1/2/3`
- Profile/CTA URLs fallback to `settings.social_instagram_link` when blank

**Does not include:** live Instagram API sync, hover play-icon overlay, homepage template preset in `templates/index.json` (add via Theme Editor).

---

## File map

| File | Role |
|------|------|
| `sections/instagram-grid.liquid` | Section markup, schema, preset, asset loading |
| `snippets/instagram-grid-masonry.liquid` | Column bucketing + tile loop per layout variant |
| `snippets/instagram-grid-tile.liquid` | Single image/video tile, link, a11y, placeholders |
| `assets/section-instagram-grid.css` | Masonry layout, container, fade, tile/video styles |
| `assets/instagram-grid.js` | `<instagram-grid>` web component — scroll fade + video play |
| `locales/en.default.json` | `sections.instagram_grid.*` storefront strings |
| `locales/en.default.schema.json` | Schema `t:` labels |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [jane-instagram-grid.md](../ai-agent-prompts/jane-instagram-grid.md) | Original Figma spec |
| [jane-hero-banner.md](./jane-hero-banner.md) | Fade-in animation pattern reference |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | Merchant image upload guidance |
| [javascript-guidelines.md](./javascript-guidelines.md) | Web component patterns |
| [liquid-guidelines.md](./liquid-guidelines.md) | Schema and `{% render %}` rules |

---

## DOM structure

```
<section class="shopify-section section">
  <instagram-grid id="InstagramGrid-{id}"
    class="instagram-grid instagram-grid--layout-5
           instagram-grid--container-{standard|full}
           instagram-grid--source-{manual|app}
           instagram-grid--fade-in-desktop
           instagram-grid--fade-in-mobile
           instagram-grid--fade-visible [design mode]
           color-{scheme} gradient
           [instagram-grid--hide-desktop|mobile]">

    <div class="instagram-grid__stage">
      <div class="instagram-grid__shell [page-width]">

        <header class="instagram-grid__header instagram-grid__animate">
          <div class="instagram-grid__animate-inner">
            [optional linked h2 heading]
          </div>
        </header>

        <!-- manual mode -->
        <div class="instagram-grid__grid">
          <div class="instagram-grid__columns instagram-grid__columns--desktop">…</div>
          <div class="instagram-grid__columns instagram-grid__columns--mobile">…</div>
        </div>

        <!-- app mode -->
        <div class="instagram-grid__app">…@app blocks…</div>

        <footer class="instagram-grid__footer instagram-grid__animate instagram-grid__animate--footer">
          <div class="instagram-grid__animate-inner">
            <a class="instagram-grid__cta link underlined-link">Ver más</a>
          </div>
        </footer>

      </div>
    </div>
  </instagram-grid>
</section>
```

Each masonry column is `instagram-grid__column`; tiles are `instagram-grid__tile` (`--square` / `--tall`, `--video`, `--animate`).

---

## Layout

### Breakpoints

| Viewport | Layout | CMS |
|----------|--------|-----|
| Desktop ≥ 750px | 5-col masonry | Fixed (block order drives slots) |
| Mobile < 750px | 2-col masonry | Fixed |

Both desktop and mobile masonry are rendered in Liquid; CSS toggles visibility:

- `.instagram-grid__columns--desktop` — `display: none` mobile, flex desktop
- `.instagram-grid__columns--mobile` — flex mobile, `display: none` desktop

### Desktop 5-column (Figma default)

| Column | Width | Tiles (top → bottom) | Block order |
|--------|-------|----------------------|-------------|
| 1 | 248px | Square + Square | 1, 2 |
| 2 | 284px | **Tall** (video) | 3 |
| 3 | 248px | Square + Square | 4, 5 |
| 4 | 284px | **Tall** (video) | 6 |
| 5 | 248px | Square + Square | 7, 8 |

Visual: `[img][img] | [video] | [img][img] | [video] | [img][img]`

### Mobile 2-column

| Block | Column | Size |
|-------|--------|------|
| 1 | Left | square |
| 2 | Right | square |
| 3 | Left | tall (video) |
| 4 | Left | square |
| 5 | Right | square |
| 6 | Right | tall (video) |
| 7 | Left | square |
| 8 | Right | square |

| Column | Pattern (top → bottom) |
|--------|------------------------|
| **Left** | Square · Tall · Square · … |
| **Right** | Square · Square · Tall · … |

Works with the **same 8-block preset** (videos at blocks 3 and 6) used for both desktop layouts.

### Figma dimensions (CSS tokens)

| Token | Value | Use |
|-------|-------|-----|
| `--ig-square-5` | 24.8rem (248px) | 5-col square columns |
| `--ig-tall-w-5` | 28.4rem (284px) | 5-col video columns |
| `--ig-tall-h-5` | 50.4rem (504px) | 5-col tall tile (= 2×248 + 8px gap) |
| `--ig-col-gap` | 0.8rem (8px) | Column gap desktop |
| `--ig-row-gap-desktop` | 0.8rem | Row gap within column |
| `--ig-row-gap-mobile` | 0.7rem (7px) | Row gap mobile |
| `--ig-square-mobile` | 16.8rem (168px) | Mobile column width |
| `--ig-tall-h-mobile` | 29.9rem (299px) | Mobile tall tile (Figma) |
| `--ig-section-max-width` | 144rem (1440px) | Full-width shell max |
| `--ig-radius` | 0.8rem (8px) | Tile border radius |

### Tall tile height (column alignment)

Tall video tiles must match **two square tiles + row gap** in adjacent image columns (not a fixed aspect ratio on equal-width 4-col columns):

```css
/* 5-column full width */
height: var(--ig-tall-h-5); /* 504px = 2×248 + 8px gap */

/* 5-column standard (page-width) — 100cqw = masonry grid width */
height: calc((100cqw - 4 * var(--ig-col-gap)) * 496 / 1312 + var(--ig-row-gap-desktop));
```

---

## Container width

| Setting | Modifier class | Shell behaviour |
|---------|----------------|-----------------|
| **Full width** (default) | `instagram-grid--container-full` | Max width 144rem, centered; mobile horizontal padding 16px |
| **Standard** | `instagram-grid--container-standard` + `page-width` on shell | Theme page width + Dawn horizontal padding |

**5-column + standard:** square/tall columns use proportional flex (`248` / `284` basis) so the grid fits inside `page-width`. Tall tile height uses a **container query** (`100cqw` on `.instagram-grid__grid`) so it equals two square rows + gap — avoids collapsed video tiles when nested `%` calcs fail.

Liquid defaults to **full width** when `container_width` is unset (existing sections before setting was added).

---

## Slot assignment (`instagram-grid-masonry.liquid`)

1. Filter blocks: `section.blocks | where: 'type', 'post'`
2. Loop block order 1–8; map to `slot_col` + `slot_size` via `case` on `layout_variant` (`five_columns` | `mobile`)
3. Overrides:
   - `tile_size: square` or `tall` — use block setting
   - `tile_size: auto` + `media_type: video` — force `tall`
4. Render tile into matching column only (`slot_col == col_idx`)

First two blocks use `loading: eager`; rest `lazy`.

---

## Video tiles (`instagram-grid-tile.liquid`)

| Feature | Implementation |
|---------|----------------|
| Source | Shopify-hosted video picker → `video_tag` |
| Playback | `autoplay`, `loop`, `muted`, `playsinline`, `controls: false`, `preload: metadata` |
| Poster | `video_poster` block setting → else `video.preview_image` → optional image tag |
| `image_size` | `800x` on `video_tag` for built-in poster frame |
| CSS | `position: absolute; inset: 0; object-fit: cover` (same as images) |
| JS | `playTileVideos()` after fade reveal (browsers block autoplay while `opacity: 0`) |
| Reduced motion | CSS hides `<video>`, shows poster only |

---

## Scroll fade-in animation

Matches **JANÉ hero banner** (`jane-hero-banner.js` / `section-jane-hero-banner.css`):

| Layer | Class | Behaviour |
|-------|-------|-----------|
| Stage | `instagram-grid__stage` | Whole section fades up (`opacity` + `translateY(2rem)`) over 0.6s when intersecting |
| Header / CTA | `instagram-grid__animate` + `--animate-inner` | Fade 0.15s after stage |
| Tiles | `instagram-grid__tile--animate` | Staggered fade, delay `0.15s + (order - 1) × 0.1s` via `--reveal-order` |
| Footer | `instagram-grid__animate--footer` | After last tile (~0.95s delay) |

**Web component:** `assets/instagram-grid.js` — `customElements.define('instagram-grid', InstagramGrid)`

- `IntersectionObserver` threshold `0.12` adds `instagram-grid--fade-visible`
- Only animates tiles in **visible** masonry (desktop vs mobile) via `getVisibleTiles()`
- `enable_fade_in_desktop` / `enable_fade_in_mobile` — default **true**; unset treated as enabled
- Theme Editor: `instagram-grid--fade-visible` applied in Liquid when `request.design_mode`
- `prefers-reduced-motion: reduce` — skip animation, show content immediately

---

## Section settings (16 + 1 info paragraph)

### Content

| ID | Type | Default | Notes |
|----|------|---------|-------|
| `content_source` | select | `manual` | `manual` \| `app` |
| `heading` | text | `@Janeproducts` | Linked when `profile_link` set |
| `profile_link` | url | — | Fallback `settings.social_instagram_link` |
| `heading_size` | select | `h2` | `h2` \| `h1` |
| `cta_label` | text | — | Fallback i18n `view_more` ("Ver más") |
| `cta_link` | url | — | Fallback `profile_link` |

### Layout

| ID | Type | Default | Notes |
|----|------|---------|-------|
| `container_width` | select | `full_width` | `standard` \| `full_width` |
| `show_on_desktop` | checkbox | true | Adds `instagram-grid--hide-desktop` when off |
| `show_on_mobile` | checkbox | true | Adds `instagram-grid--hide-mobile` when off |

### Animation

| ID | Type | Default |
|----|------|---------|
| `enable_fade_in_desktop` | checkbox | true |
| `enable_fade_in_mobile` | checkbox | true |

### Padding & color

| ID | Type | Default |
|----|------|---------|
| `padding_top_desktop` | range 0–100px | 48 |
| `padding_bottom_desktop` | range 0–100px | 48 |
| `padding_top_mobile` | range 0–100px | 32 |
| `padding_bottom_mobile` | range 0–100px | 32 |
| `color_scheme` | color_scheme | `scheme-1` |

### App mode info

| ID | Type | Notes |
|----|------|-------|
| `app_embed_info` | paragraph | `visible_if` content_source = app |

Section padding applied via `{% style %}` CSS variables on `#InstagramGrid-{{ section.id }}`.

---

## Block: `post` (limit 8)

| Setting | Type | Notes |
|---------|------|-------|
| `media_type` | select | `image` \| `video` |
| `image` | image_picker | When image |
| `video` | video | When video |
| `video_poster` | image_picker | Optional; falls back to video preview |
| `link` | url | Tile link; new tab |
| `alt_text` | text | Image alt / aria label source |
| `tile_size` | select | `auto` \| `square` \| `tall` — default `auto` |

**`@app` block** preserved for app mode (no limit on app blocks; `post` limited to 8).

### Preset

**Instagram grid** — 8 `post` blocks: blocks **3** and **6** = `video`, rest = `image`.

---

## CSS modifier classes

| Class | When |
|-------|------|
| `instagram-grid--layout-5` | Always applied — 5-column desktop masonry |
| `instagram-grid--container-standard` | `container_width: standard` |
| `instagram-grid--container-full` | `container_width: full_width` (default) |
| `instagram-grid--source-manual` | Manual grid |
| `instagram-grid--source-app` | App mode (hides manual grid) |
| `instagram-grid--hide-desktop` | `show_on_desktop: false` |
| `instagram-grid--hide-mobile` | `show_on_mobile: false` |
| `instagram-grid--fade-in-desktop` | Fade enabled desktop |
| `instagram-grid--fade-in-mobile` | Fade enabled mobile |
| `instagram-grid--fade-visible` | Scroll reveal active / design mode |

---

## i18n keys

**Storefront** (`locales/en.default.json` → `sections.instagram_grid`):

| Key | Default |
|-----|---------|
| `view_more` | Ver más |
| `view_post` | View Instagram post: {{ title }} |
| `view_video` | View Instagram video: {{ title }} |
| `empty_manual` | Add up to 8 post blocks… |
| `empty_app` | Add an Instagram app block… |

**Schema** (`locales/en.default.schema.json` → `sections.instagram_grid`): full labels for settings, blocks, preset name **Instagram grid**.

Non-English locale files may lack these keys (theme check warnings only).

---

## Accessibility

- Heading link: focus outline, opens profile in new tab
- Tiles with link: `aria-label` from `view_post` / `view_video` + title
- Masonry columns: `role="list"` / `role="listitem"`
- Video tiles: poster `alt=""` when decorative; meaningful `alt_text` on images
- Hover: tile opacity 0.92 (`@media (hover: hover)`)
- Reduced motion: no fade animation; video hidden, poster shown

---

## Theme Editor usage

1. **Add section** → **Instagram grid** preset
2. **Content source:** Manual — fill post blocks; App — add `@app` block from Instagram app
3. **Content source:** Manual — fill post blocks; App — add `@app` block from Instagram app
4. **Container width:** Full width vs Standard
5. **Animation:** Toggle fade per breakpoint
6. Assign images/videos to blocks **in order** — slot map uses block index 1–8
7. For videos: set block 3 and 6 to video (preset default) for correct desktop + mobile layout

---

## Maintenance notes

- **Do not edit** `config/settings_data.json` unless explicitly requested
- Desktop layout changes only affect `.instagram-grid__columns--desktop`; mobile slot map is independent
- After changing fade logic, test video autoplay on scroll (not only on load)
- Full-theme `shopify theme check` may OOM; check section files individually if needed

---

## Deferred / out of scope

- Live Instagram API / oEmbed sync
- Hover play-icon or Instagram branding overlay
- Homepage `templates/index.json` inclusion (merchant adds in Theme Editor)
- Non-English locale propagation for `instagram_grid` keys
- Section-level `max_blocks` (only `post` has `limit: 8` so `@app` blocks can coexist)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-04 | Initial section: manual 5/4-col desktop, 2-col mobile, 8 posts, app mode, preset |
| 2026-07-04 | Container width (standard / full); placeholder `object-fit: cover` |
| 2026-07-04 | Hero-style scroll fade-in (`instagram-grid.js`); staggered tile reveal; video play after reveal |
| 2026-07-04 | 4-column slot map aligned with first 4 cols of 5-column pattern |
| 2026-07-04 | Video tile CSS (absolute fill); poster + `preview_image` fallback; tall height = 2× square + gap |
| 2026-07-04 | 5-column standard container: proportional flex columns; 4-col width from grid `100%` |
| 2026-07-04 | Mobile slot map: left `sq·tall·sq`, right `sq·sq·tall` (blocks 4 & 6 column fix) |
| 2026-07-04 | Removed `desktop_layout` setting — desktop always 5-column; slots driven by block order |
| 2026-07-04 | Standard container: fix video tiles via `100cqw` tall height + scoped full-width column rules |
| 2026-07-04 | Full implementation reference doc (this file) |
