
/* =========================================
   JANÉ BLOCKS BANNER JS
========================================= */

(() => {

  function initJaneBlocksBanner(root = document) {

    const sections = root.querySelectorAll(
      '[data-jbb-section]:not([data-jbb-initialized])'
    );

    sections.forEach((section) => {

      section.setAttribute('data-jbb-initialized', 'true');

      const track = section.querySelector('[data-jbb-track]');
      const prev = section.querySelector('[data-jbb-prev]');
      const next = section.querySelector('[data-jbb-next]');

      if (!track) return;

      /* Image loading */

      const images = section.querySelectorAll('.jbb__image');

      images.forEach((image) => {

        if (image.complete && image.naturalWidth > 0) {
          image.classList.add('is-loaded');
          return;
        }

        image.addEventListener('load', () => {
          image.classList.add('is-loaded');
        }, { once: true });

        image.addEventListener('error', () => {
          image.classList.add('is-error');
        }, { once: true });

      });

      /* Carousel navigation */

      const getScrollAmount = () => {
        const item = track.querySelector('.jbb__item');

        if (!item) return track.clientWidth;

        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.gap) || 0;

        return item.getBoundingClientRect().width + gap;
      };

      if (prev) {
        prev.addEventListener('click', () => {
          track.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
          });
        });
      }

      if (next) {
        next.addEventListener('click', () => {
          track.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
          });
        });
      }

    });

  }

  /* Initial page load */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      () => initJaneBlocksBanner()
    );

  } else {

    initJaneBlocksBanner();

  }

  /* Shopify Theme Editor */

  document.addEventListener(
    'shopify:section:load',
    (event) => {
      initJaneBlocksBanner(event.target);
    }
  );

})();
