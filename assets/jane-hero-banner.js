/* JANÉ Hero Banner slider */
(() => {
  class JaneHero extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.slides = Array.from(this.querySelectorAll('[data-jane-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-jane-dot]'));
      this.current = 0;
      this.timer = null;
      this.autoplay = this.dataset.autoplay === 'true';
      this.delay = Math.max(3000, Number(this.dataset.autoplaySpeed) || 5000);
      this.querySelector('[data-jane-prev]')?.addEventListener('click', () => this.go(this.current - 1, true));
      this.querySelector('[data-jane-next]')?.addEventListener('click', () => this.go(this.current + 1, true));
      this.dots.forEach((dot) => dot.addEventListener('click', () => this.go(Number(dot.dataset.janeDot), true)));
      this.addEventListener('mouseenter', () => this.pause());
      this.addEventListener('mouseleave', () => this.start());
      this.addEventListener('focusin', () => this.pause());
      this.addEventListener('focusout', () => this.start());
      document.addEventListener('visibilitychange', () => document.hidden ? this.pause() : this.start());
      this.start();
    }
    go(index, userAction = false) {
      if (!this.slides.length) return;
      this.current = (index + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, i) => {
        const active = i === this.current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === this.current);
        dot.setAttribute('aria-current', i === this.current ? 'true' : 'false');
      });
      if (userAction) { this.pause(); this.start(); }
    }
    pause() { if (this.timer) window.clearInterval(this.timer); this.timer = null; }
    start() {
      this.pause();
      if (!this.autoplay || this.slides.length < 2 || document.hidden) return;
      this.timer = window.setInterval(() => this.go(this.current + 1), this.delay);
    }
  }
  if (!customElements.get('jane-hero')) customElements.define('jane-hero', JaneHero);
  document.querySelectorAll('[data-jane-hero]').forEach((section) => {
    if (!(section instanceof JaneHero)) Object.setPrototypeOf(section, JaneHero.prototype);
    if (!section.initialized) JaneHero.prototype.connectedCallback.call(section);
  });
})();