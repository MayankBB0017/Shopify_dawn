/* JANÉ Split Hero slider — controls are only present when there are 2+ slides */
(() => {
  const initJaneHero = (root) => {
    if (!root || root.dataset.janeInitialized === 'true') return;
    root.dataset.janeInitialized = 'true';

    const slides = Array.from(root.querySelectorAll('[data-jane-slide]'));
    const controls = root.querySelector('[data-jane-controls]');
    const dots = Array.from(root.querySelectorAll('[data-jane-dot]'));

    // A single block is a static two-panel hero: no slider, arrows, dots or autoplay.
    if (slides.length <= 1) {
      controls?.remove();
      slides[0]?.classList.add('is-active');
      slides[0]?.setAttribute('aria-hidden', 'false');
      return;
    }

    let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;
    const autoplay = root.dataset.autoplay === 'true';
    const delay = Math.max(3000, Number(root.dataset.autoplaySpeed) || 5000);

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      if (!autoplay || document.hidden) return;
      timer = window.setInterval(() => show(current + 1), delay);
    };

    root.querySelector('[data-jane-prev]')?.addEventListener('click', () => { show(current - 1); start(); });
    root.querySelector('[data-jane-next]')?.addEventListener('click', () => { show(current + 1); start(); });
    dots.forEach((dot) => dot.addEventListener('click', () => { show(Number(dot.dataset.janeDot)); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    show(current);
    start();
  };

  const initAll = (scope = document) => {
    if (scope.matches?.('[data-jane-hero]')) initJaneHero(scope);
    scope.querySelectorAll?.('[data-jane-hero]').forEach(initJaneHero);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', (event) => initAll(event.target));
})();
