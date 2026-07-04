function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach((modal) => modal.hide());
}

document.addEventListener('shopify:block:select', function (event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (blockSelectedIsSlide) {
    const parentSlideshowComponent = event.target.closest('slideshow-component');
    parentSlideshowComponent.pause();

    setTimeout(function () {
      parentSlideshowComponent.slider.scrollTo({
        left: event.target.offsetLeft,
      });
    }, 200);
    return;
  }

  const blockSelectedIsJaneHeroSlide = event.target.classList.contains('jane-hero__slide');
  if (!blockSelectedIsJaneHeroSlide) return;

  const parentJaneHero = event.target.closest('jane-hero-banner');
  if (!parentJaneHero) return;

  parentJaneHero.stopAutoplay?.();

  setTimeout(function () {
    const slider = parentJaneHero.querySelector('[id^="JaneHeroSlider-"]');
    const slides = parentJaneHero.querySelectorAll('.jane-hero__slide');
    const index = Array.from(slides).indexOf(event.target);

    if (typeof parentJaneHero.goToSlide === 'function' && index >= 0) {
      parentJaneHero.goToSlide(index, 'auto');
    } else if (slider) {
      slider.scrollTo({
        left: event.target.offsetLeft,
        behavior: 'auto',
      });
    }
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (blockDeselectedIsSlide) {
    const parentSlideshowComponent = event.target.closest('slideshow-component');
    if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
    return;
  }

  const blockDeselectedIsJaneHeroSlide = event.target.classList.contains('jane-hero__slide');
  if (!blockDeselectedIsJaneHeroSlide) return;

  const parentJaneHero = event.target.closest('jane-hero-banner');
  if (!parentJaneHero || parentJaneHero.dataset.autoplay !== 'true') return;

  parentJaneHero.startAutoplay?.();
});

document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  document.querySelectorAll(`[data-section="${event.detail.sectionId}"]`).forEach((element) => {
    element.remove();
    document.body.classList.remove('overflow-hidden');
  });
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());
