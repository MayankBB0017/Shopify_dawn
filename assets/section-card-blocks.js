if (!customElements.get('card-blocks')) {
  customElements.define(
    'card-blocks',
    class CardBlocks extends HTMLElement {
      connectedCallback() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.initFade();
        this.initSlider();
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
        if (this.list) this.list.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onScroll);
      }

      /* Fade in from below when entering the viewport (CSS decides per device). */
      initFade() {
        if (!this.classList.contains('ccb--fade-m') && !this.classList.contains('ccb--fade-d')) return;

        const inEditor = window.Shopify && Shopify.designMode;
        if (this.reducedMotion || inEditor || !('IntersectionObserver' in window)) {
          this.classList.add('is-visible');
          return;
        }

        this.observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              this.classList.add('is-visible');
              this.observer.disconnect();
            }
          },
          { threshold: 0, rootMargin: '0px 0px -10% 0px' }
        );
        this.observer.observe(this);
      }

      /* Mobile carousel: native scroll-snap plus prev/next buttons. */
      initSlider() {
        this.list = this.querySelector('[data-ccb-list]');
        this.prev = this.querySelector('[data-ccb-prev]');
        this.next = this.querySelector('[data-ccb-next]');
        if (!this.list || !this.prev || !this.next) return;

        this.onScroll = () => this.updateButtons();
        this.list.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll);
        this.prev.addEventListener('click', () => this.step(-1));
        this.next.addEventListener('click', () => this.step(1));
        this.updateButtons();
      }

      step(direction) {
        const item = this.list.querySelector('.ccb__item');
        if (!item) return;
        const gap = parseFloat(getComputedStyle(this.list).columnGap) || 0;
        this.list.scrollBy({
          left: direction * (item.offsetWidth + gap),
          behavior: this.reducedMotion ? 'auto' : 'smooth',
        });
      }

      updateButtons() {
        const max = this.list.scrollWidth - this.list.clientWidth - 1;
        this.prev.disabled = this.list.scrollLeft <= 0;
        this.next.disabled = this.list.scrollLeft >= max;
      }
    }
  );
}
