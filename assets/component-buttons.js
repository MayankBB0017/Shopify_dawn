/**
 * Wraps plain text in brand CTA buttons so label stays above circle ::after.
 * Skips buttons that already have .button-label or complex child markup.
 */
(function () {
  const CTA_SELECTOR = [
    '.button--primary:not(.button--hover-dissolve)',
    '.button--secondary:not(.button--hover-dissolve)',
    '.button--filled-black:not(.button--hover-dissolve)',
    '.button--filled-white:not(.button--hover-dissolve)',
    '.button--stroke-black:not(.button--hover-dissolve)',
    '.button--stroke-white:not(.button--hover-dissolve)',
    'a.button:not(.button--primary):not(.button--secondary):not(.button--tertiary):not(.button-close):not(.button-show-more):not(.product__xr-button):not(.button--stroke-black):not(.button--stroke-white):not(.button--filter):not(.button--filled-black):not(.button--filled-white):not(.link):not(.button--hover-dissolve)',
    'button.button:not(.button--primary):not(.button--secondary):not(.button--tertiary):not(.button-close):not(.button-show-more):not(.product__xr-button):not(.button--filter):not(.button--hover-dissolve)',
    '.shopify-challenge__button:not(.button--hover-dissolve)',
  ].join(',');

  function hasLabelWrapper(button) {
    return Boolean(button.querySelector('.button-label'));
  }

  function hasNonTextChildren(button) {
    return Array.from(button.childNodes).some((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      return !node.classList.contains('visually-hidden');
    });
  }

  function wrapButtonLabels(root = document) {
    root.querySelectorAll(CTA_SELECTOR).forEach((button) => {
      if (button.tagName === 'INPUT') return;
      if (hasLabelWrapper(button) || hasNonTextChildren(button)) return;

      const text = button.textContent?.trim();
      if (!text) return;

      button.textContent = '';
      const span = document.createElement('span');
      span.className = 'button-label';
      span.textContent = text;
      button.appendChild(span);
    });
  }

  function init() {
    wrapButtonLabels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => {
    wrapButtonLabels(event.target);
  });
})();
