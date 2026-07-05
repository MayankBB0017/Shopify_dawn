/**
 * Gift Recommender — accessible tab panels + scroll fade-in
 * Focus stays on selected tab after activation (WAI-ARIA tabs pattern).
 */
class GiftRecommender extends HTMLElement {
  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  connectedCallback() {
    this.refreshElements();

    if (this.tabs.length > 0 && this.panels.length > 0) {
      this.onTabClick = this.onTabClick.bind(this);
      this.onTabKeydown = this.onTabKeydown.bind(this);
      this.onSectionLoad = this.onSectionLoad.bind(this);
      this.onBlockSelect = this.onBlockSelect.bind(this);

      this.tabs.forEach((tab) => {
        tab.addEventListener('click', this.onTabClick);
        tab.addEventListener('keydown', this.onTabKeydown);
      });

      document.addEventListener('shopify:section:load', this.onSectionLoad);
      document.addEventListener('shopify:block:select', this.onBlockSelect);

      this.applyQuickAddDissolve();
      this.syncDescription(this.getActiveIndex());
    }

    this.initFadeIn();
  }

  disconnectedCallback() {
    if (this.tabs) {
      this.tabs.forEach((tab) => {
        tab.removeEventListener('click', this.onTabClick);
        tab.removeEventListener('keydown', this.onTabKeydown);
      });
    }

    document.removeEventListener('shopify:section:load', this.onSectionLoad);
    document.removeEventListener('shopify:block:select', this.onBlockSelect);

    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
  }

  refreshElements() {
    this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
    this.descriptionTarget = this.querySelector('[data-recommender-description]');
  }

  applyQuickAddDissolve() {
    this.querySelectorAll('.quick-add__submit.button').forEach((button) => {
      button.classList.add('button--hover-dissolve');
    });
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
      return this.classList.contains('gift-recommender--fade-in-desktop');
    }

    return this.classList.contains('gift-recommender--fade-in-mobile');
  }

  playFadeIn() {
    if (!this.shouldAnimate()) {
      this.classList.add('gift-recommender--fade-visible');
      return;
    }

    this.classList.remove('gift-recommender--fade-visible');

    if (this.previewTimer) {
      window.clearTimeout(this.previewTimer);
    }

    this.previewTimer = window.setTimeout(() => {
      this.previewTimer = null;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.classList.add('gift-recommender--fade-visible');
        });
      });
    }, 100);
  }

  initFadeIn() {
    if (this.reducedMotion.matches) {
      this.classList.add('gift-recommender--fade-visible');
      return;
    }

    if (this.isDesignPreview()) {
      this.playFadeIn();
      return;
    }

    if (!this.shouldAnimate()) {
      this.classList.add('gift-recommender--fade-visible');
      return;
    }

    if (this.classList.contains('gift-recommender--fade-visible')) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.classList.add('gift-recommender--fade-visible');
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('gift-recommender--fade-visible');
            this.fadeObserver.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.fadeObserver.observe(this);

    if (Shopify?.designMode) {
      window.setTimeout(() => {
        if (!this.classList.contains('gift-recommender--fade-visible')) {
          this.playFadeIn();
        }
      }, 150);
    }
  }

  refreshAfterUpdate() {
    this.refreshElements();
    this.applyQuickAddDissolve();
    this.syncDescription(this.getActiveIndex());
    this.playFadeIn();
  }

  onSectionLoad(event) {
    if (!event.target.contains(this)) {
      return;
    }

    this.refreshAfterUpdate();
  }

  onBlockSelect(event) {
    if (!this.contains(event.target)) {
      return;
    }

    const panel =
      event.target.getAttribute('role') === 'tabpanel'
        ? event.target
        : event.target.closest('[role="tabpanel"]');

    if (!panel) {
      return;
    }

    const index = Number(panel.dataset.panelIndex);
    if (!Number.isNaN(index)) {
      this.activateTab(index, false);
    }
  }

  onTabClick(event) {
    const tab = event.currentTarget;
    const index = Number(tab.dataset.tabIndex);
    if (!Number.isNaN(index)) {
      this.activateTab(index, true);
    }
  }

  onTabKeydown(event) {
    const currentIndex = this.tabs.indexOf(event.currentTarget);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = null;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex === this.tabs.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activateTab(nextIndex, true);
  }

  getActiveIndex() {
    const activeTab = this.tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    if (!activeTab) {
      return 0;
    }
    return Number(activeTab.dataset.tabIndex) || 0;
  }

  activateTab(index, moveFocus) {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }

    this.tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle('gift-recommender__tab--active', isActive);
      tab.classList.toggle('button--filled-black', isActive);
      tab.classList.toggle('button--stroke-black', !isActive);

      if (isActive && moveFocus) {
        tab.focus();
      }
    });

    this.panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    this.syncDescription(index);
  }

  syncDescription(index) {
    if (!this.descriptionTarget) {
      return;
    }

    const panelNumber = index + 1;
    const template = this.querySelector(
      `#GiftRecommenderDesc-${this.dataset.sectionId}-${panelNumber}`
    );

    this.descriptionTarget.innerHTML = '';
    if (template && template.content) {
      this.descriptionTarget.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define('gift-recommender', GiftRecommender);

function refreshGiftRecommenders(root = document) {
  root.querySelectorAll('gift-recommender').forEach((recommender) => {
    if (typeof recommender.refreshAfterUpdate === 'function') {
      recommender.refreshAfterUpdate();
    }
  });
}

if (Shopify?.designMode) {
  document.addEventListener('shopify:section:select', (event) => {
    refreshGiftRecommenders(event.target);
  });
}
