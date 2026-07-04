/**
 * JANÉ Blocks Banner — scroll fade-in (matches hero content animation)
 */
class JaneBlocksBanner extends HTMLElement {
  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  }

  disconnectedCallback() {
    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }
  }
}

customElements.define('jane-blocks-banner', JaneBlocksBanner);
