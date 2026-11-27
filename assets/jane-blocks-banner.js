
/* =====================================
   JANÉ - BLOCKS BANNER JS
===================================== */

(() => {

  const initJaneBanners = (root = document) => {

    const sections = root.querySelectorAll(
      '[data-jane-blocks-banner]:not([data-jbb-initialized])'
    );

    sections.forEach((section) => {

      section.setAttribute(
        'data-jbb-initialized',
        'true'
      );

      const images = section.querySelectorAll(
        '.jane-blocks-banner__image'
      );

      images.forEach((image) => {

        if (image.complete) {

          image.classList.add('is-loaded');

        } else {

          image.addEventListener(
            'load',
            () => {
              image.classList.add('is-loaded');
            },
            { once: true }
          );

          image.addEventListener(
            'error',
            () => {
              image.classList.add('is-error');
            },
            { once: true }
          );

        }

      });

    });

  };

  /* Initialize on page load */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      () => initJaneBanners()
    );

  } else {

    initJaneBanners();

  }

  /* Shopify Theme Editor support */

  document.addEventListener(
    'shopify:section:load',
    (event) => {
      initJaneBanners(event.target);
    }
  );

})();
