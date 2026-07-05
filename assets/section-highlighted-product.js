/**
 * Highlighted product — scroll fade-in + interactive hotspots
 */
const HIGHLIGHTED_PRODUCT_TOOLTIP_FADE_OUT_MS = 250;

class HighlightedProductSection extends HTMLElement {
  constructor() {
    super();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');

    this.onHotspotClick = this.onHotspotClick.bind(this);
    this.onHotspotMouseEnter = this.onHotspotMouseEnter.bind(this);
    this.onHotspotMouseLeave = this.onHotspotMouseLeave.bind(this);
    this.onHotspotFocus = this.onHotspotFocus.bind(this);
    this.onHotspotBlur = this.onHotspotBlur.bind(this);
    this.onHotspotKeydown = this.onHotspotKeydown.bind(this);
    this.onTooltipMouseLeave = this.onTooltipMouseLeave.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onDocumentKeydown = this.onDocumentKeydown.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onSectionLoad = this.onSectionLoad.bind(this);
    this.onBlockSelect = this.onBlockSelect.bind(this);
  }

  connectedCallback() {
    this.refreshElements();
    if (!this.media) {
      return;
    }

    this.parseHotspotData();
    this.bindHotspotEvents();
    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('keydown', this.onDocumentKeydown);
    window.addEventListener('resize', this.onResize);

    if (Shopify?.designMode) {
      document.addEventListener('shopify:section:load', this.onSectionLoad);
      document.addEventListener('shopify:block:select', this.onBlockSelect);
    }

    this.initFadeIn();
    this.initDefaultHotspot();
  }

  disconnectedCallback() {
    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }

    this.cancelTooltipTimers();

    this.unbindHotspotEvents();
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('shopify:section:load', this.onSectionLoad);
    document.removeEventListener('shopify:block:select', this.onBlockSelect);
  }

  refreshElements() {
    this.media = this.querySelector('.highlighted-product__media');
    this.tooltip = this.querySelector('.highlighted-product__tooltip');
    this.tooltipInner = this.querySelector('.highlighted-product__tooltip-inner');
    this.hotspots = Array.from(this.querySelectorAll('.highlighted-product__hotspot'));
    this.openMode = this.dataset.openMode || 'hover_and_click';
    this.defaultHotspot = this.dataset.defaultHotspot || 'first';
  }

  parseHotspotData() {
    this.hotspotData = new Map();
    const dataEl = this.querySelector('[data-hotspot-data]');

    if (!dataEl) {
      return;
    }

    try {
      const items = JSON.parse(dataEl.textContent);
      items.forEach((item) => {
        this.hotspotData.set(String(item.id), item);
      });
    } catch (error) {
      this.hotspotData = new Map();
    }
  }

  bindHotspotEvents() {
    this.hotspots.forEach((hotspot) => {
      hotspot.addEventListener('click', this.onHotspotClick);
      hotspot.addEventListener('mouseenter', this.onHotspotMouseEnter);
      hotspot.addEventListener('mouseleave', this.onHotspotMouseLeave);
      hotspot.addEventListener('focus', this.onHotspotFocus);
      hotspot.addEventListener('blur', this.onHotspotBlur);
      hotspot.addEventListener('keydown', this.onHotspotKeydown);
    });

    if (this.tooltip) {
      this.tooltip.addEventListener('mouseleave', this.onTooltipMouseLeave);
    }
  }

  unbindHotspotEvents() {
    this.hotspots.forEach((hotspot) => {
      hotspot.removeEventListener('click', this.onHotspotClick);
      hotspot.removeEventListener('mouseenter', this.onHotspotMouseEnter);
      hotspot.removeEventListener('mouseleave', this.onHotspotMouseLeave);
      hotspot.removeEventListener('focus', this.onHotspotFocus);
      hotspot.removeEventListener('blur', this.onHotspotBlur);
      hotspot.removeEventListener('keydown', this.onHotspotKeydown);
    });

    if (this.tooltip) {
      this.tooltip.removeEventListener('mouseleave', this.onTooltipMouseLeave);
    }
  }

  isDesktop() {
    return window.matchMedia('(min-width: 750px)').matches;
  }

  isMobileInteraction() {
    return !this.hoverMedia.matches || !this.isDesktop();
  }

  allowsHoverOpen() {
    return this.openMode === 'hover' || this.openMode === 'hover_and_click';
  }

  allowsClickOpen() {
    return this.openMode === 'click' || this.openMode === 'hover_and_click';
  }

  initDefaultHotspot() {
    if (this.defaultHotspot === 'none' || this.hotspots.length === 0) {
      this.deactivateAll(false);
      return;
    }

    const firstHotspot = this.hotspots[0];

    if (this.isMobileInteraction()) {
      this.setActiveHotspot(firstHotspot, { showTooltip: true, focus: false });
      return;
    }

    this.deactivateAll(false);
  }

  onHotspotClick(event) {
    if (!this.allowsClickOpen()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const hotspot = event.currentTarget;
    const isActive = hotspot.classList.contains('is-active');

    if (this.isMobileInteraction() && isActive) {
      this.deactivateAll(false);
      return;
    }

    this.setActiveHotspot(hotspot, { showTooltip: true, focus: false });
  }

  onHotspotMouseEnter(event) {
    if (this.isMobileInteraction() || !this.allowsHoverOpen()) {
      return;
    }

    this.setActiveHotspot(event.currentTarget, { showTooltip: true, focus: false });
  }

  onHotspotMouseLeave() {
    if (this.isMobileInteraction() || !this.allowsHoverOpen()) {
      return;
    }

    // Desktop: tooltip stays open until another hotspot is activated or click outside.
  }

  onTooltipMouseLeave() {
    if (this.isMobileInteraction() || !this.allowsHoverOpen()) {
      return;
    }

    // Desktop: tooltip stays open until another hotspot is activated or click outside.
  }

  onHotspotFocus(event) {
    if (this.isMobileInteraction()) {
      return;
    }

    this.setActiveHotspot(event.currentTarget, { showTooltip: true, focus: false });
  }

  onHotspotBlur(event) {
    if (this.isMobileInteraction()) {
      return;
    }

    if (this.tooltip?.contains(event.relatedTarget)) {
      return;
    }

    if (event.relatedTarget?.closest?.('.highlighted-product__hotspot')) {
      return;
    }

    this.deactivateAll(false);
  }

  onHotspotKeydown(event) {
    const currentIndex = this.hotspots.indexOf(event.currentTarget);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = null;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? this.hotspots.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex === this.hotspots.length - 1 ? 0 : currentIndex + 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.setActiveHotspot(this.hotspots[nextIndex], { showTooltip: true, focus: true });
  }

  onDocumentClick(event) {
    const target = event.target;

    if (!this.contains(target)) {
      this.deactivateAll(false);
      return;
    }

    if (this.isMobileInteraction()) {
      return;
    }

    const isHotspot = target.closest?.('.highlighted-product__hotspot');
    const isTooltip = this.tooltip?.contains(target);

    if (!isHotspot && !isTooltip) {
      this.deactivateAll(false);
    }
  }

  onDocumentKeydown(event) {
    if (event.key !== 'Escape') {
      return;
    }

    if (!this.contains(document.activeElement) && !this.tooltip?.hidden) {
      return;
    }

    this.deactivateAll(true);
  }

  onResize() {
    if (!this.tooltip || this.tooltip.hidden || this.isMobileInteraction()) {
      return;
    }

    const activeHotspot = this.hotspots.find((hotspot) => hotspot.classList.contains('is-active'));
    if (activeHotspot) {
      this.positionTooltip(activeHotspot);
    }
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

    const hotspot =
      event.target.classList?.contains('highlighted-product__hotspot')
        ? event.target
        : event.target.closest('.highlighted-product__hotspot');

    if (hotspot) {
      this.setActiveHotspot(hotspot, { showTooltip: true, focus: false });
      return;
    }

    const blockId = event.detail?.blockId;
    if (!blockId) {
      return;
    }

    const matchedHotspot = this.hotspots.find((item) => item.dataset.hotspotId === blockId);
    if (matchedHotspot) {
      this.setActiveHotspot(matchedHotspot, { showTooltip: true, focus: false });
    }
  }

  setActiveHotspot(hotspot, options = {}) {
    const { showTooltip = true, focus = false } = options;
    const previousHotspotId = this.dataset.activeHotspot;
    const isSameHotspot = previousHotspotId === hotspot.dataset.hotspotId;

    this.hotspots.forEach((item) => {
      const isActive = item === hotspot;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-expanded', isActive && showTooltip ? 'true' : 'false');
    });

    this.dataset.activeHotspot = hotspot.dataset.hotspotId;

    if (showTooltip) {
      if (this.isTooltipVisible() && isSameHotspot) {
        if (!this.isMobileInteraction()) {
          this.positionTooltip(hotspot);
        }
      } else if ((this.isTooltipVisible() || this.tooltipSwapTimer) && !isSameHotspot) {
        this.swapTooltip(hotspot);
      } else {
        this.cancelTooltipTimers();
        this.renderTooltip(hotspot);
        this.showTooltip(hotspot);
      }
    } else {
      this.hideTooltip();
    }

    if (focus) {
      hotspot.focus();
    }
  }

  deactivateAll(restoreFocus) {
    this.hotspots.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-expanded', 'false');
    });

    delete this.dataset.activeHotspot;
    this.hideTooltip();

    if (restoreFocus && document.activeElement && this.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  renderTooltip(hotspot) {
    if (!this.tooltipInner || !this.tooltip) {
      return;
    }

    const data = this.hotspotData.get(String(hotspot.dataset.hotspotId));
    if (!data) {
      this.tooltipInner.innerHTML = '';
      this.tooltipInner.className = 'highlighted-product__tooltip-inner';
      this.tooltip.hidden = true;
      return;
    }

    const hasImage = Boolean(data.image);
    const hasTitle = Boolean(String(data.title || '').trim());
    const hasDescription = Boolean(String(data.description || '').trim());
    const hasContent = hasTitle || hasDescription;

    if (!hasImage && !hasContent) {
      this.tooltipInner.innerHTML = '';
      this.tooltipInner.className = 'highlighted-product__tooltip-inner';
      this.tooltip.hidden = true;
      return;
    }

    let innerClass = 'highlighted-product__tooltip-inner';
    if (hasImage && hasContent) {
      innerClass += ' highlighted-product__tooltip-inner--split';
    } else if (hasImage) {
      innerClass += ' highlighted-product__tooltip-inner--image-only';
    } else {
      innerClass += ' highlighted-product__tooltip-inner--content-only';
    }

    this.tooltipInner.className = innerClass;

    const parts = [];

    if (hasImage) {
      parts.push(
        `<div class="highlighted-product__tooltip-image"><img src="${data.image}" alt="${data.imageAlt || ''}" width="80" height="80" loading="lazy"></div>`
      );
    }

    if (hasContent) {
      const titleMarkup = hasTitle
        ? data.link
          ? `<a href="${data.link}" class="highlighted-product__tooltip-title link">${data.title}</a>`
          : `<p class="highlighted-product__tooltip-title caption-large caption--medium">${data.title}</p>`
        : '';

      const descriptionMarkup = hasDescription
        ? `<p class="highlighted-product__tooltip-description caption">${data.description}</p>`
        : '';

      parts.push(
        `<div class="highlighted-product__tooltip-content">${titleMarkup}${descriptionMarkup}</div>`
      );
    }

    this.tooltipInner.innerHTML = parts.join('');
    this.tooltip.classList.toggle('highlighted-product__tooltip--image-only', hasImage && !hasContent);
    this.tooltip.classList.toggle('highlighted-product__tooltip--content-only', hasContent && !hasImage);
  }

  isTooltipVisible() {
    return Boolean(
      this.tooltip &&
      !this.tooltip.hidden &&
      this.tooltip.classList.contains('highlighted-product__tooltip--visible')
    );
  }

  cancelTooltipTimers() {
    if (this.tooltipHideTimer) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }

    if (this.tooltipSwapTimer) {
      window.clearTimeout(this.tooltipSwapTimer);
      this.tooltipSwapTimer = null;
    }
  }

  swapTooltip(hotspot) {
    if (!this.tooltip) {
      return;
    }

    this.cancelTooltipTimers();

    if (!this.shouldAnimateTooltip()) {
      this.renderTooltip(hotspot);
      this.showTooltip(hotspot);
      return;
    }

    this.tooltip.classList.remove('highlighted-product__tooltip--visible');

    this.tooltipSwapTimer = window.setTimeout(() => {
      this.tooltipSwapTimer = null;
      if (!this.tooltip) {
        return;
      }

      this.renderTooltip(hotspot);
      this.showTooltip(hotspot);
    }, HIGHLIGHTED_PRODUCT_TOOLTIP_FADE_OUT_MS);
  }

  shouldAnimateTooltip() {
    return !this.reducedMotion.matches;
  }

  revealTooltip() {
    if (!this.tooltip) {
      return;
    }

    if (!this.shouldAnimateTooltip()) {
      this.tooltip.classList.add('highlighted-product__tooltip--visible');
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        this.tooltip?.classList.add('highlighted-product__tooltip--visible');
      });
    });
  }

  showTooltip(hotspot) {
    if (!this.tooltip) {
      return;
    }

    if (!this.tooltipInner?.innerHTML) {
      this.hideTooltip();
      return;
    }

    this.cancelTooltipTimers();
    this.tooltip.classList.remove('highlighted-product__tooltip--visible');
    this.tooltip.hidden = false;
    this.tooltip.classList.toggle('highlighted-product__tooltip--mobile', this.isMobileInteraction());

    if (this.isMobileInteraction()) {
      this.tooltip.removeAttribute('style');
      this.revealTooltip();
      return;
    }

    this.positionTooltip(hotspot);
    this.revealTooltip();
  }

  hideTooltip() {
    if (!this.tooltip) {
      return;
    }

    this.cancelTooltipTimers();

    const finishHide = () => {
      if (!this.tooltip) {
        return;
      }

      this.tooltip.hidden = true;
      this.tooltip.classList.remove(
        'highlighted-product__tooltip--visible',
        'highlighted-product__tooltip--image-only',
        'highlighted-product__tooltip--content-only'
      );
      this.hotspots.forEach((item) => {
        if (item.classList.contains('is-active')) {
          item.setAttribute('aria-expanded', 'false');
        }
      });
    };

    if (
      !this.tooltip.hidden &&
      this.tooltip.classList.contains('highlighted-product__tooltip--visible') &&
      this.shouldAnimateTooltip()
    ) {
      this.tooltip.classList.remove('highlighted-product__tooltip--visible');
      this.tooltipHideTimer = window.setTimeout(finishHide, HIGHLIGHTED_PRODUCT_TOOLTIP_FADE_OUT_MS);
      return;
    }

    finishHide();
  }

  getHotspotTooltipConfig(hotspot) {
    const data = this.hotspotData.get(String(hotspot.dataset.hotspotId));

    return {
      placement: data?.tooltipPosition || 'auto',
      spacing: typeof data?.tooltipSpacing === 'number' ? data.tooltipSpacing : 24,
      offsetX: typeof data?.tooltipOffsetX === 'number' ? data.tooltipOffsetX : 0,
      offsetY: typeof data?.tooltipOffsetY === 'number' ? data.tooltipOffsetY : 0,
    };
  }

  readTooltipGap(hotspot) {
    return this.getHotspotTooltipConfig(hotspot).spacing;
  }

  getTooltipPlacement(hotspot) {
    return this.getHotspotTooltipConfig(hotspot).placement;
  }

  positionTooltip(hotspot) {
    if (!this.tooltip || !this.media || this.isMobileInteraction()) {
      return;
    }

    const mediaRect = this.media.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const gap = this.readTooltipGap(hotspot);
    const placement = this.getTooltipPlacement(hotspot);
    const { offsetX, offsetY } = this.getHotspotTooltipConfig(hotspot);

    const hotspotCenterX = hotspotRect.left + hotspotRect.width / 2 - mediaRect.left;
    const hotspotCenterY = hotspotRect.top + hotspotRect.height / 2 - mediaRect.top;
    const hotspotRadius = hotspotRect.width / 2;

    let left;
    let top;

    if (placement === 'auto') {
      left = hotspotCenterX + hotspotRadius + gap;
      top = hotspotCenterY - tooltipRect.height / 2;

      if (left + tooltipRect.width > mediaRect.width - 8) {
        left = hotspotCenterX - hotspotRadius - gap - tooltipRect.width;
      }
    } else if (placement === 'right') {
      left = hotspotCenterX + hotspotRadius + gap;
      top = hotspotCenterY - tooltipRect.height / 2;
    } else if (placement === 'left') {
      left = hotspotCenterX - hotspotRadius - gap - tooltipRect.width;
      top = hotspotCenterY - tooltipRect.height / 2;
    } else if (placement === 'top') {
      left = hotspotCenterX - tooltipRect.width / 2;
      top = hotspotCenterY - hotspotRadius - gap - tooltipRect.height;
    } else if (placement === 'bottom') {
      left = hotspotCenterX - tooltipRect.width / 2;
      top = hotspotCenterY + hotspotRadius + gap;
    } else {
      left = hotspotCenterX + hotspotRadius + gap;
      top = hotspotCenterY - tooltipRect.height / 2;
    }

    if (placement === 'top' || placement === 'bottom') {
      left += offsetX;
    } else {
      top += offsetY;
    }

    left = Math.max(8, Math.min(left, mediaRect.width - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, mediaRect.height - tooltipRect.height - 8));

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  shouldAnimate() {
    if (this.reducedMotion.matches) {
      return false;
    }

    if (this.isDesktop()) {
      return this.classList.contains('highlighted-product--fade-in-desktop');
    }

    return this.classList.contains('highlighted-product--fade-in-mobile');
  }

  getStaggerTargets() {
    const textBlocks = Array.from(this.querySelectorAll('.highlighted-product__text--mobile, .highlighted-product__text--desktop'));
    const media = this.querySelector('.highlighted-product__media');
    const hotspots = [...this.hotspots].sort(
      (a, b) => (parseInt(a.dataset.hotspotIndex, 10) || 0) - (parseInt(b.dataset.hotspotIndex, 10) || 0)
    );
    const tooltip = this.querySelector('.highlighted-product__tooltip-wrap');
    const cta = this.querySelector('.highlighted-product__cta');

    return { textBlocks, media, hotspots, tooltip, cta };
  }

  revealAnimatedItems() {
    const animateBlocks = this.querySelectorAll('.highlighted-product__animate');
    const hotspotTargets = this.querySelectorAll('.highlighted-product__hotspot--animate');
    const tooltipWrap = this.querySelector('.highlighted-product__tooltip-wrap');
    const cta = this.querySelector('.highlighted-product__cta');

    if (!this.shouldAnimate()) {
      animateBlocks.forEach((element) => element.classList.add('highlighted-product__animate--visible'));
      hotspotTargets.forEach((element) => element.classList.add('highlighted-product__hotspot--visible'));
      if (tooltipWrap) {
        tooltipWrap.classList.add('highlighted-product__animate--visible');
      }
      if (cta) {
        cta.classList.add('highlighted-product__animate--visible');
      }
      return;
    }

    if (!this.classList.contains('highlighted-product--fade-visible')) {
      return;
    }

    animateBlocks.forEach((element) => element.classList.remove('highlighted-product__animate--visible'));
    hotspotTargets.forEach((element) => element.classList.remove('highlighted-product__hotspot--visible'));
    if (tooltipWrap) {
      tooltipWrap.classList.remove('highlighted-product__animate--visible');
    }
    if (cta) {
      cta.classList.remove('highlighted-product__animate--visible');
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        animateBlocks.forEach((element) => element.classList.add('highlighted-product__animate--visible'));
        hotspotTargets.forEach((element) => element.classList.add('highlighted-product__hotspot--visible'));
        if (tooltipWrap) {
          tooltipWrap.classList.add('highlighted-product__animate--visible');
        }
        if (cta) {
          cta.classList.add('highlighted-product__animate--visible');
        }
      });
    });
  }

  initFadeIn() {
    if (this.reducedMotion.matches) {
      this.classList.add('highlighted-product--fade-visible');
      this.revealAnimatedItems();
      return;
    }

    if (!this.shouldAnimate()) {
      this.revealAnimatedItems();
      return;
    }

    if (this.classList.contains('highlighted-product--fade-visible')) {
      this.revealAnimatedItems();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.classList.add('highlighted-product--fade-visible');
      this.revealAnimatedItems();
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('highlighted-product--fade-visible');
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
    this.unbindHotspotEvents();
    this.refreshElements();
    this.parseHotspotData();
    this.bindHotspotEvents();
    this.classList.add('highlighted-product--fade-visible');
    this.revealAnimatedItems();
    this.initDefaultHotspot();
  }
}

customElements.define('highlighted-product-section', HighlightedProductSection);

function refreshHighlightedProducts(root = document) {
  root.querySelectorAll('highlighted-product-section').forEach((section) => {
    if (typeof section.refreshAfterUpdate === 'function') {
      section.refreshAfterUpdate();
    }
  });
}

if (Shopify?.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    refreshHighlightedProducts(event.target);
  });

  document.addEventListener('shopify:section:select', (event) => {
    refreshHighlightedProducts(event.target);
  });
}
