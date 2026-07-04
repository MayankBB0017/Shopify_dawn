/**
 * Instagram grid — scroll fade-in (matches JANÉ hero banner pattern)
 */
class InstagramGrid extends HTMLElement {
  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  connectedCallback() {
    if (this.reducedMotion.matches) {
      this.classList.add('instagram-grid--fade-visible');
      this.revealAnimatedItems();
      return;
    }

    if (!this.shouldAnimate()) {
      this.revealAnimatedItems();
      return;
    }

    if (this.classList.contains('instagram-grid--fade-visible')) {
      this.revealAnimatedItems();
      return;
    }

    this.initFadeIn();
  }

  disconnectedCallback() {
    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }
  }

  shouldAnimate() {
    if (this.reducedMotion.matches) return false;

    if (window.matchMedia('(min-width: 750px)').matches) {
      return this.classList.contains('instagram-grid--fade-in-desktop');
    }

    return this.classList.contains('instagram-grid--fade-in-mobile');
  }

  getVisibleTiles() {
    const isDesktop = window.matchMedia('(min-width: 750px)').matches;
    const columns = this.querySelector(
      isDesktop ? '.instagram-grid__columns--desktop' : '.instagram-grid__columns--mobile'
    );

    if (!columns) return [];

    const tiles = Array.from(columns.querySelectorAll('.instagram-grid__tile--animate'));
    tiles.sort((a, b) => {
      const aIndex = parseInt(a.dataset.tileIndex, 10) || 0;
      const bIndex = parseInt(b.dataset.tileIndex, 10) || 0;
      return aIndex - bIndex;
    });

    return tiles;
  }

  revealAnimatedItems() {
    const animateBlocks = this.querySelectorAll('.instagram-grid__animate');
    const tiles = this.getVisibleTiles();

    if (!this.shouldAnimate()) {
      animateBlocks.forEach((element) => element.classList.add('instagram-grid__animate--visible'));
      tiles.forEach((element) => element.classList.add('instagram-grid__tile--visible'));
      this.playTileVideos(tiles);
      return;
    }

    if (!this.classList.contains('instagram-grid--fade-visible')) return;

    animateBlocks.forEach((element) => element.classList.remove('instagram-grid__animate--visible'));
    tiles.forEach((element) => element.classList.remove('instagram-grid__tile--visible'));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        animateBlocks.forEach((element) => element.classList.add('instagram-grid__animate--visible'));
        tiles.forEach((element) => element.classList.add('instagram-grid__tile--visible'));
        this.playTileVideos(tiles);
      });
    });
  }

  playTileVideos(tiles) {
    window.setTimeout(() => {
      tiles.forEach((tile) => {
        tile.querySelectorAll('.instagram-grid__video').forEach((video) => {
          if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          }
        });
      });
    }, 100);
  }

  initFadeIn() {
    if (!('IntersectionObserver' in window)) {
      this.classList.add('instagram-grid--fade-visible');
      this.revealAnimatedItems();
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('instagram-grid--fade-visible');
            this.revealAnimatedItems();
            this.fadeObserver.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.fadeObserver.observe(this);
  }

  refreshAfterUpdate() {
    this.classList.add('instagram-grid--fade-visible');
    this.revealAnimatedItems();
  }
}

customElements.define('instagram-grid', InstagramGrid);

function refreshInstagramGrids(root = document) {
  root.querySelectorAll('instagram-grid').forEach((grid) => {
    if (typeof grid.refreshAfterUpdate === 'function') {
      grid.refreshAfterUpdate();
    }
  });
}

if (Shopify?.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    refreshInstagramGrids(event.target);
  });

  document.addEventListener('shopify:section:select', (event) => {
    refreshInstagramGrids(event.target);
  });
}
