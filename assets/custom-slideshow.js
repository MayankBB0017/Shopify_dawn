/**
 * assets/custom-slideshow.js
 *
 * <custom-slideshow> web component (vanilla JS, no dependencies).
 *
 * - "Page" = one dot. In Layout 2 a page shows two slides (or slides by one).
 * - Theme editor: a custom element is created again every time the section
 *   re-renders (shopify:section:load), so it initialises itself automatically.
 *   shopify:block:select jumps to the selected slide and pauses autoplay.
 */
if (!customElements.get('custom-slideshow')) {
  class CustomSlideshow extends HTMLElement {
    constructor() {
      super();

      this.page = 0;
      this.timer = null;
      this.hovering = false;
      this.focusInside = false;
      this.editorSelected = false;

      this.onMouseEnter = () => {
        this.hovering = true;
        this.stopAutoplay();
      };
      this.onMouseLeave = () => {
        this.hovering = false;
        this.startAutoplay();
      };
      this.onFocusIn = () => {
        this.focusInside = true;
        this.stopAutoplay();
      };
      this.onFocusOut = (event) => {
        this.focusInside = this.contains(event.relatedTarget);
        if (!this.focusInside) this.startAutoplay();
      };
      this.onVisibility = () => {
        if (document.hidden) this.stopAutoplay();
        else this.startAutoplay();
        this.syncVideos();
      };
      this.onBlockSelect = (event) => {
        const slide = event.target.closest('[data-cs-slide]');
        const index = this.slides.indexOf(slide);
        if (index < 0) return;

        this.editorSelected = true;
        this.stopAutoplay();
        this.goTo(this.pairMode ? Math.floor(index / 2) : index);
      };
      this.onBlockDeselect = () => {
        this.editorSelected = false;
        this.startAutoplay();
      };
      this.onDotsKeydown = this.onDotsKeydown.bind(this);
      this.syncVideos = this.syncVideos.bind(this);
    }

    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-cs-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-cs-dot]'));
      this.dotsWrap = this.querySelector('[data-cs-dots]');

      this.perView = parseInt(this.dataset.perView, 10) || 1;
      this.pageCount = parseInt(this.dataset.pages, 10) || 1;
      this.pairMode = this.dataset.pair === 'true';
      this.speed = (parseInt(this.dataset.speed, 10) || 5) * 1000;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.desktopQuery = window.matchMedia('(min-width: 750px)');
      this.autoplay =
        this.dataset.autoplay === 'true' && this.pageCount > 1 && !this.reducedMotion.matches;

      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => this.goTo(parseInt(dot.dataset.page, 10) || 0));
      });
      if (this.dotsWrap) this.dotsWrap.addEventListener('keydown', this.onDotsKeydown);

      // Pause on hover and focus
      this.addEventListener('mouseenter', this.onMouseEnter);
      this.addEventListener('mouseleave', this.onMouseLeave);
      this.addEventListener('focusin', this.onFocusIn);
      this.addEventListener('focusout', this.onFocusOut);
      document.addEventListener('visibilitychange', this.onVisibility);

      // Theme editor
      this.addEventListener('shopify:block:select', this.onBlockSelect);
      this.addEventListener('shopify:block:deselect', this.onBlockDeselect);

      // Swap between desktop / mobile videos when the screen size changes
      this.desktopQuery.addEventListener('change', this.syncVideos);

      this.render();
      this.startAutoplay();
    }

    disconnectedCallback() {
      this.stopAutoplay();
      document.removeEventListener('visibilitychange', this.onVisibility);
      if (this.desktopQuery) this.desktopQuery.removeEventListener('change', this.syncVideos);
    }

    get isPaused() {
      return this.hovering || this.focusInside || this.editorSelected || document.hidden;
    }

    /** Go to a page (wraps around). */
    goTo(page) {
      const total = Math.max(this.pageCount, 1);
      this.page = ((page % total) + total) % total;
      this.render();
      this.startAutoplay();
    }

    /** Show the slides of the current page, update dots and videos. */
    render() {
      const count = this.slides.length;
      const start = this.pairMode ? this.page * 2 : this.page;
      const visible = new Set();

      for (let k = 0; k < this.perView; k++) {
        const index = (start + k) % count;
        visible.add(index);
        this.slides[index].style.order = k; // keeps order right when the last pair wraps
      }

      this.slides.forEach((slide, index) => {
        const active = visible.has(index);
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (!active) slide.style.order = '';
      });

      this.dots.forEach((dot, index) => {
        const active = index === this.page;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      this.syncVideos();
    }

    /** Play only the video that is visible on an active slide. */
    syncVideos() {
      this.querySelectorAll('video').forEach((video) => {
        const slide = video.closest('[data-cs-slide]');
        const shown = video.getClientRects().length > 0; // false when display: none
        const shouldPlay =
          shown && slide && slide.classList.contains('is-active') && !this.reducedMotion.matches && !document.hidden;

        video.muted = true;
        video.playsInline = true;

        if (shouldPlay) {
          const promise = video.play();
          if (promise && typeof promise.catch === 'function') promise.catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    startAutoplay() {
      this.stopAutoplay();
      if (!this.autoplay || this.isPaused) return;
      this.timer = setTimeout(() => this.goTo(this.page + 1), this.speed);
    }

    stopAutoplay() {
      clearTimeout(this.timer);
      this.timer = null;
    }

    /** Arrow keys, Home and End move between dots. */
    onDotsKeydown(event) {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const rtl = getComputedStyle(this).direction === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';

      let target = this.page;
      if (event.key === forward) target += 1;
      if (event.key === back) target -= 1;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = this.pageCount - 1;

      this.goTo(target);
      if (this.dots[this.page]) this.dots[this.page].focus();
    }
  }

  customElements.define('custom-slideshow', CustomSlideshow);
}
