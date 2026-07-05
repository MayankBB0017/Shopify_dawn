---
last_analyzed: 2026-07-05
figma_tech_frame: https://www.figma.com/design/2Lky42wdzU7ulW1LR4FvW1/JANE---COPY?node-id=2-19971
theme_api_version: Dawn 15.5.0 / Shopify OS 2.0
section_file: sections/video.liquid
---

# JANÉ Video Section — Implementation Reference

> **Purpose:** Document what is **built and shipped** for the customized Dawn **Video** section. Use this when maintaining, extending, or debugging PDP product video.
>
> **Original build brief:** [jane-video-section.md](../ai-agent-prompts/jane-video-section.md)

**Naming:** Theme Editor label **JANÉ Video section** (section + preset). Preset category **JANÉ Custom Sections**. Code namespace stays Dawn-compatible: `sections/video.liquid`, `.video-section`, `sections.video` — **no `jane-` prefix** in filenames or CSS. Template JSON type remains `"type": "video"`.

---

## Summary

Click-to-play product video block for **PDP** (primary use). Merchants upload separate desktop/mobile assets; section height, container, heading, padding, and corner radius are Theme Editor configurable.

| Behaviour | Detail |
|-----------|--------|
| Playback | Click poster → play via Dawn `deferred-media` (`assets/global.js`) |
| Dual source | Desktop + mobile Shopify video / YouTube / Vimeo / poster, with fallback chains |
| Play button | **40×40px** centered — scoped under `.video-section` (gallery keeps Dawn 62px) |
| Aspect ratio | Default **adapt** — height from poster/video ratio; optional fixed heights |
| Container | **Full width** (default) or **Standard** (`page-width`) |
| Border radius | **Standard container only** — 0–40px on video media |
| Fade-in | JANÉ `IntersectionObserver` via `<video-section>` custom element |
| Theme Editor preview | Placeholder media + fade replay in Add section popup |
| Backward compatible | Legacy `full_width` checkbox + single `padding_top`/`padding_bottom` still read |

**Does not include:** Hero banner autoplay, product gallery changes, new section type/file.

---

## File map

| File | Role |
|------|------|
| `sections/video.liquid` | Section markup, schema, preset, media resolution, layout branching |
| `snippets/video-section-media.liquid` | One deferred-media (or placeholder) block per breakpoint |
| `assets/video-section.css` | Layout, height modes, play button, fade-in, border radius |
| `assets/video-section.js` | `<video-section>` — scroll fade + Theme Editor replay |
| `assets/component-deferred-media.css` | Global deferred-media styles (unchanged) |
| `assets/global.js` | `DeferredMedia` web component (unchanged) |
| `locales/en.default.json` | `sections.video.load_video`, `sections.video.empty`, `sections.video.placeholder` |
| `locales/en.default.schema.json` | JANÉ branding, CMS labels, upload guidance |

### Related guidelines

| Doc | Use when |
|-----|----------|
| [jane-video-section.md](../ai-agent-prompts/jane-video-section.md) | Original Figma spec and acceptance criteria |
| [image-aspect-ratio-guidelines.md](./image-aspect-ratio-guidelines.md) | PDP video upload specs (16:9 / 9:16) |
| [jane-hero-banner.md](./jane-hero-banner.md) | Height mode naming reference (`adapt`, `fit_screen`, etc.) |
| [highlighted-product.md](./highlighted-product.md) | Container width + border radius pattern |
| [javascript-guidelines.md](./javascript-guidelines.md) | Web component conventions |
| [liquid-guidelines.md](./liquid-guidelines.md) | Schema / `{% render %}` rules |

---

## Theme Editor

**Add section path:** JANÉ Custom Sections → **JANÉ Video section**

**Preset defaults:**

| Setting | Preset value |
|---------|--------------|
| `container_width` | `full_width` |
| `heading` | Product video |
| `heading_alignment_desktop` / `heading_alignment_mobile` | center |
| `height_desktop` / `height_mobile` | adapt |
| `padding_top_desktop` / `padding_top_mobile` | 0 |
| `padding_bottom_desktop` | 32 |
| `padding_bottom_mobile` | 24 |

Not auto-added to `templates/product.json` — merchant adds via Theme Editor.

---

## DOM structure

### Full width container (default)

Heading sits in `page-width`; video spans edge-to-edge.

```
<section class="shopify-section section">
  <video-section id="VideoSection-{id}"
    class="video-section-wrapper
           video-section-wrapper--container-full
           video-section-wrapper--height-desktop-{mode}
           video-section-wrapper--height-mobile-{mode}
           video-section-wrapper--fade-in-desktop
           video-section-wrapper--fade-in-mobile
           [video-section-wrapper--fade-visible]">

    <div class="color-{scheme} gradient">
      <div class="video-section video-section--container-full isolate">

        <div class="video-section__header-shell page-width">  <!-- if heading set -->
          <header class="video-section__header
                         video-section__header--desktop-{left|center|right}
                         video-section__header--mobile-{left|center|right}">
            <h2 class="title …">…</h2>
          </header>
        </div>

        <div class="video-section-wrapper__stage">
          <deferred-media class="video-section__media video-section__media--mobile …">…</deferred-media>
          <deferred-media class="video-section__media video-section__media--desktop …">…</deferred-media>
        </div>

      </div>
    </div>
  </video-section>
</section>
```

### Standard container

Heading + video both inside `page-width` shell.

```
<video-section class="video-section-wrapper video-section-wrapper--container-standard …">
  …
  <div class="video-section video-section--container-standard">
    <div class="video-section__shell page-width">
      <header class="video-section__header …">…</header>
      <div class="video-section-wrapper__stage">
        <deferred-media class="video-section__media …">…</deferred-media>
      </div>
    </div>
  </div>
</video-section>
```

CSS shows `--mobile` below **750px** and `--desktop` at ≥750px.

---

## CMS settings (complete)

### Content

| ID | Type | Default | Notes |
|----|------|---------|-------|
| `heading` | inline_richtext | — | Preset: **Product video**. Hidden when blank. No empty schema default (Shopify restriction). |
| `heading_size` | select | h1 | Dawn heading sizes (h2–hxxl) |
| `heading_alignment_desktop` | select | center | left \| center \| right |
| `heading_alignment_mobile` | select | center | left \| center \| right |
| `enable_video_looping` | checkbox | false | Applies after click-to-play |
| `description` | text | — | Screen reader label + iframe `title` |

### Desktop video

| ID | Type | Notes |
|----|------|-------|
| `video` | video | Shopify-hosted. 16:9 recommended · 1920×1080 · MP4 H.264 · 10–30 s · &lt;10–15 MB |
| `video_url` | video_url | YouTube/Vimeo fallback when `video` empty |
| `cover_image` | image_picker | Poster override; falls back to `video.preview_image` |
| `height_desktop` | select | See [Section height](#section-height) |

### Mobile video

| ID | Type | Fallback |
|----|------|----------|
| `video_mobile` | video | → `video` |
| `video_url_mobile` | video_url | → `video_url` |
| `cover_image_mobile` | image_picker | → `video_mobile.preview_image` → `video.preview_image` → `cover_image` |
| `height_mobile` | select | Independent of desktop |

### Layout

| ID | Type | Default | Notes |
|----|------|---------|-------|
| `container_width` | select | `full_width` | `standard` \| `full_width` |
| `container_border_radius` | range | 8px | **0–40px, standard only** (`visible_if`) |
| `color_scheme` | color_scheme | scheme-1 | |

### Animation

| ID | Type | Default |
|----|------|---------|
| `enable_fade_in_desktop` | checkbox | true |
| `enable_fade_in_mobile` | checkbox | true |

### Padding (separate mobile/desktop)

| ID | Type | Default |
|----|------|---------|
| `padding_top_desktop` | range 0–100 | 0 |
| `padding_bottom_desktop` | range 0–100 | 32 |
| `padding_top_mobile` | range 0–100 | 0 |
| `padding_bottom_mobile` | range 0–100 | 24 |

---

## Media resolution (Liquid)

Resolved in `sections/video.liquid` before rendering snippets.

### Desktop poster

```
cover_image → video.preview_image
```

### Mobile poster chain

```
cover_image_mobile → video_mobile.preview_image → video.preview_image → cover_image
```

### Mobile video / URL chain

```
video_mobile → video
video_url_mobile → video_url
```

### Reverse fallback (mobile-only upload)

If desktop has no media but mobile does, desktop uses mobile sources so both breakpoints render.

### Empty storefront

No video on live store → section renders nothing (no placeholder).

### Theme Editor / Add section preview

When no video and `request.design_mode` or `request.visual_preview_mode`:

- Renders **placeholder** blocks (16:9 desktop, 9:16 mobile) with play icon
- Adds `video-section-wrapper--fade-visible` so fade-in does not hide preview

---

## Section height

Independent per breakpoint via `height_desktop` and `height_mobile`.

| Value | CSS class suffix | Behaviour |
|-------|------------------|-----------|
| `adapt` | `-adapt` | **Default.** `--ratio-percent` from poster aspect ratio (padding-bottom trick) |
| `fit_screen` | `-fit_screen` | `height: 100vh`; media `object-fit: contain` |
| `large` | `-large` | Fixed **770px** (`77rem`) |
| `medium` | `-medium` | Fixed **550px** (`55rem`) |
| `small` | `-small` | Fixed **400px** (`40rem`) |

Fixed heights set explicit `height` on `.video-section__media--{breakpoint}` and use `object-fit: cover` on poster/video/iframe.

**Placeholder aspect ratios** (Theme Editor only): desktop 56.25% (16:9), mobile 177.78% (9:16).

---

## Container width & border radius

| Mode | Video | Heading | Border radius |
|------|-------|---------|---------------|
| **Full width** | Edge-to-edge (`global-media-settings--full-width`) | `page-width` shell | Not applied (`--vs-container-radius: 0`) |
| **Standard** | Inside `page-width` shell with heading | Same shell | Applied via `--vs-container-radius` (default 8px) |

Border radius CSS targets `.video-section-wrapper--container-standard .video-section__media` (+ poster, video, iframe) with `overflow: hidden`.

---

## Snippet: `video-section-media.liquid`

| Param | Type | Purpose |
|-------|------|---------|
| `breakpoint` | string | `desktop` \| `mobile` |
| `video` | object | Resolved Shopify video |
| `video_url` | object | Resolved external URL |
| `poster` | image | Resolved poster |
| `section` | object | Section settings |
| `sizes` | string | Responsive `image_url` sizes |
| `alt` | string | Escaped poster button label |
| `container_full` | boolean | Adds `global-media-settings--full-width` |
| `show_placeholder` | boolean | Static placeholder block (no click) |

**Desktop poster:** includes `media--landscape` class.  
**Mobile poster:** omits `media--landscape` so portrait 9:16 is not forced to landscape.

**Playback template:** Shopify `video_tag` (autoplay + controls on play) or YouTube/Vimeo iframe — same as Dawn.

**Unique IDs:** `data-media-id="{video_id}-{breakpoint}"`, poster button `Deferred-Poster-{section.id}-{uid}`.

---

## Animations

| Layer | Implementation |
|-------|----------------|
| Scroll fade-in | `IntersectionObserver` threshold **0.12** → `video-section-wrapper--fade-visible` on `.video-section-wrapper__stage` |
| Breakpoint gate | `enable_fade_in_desktop` / `enable_fade_in_mobile` vs 750px |
| Theme Editor | `playFadeIn()` on load/select; detects `Shopify.designMode`, `shopify-design-mode`, `shopify-visual-preview-mode` |
| Liquid preview | `video-section-wrapper--fade-visible` when `design_mode` or `visual_preview_mode` |
| Click-to-play | Dawn `DeferredMedia` — poster hidden on `[loaded]` |
| Play hover | Scale 1.1 on `.deferred-media__poster-button:hover` |
| Reduced motion | Fade skipped; no autoplay until user click |
| Dawn scroll-trigger | Optional on heading when `settings.animations_reveal_on_scroll` |

---

## CSS variables (per section)

Set on `#VideoSection-{id} .video-section` via `{% style %}`:

| Variable | Source |
|----------|--------|
| `--vs-padding-top-mobile` | `padding_top_mobile` |
| `--vs-padding-bottom-mobile` | `padding_bottom_mobile` |
| `--vs-padding-top-desktop` | `padding_top_desktop` |
| `--vs-padding-bottom-desktop` | `padding_bottom_desktop` |
| `--vs-container-radius` | `container_border_radius` when standard; else `0` |

### Other CSS constants

| Token | Value |
|-------|-------|
| Play button | 4rem × 4rem |
| Play icon | 2.4rem |
| Aspect fallback | `--ratio-percent: 56.25%` when no poster |
| Breakpoint | 750px |
| Full bleed shadow | Removed on section deferred-media |

---

## Modifier classes (quick reference)

| Class | When |
|-------|------|
| `video-section-wrapper--container-standard` | `container_width: standard` |
| `video-section-wrapper--container-full` | `container_width: full_width` |
| `video-section-wrapper--height-desktop-{mode}` | Desktop height setting |
| `video-section-wrapper--height-mobile-{mode}` | Mobile height setting |
| `video-section-wrapper--fade-in-desktop` | Fade enabled desktop |
| `video-section-wrapper--fade-in-mobile` | Fade enabled mobile |
| `video-section-wrapper--fade-visible` | Revealed (scroll or editor) |
| `video-section__media--mobile` / `--desktop` | Breakpoint media swap |
| `video-section__media--placeholder` | Theme Editor empty state |
| `video-section__header--desktop-{align}` | Desktop heading alignment |
| `video-section__header--mobile-{align}` | Mobile heading alignment |

---

## Backward compatibility

| Legacy setting | Migration |
|----------------|-----------|
| `full_width: false` | Treated as `container_width: standard` when `container_width` unset |
| `full_width: true` | Treated as `container_width: full_width` |
| `padding_top` / `padding_bottom` | Fallback for desktop; mobile = ×0.75 when new keys unset |

Setting IDs `video`, `video_url`, `cover_image` unchanged — existing template JSON keeps working.

---

## Distinction from other video features

| Feature | Video section | Hero banner | Instagram grid | Product gallery |
|---------|---------------|-------------|----------------|-----------------|
| File | `video.liquid` | `jane-hero-banner.liquid` | `instagram-grid.liquid` | `main-product` media |
| Playback | Click-to-play | Autoplay muted loop | Autoplay muted tiles | Gallery UI |
| Play UI | 40px centered | Hidden | N/A | Thumbnail icons |
| Dual source | Yes | Yes | N/A | Per media item |

---

## Maintenance guide

| Change | Where to edit |
|--------|---------------|
| New CMS setting | `sections/video.liquid` schema + `locales/en.default.schema.json` |
| Media markup / fallback | `sections/video.liquid` (resolve) + `snippets/video-section-media.liquid` (render) |
| Container / heading layout | `sections/video.liquid` markup branch + `video-section.css` |
| Height behaviour | `video-section.css` under `.video-section-wrapper--height-*` |
| Play button size | `video-section.css` — `.video-section .deferred-media__poster-button` only |
| Fade-in / editor preview | `assets/video-section.js` + fade CSS in `video-section.css` |
| Storefront strings | `locales/en.default.json` → `sections.video.*` |
| Do **not** change | `assets/global.js` DeferredMedia, `component-deferred-media.css` global 62px button |

Before completing work: run `shopify theme check`. Do **not** edit `config/settings_data.json` unless explicitly requested.

---

## QA checklist

| Case | Expected |
|------|----------|
| Desktop 1440px, adapt, full width | 16:9 video, edge-to-edge, 40px play |
| Mobile 375px, adapt, full width | 9:16 video, heading alignment respected |
| Standard container | Video + heading in `page-width`; border radius visible |
| Full width container | Video edge-to-edge; heading in `page-width` |
| Height large/medium/small | Fixed px height, cover crop |
| Height fit_screen | 100vh, contain |
| Legacy desktop-only video | Mobile shows same asset |
| YouTube/Vimeo per breakpoint | Correct iframe per branch |
| Add section popup | Placeholder + fade visible |
| Product gallery play button | Still 62px (not affected) |
| `prefers-reduced-motion` | No fade; click-to-play only |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-05 | Initial JANÉ customization: dual breakpoint media, 40px play, fade-in, preset category |
| 2026-07-05 | Theme Editor placeholders + Add section preview fade |
| 2026-07-05 | Container width, heading alignment, separate padding, height modes |
| 2026-07-05 | Border radius (standard container only) |
| 2026-07-05 | Full implementation reference doc (this file) |
