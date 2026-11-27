
(() => {
  'use strict';

  /* INITIALIZE SECTION */

  const initSection = (section) => {

    if (!section || section.dataset.jbbInitialized === 'true') {
      return;
    }

    section.dataset.jbbInitialized = 'true';

    const track = section.querySelector('[data-jbb-track]');
    const prev = section.querySelector('[data-jbb-prev]');
    const next = section.querySelector('[data-jbb-next]');


    const scrollAmount = () => {

      if (!track) return 300;

      const card = track.querySelector('.jbb__item');

      if (!card) {
        return track.clientWidth || 300;
      }

      const gap = parseFloat(
        window.getComputedStyle(track).gap
      ) || 0;

      return card.getBoundingClientRect().width + gap;
    };

    prev?.addEventListener('click', () => {
      track?.scrollBy({
        left: -scrollAmount(),
        behavior: 'smooth'
      });
    });

    next?.addEventListener('click', () => {
      track?.scrollBy({
        left: scrollAmount(),
        behavior: 'smooth'
      });
    });

    const fadeObserver = () => {

      const isDesktop = window.matchMedia(
        '(min-width: 750px)'
      ).matches;

      const shouldFade = isDesktop
        ? section.classList.contains('jbb--fade-desktop')
        : section.classList.contains('jbb--fade-mobile');

      if (
        !shouldFade ||
        !('IntersectionObserver' in window)
      ) {
        section.classList.add('is-visible');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              section.classList.add('is-visible');

              observer.unobserve(section);
            }

          });

        },
        {
          threshold: 0.12
        }
      );

      observer.observe(section);
    };

    fadeObserver();

    section.querySelectorAll('video[autoplay]').forEach((video) => {

      video.muted = true;
      video.playsInline = true;

      const playVideo = () => {
        video.play().catch(() => {});
      };

      if ('IntersectionObserver' in window) {

        const videoObserver = new IntersectionObserver(
          (entries) => {

            entries.forEach((entry) => {

              if (entry.isIntersecting) {
                playVideo();
              } else {
                video.pause();
              }

            });

          },
          {
            threshold: 0.15
          }
        );

        videoObserver.observe(video);

      } else {

        playVideo();

      }

    });

  };

  const init = (root = document) => {

    if (root.matches?.('[data-jbb-section]')) {
      initSection(root);
    }

    root.querySelectorAll?.('[data-jbb-section]').forEach(
      initSection
    );

  };
  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      () => init()
    );

  } else {

    init();

  }


  document.addEventListener(
    'shopify:section:load',
    (event) => init(event.target)
  );

  document.addEventListener(
    'shopify:section:unload',
    (event) => {

      event.target
        .querySelectorAll?.('[data-jbb-section]')
        .forEach((section) => {

          section.dataset.jbbInitialized = 'false';

        });

    }
  );

})();
