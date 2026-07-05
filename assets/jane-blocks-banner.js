/**
 * JANÉ Blocks Banner — scroll fade-in (matches hero content animation)
 */
class JaneBlocksBanner extends HTMLElement {
  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  connectedCallback() {
    if (this.reducedMotion.matches) {
      this.classList.add('jane-blocks-banner--fade-visible');
      return;
    }

    if (this.isDesignPreview()) {
      this.playFadeIn();
      return;
    }

    if (!this.shouldAnimate()) {
      this.classList.add('jane-blocks-banner--fade-visible');
      return;
    }

    if (this.classList.contains('jane-blocks-banner--fade-visible')) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.classList.add('jane-blocks-banner--fade-visible');
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('jane-blocks-banner--fade-visible');
            this.fadeObserver.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.fadeObserver.observe(this);

    if (Shopify?.designMode) {
      window.setTimeout(() => {
        if (!this.classList.contains('jane-blocks-banner--fade-visible')) {
          this.playFadeIn();
        }
      }, 150);
    }
  }

  disconnectedCallback() {
    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
  }

  isDesignPreview() {
    return Boolean(
      Shopify?.designMode || document.documentElement.classList.contains('shopify-design-mode')
    );
  }

  shouldAnimate() {
    if (this.reducedMotion.matches) {
      return false;
    }

    if (window.matchMedia('(min-width: 750px)').matches) {
      return this.classList.contains('jane-blocks-banner--fade-in-desktop');
    }

    return this.classList.contains('jane-blocks-banner--fade-in-mobile');
  }

  playFadeIn() {
    if (!this.shouldAnimate()) {
      this.classList.add('jane-blocks-banner--fade-visible');
      return;
    }

    this.classList.remove('jane-blocks-banner--fade-visible');

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
    }

    this.previewTimer = window.setTimeout(() => {
      this.previewTimer = null;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.classList.add('jane-blocks-banner--fade-visible');
        });
      });
    }, 100);
  }

  refreshAfterUpdate() {
    this.playFadeIn();
  }
}

customElements.define('jane-blocks-banner', JaneBlocksBanner);

function refreshJaneBlocksBanners(root = document) {
  root.querySelectorAll('jane-blocks-banner').forEach((banner) => {
    if (typeof banner.refreshAfterUpdate === 'function') {
      banner.refreshAfterUpdate();
    }
  });
}

if (Shopify?.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    refreshJaneBlocksBanners(event.target);
  });

  document.addEventListener('shopify:section:select', (event) => {
    refreshJaneBlocksBanners(event.target);
  });
}
