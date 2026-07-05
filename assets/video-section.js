/**
 * JANÉ Video section — scroll fade-in + Theme Editor preview replay
 */
class VideoSection extends HTMLElement {
  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  connectedCallback() {
    this.onSectionLoad = this.onSectionLoad.bind(this);
    this.onSectionSelect = this.onSectionSelect.bind(this);

    if (Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.onSectionLoad);
      document.addEventListener('shopify:section:select', this.onSectionSelect);
    }

    this.initFadeIn();
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:section:load', this.onSectionLoad);
    document.removeEventListener('shopify:section:select', this.onSectionSelect);

    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
  }

  onSectionLoad(event) {
    if (event.target.contains(this)) {
      this.playFadeIn();
    }
  }

  onSectionSelect(event) {
    if (event.target.contains(this)) {
      this.playFadeIn();
    }
  }

  isDesignPreview() {
    return Boolean(
      Shopify?.designMode ||
        document.documentElement.classList.contains('shopify-design-mode') ||
        document.documentElement.classList.contains('shopify-visual-preview-mode')
    );
  }

  shouldAnimate() {
    if (this.reducedMotion.matches) {
      return false;
    }

    if (window.matchMedia('(min-width: 750px)').matches) {
      return this.classList.contains('video-section-wrapper--fade-in-desktop');
    }

    return this.classList.contains('video-section-wrapper--fade-in-mobile');
  }

  playFadeIn() {
    if (!this.shouldAnimate()) {
      this.classList.add('video-section-wrapper--fade-visible');
      return;
    }

    this.classList.remove('video-section-wrapper--fade-visible');

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
    }

    this.previewTimer = window.setTimeout(() => {
      this.previewTimer = null;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.classList.add('video-section-wrapper--fade-visible');
        });
      });
    }, 100);
  }

  initFadeIn() {
    if (this.reducedMotion.matches) {
      this.classList.add('video-section-wrapper--fade-visible');
      return;
    }

    if (this.isDesignPreview()) {
      this.playFadeIn();
      return;
    }

    if (!this.shouldAnimate()) {
      this.classList.add('video-section-wrapper--fade-visible');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.classList.add('video-section-wrapper--fade-visible');
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('video-section-wrapper--fade-visible');
            this.fadeObserver.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.fadeObserver.observe(this);
  }
}

customElements.define('video-section', VideoSection);
