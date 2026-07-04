/**
 * JANÉ Hero banner carousel — bullets, autoplay, keyboard nav, drag/swipe
 */
class JaneHeroBanner extends HTMLElement {
  static DRAG_THRESHOLD = 8;

  constructor() {
    super();
    this.slider = null;
    this.slides = [];
    this.bullets = [];
    this.autoplayEnabled = false;
    this.autoplaySpeed = 5000;
    this.currentIndex = 0;
    this.autoplayTimer = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.isDragging = false;
    this.potentialDrag = false;
    this.dragMoved = false;
    this.dragStartX = 0;
    this.dragScrollStart = 0;
    this.dragPointerId = null;

    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerEnd = this.handlePointerEnd.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
  }

  connectedCallback() {
    this.slider = this.querySelector('[id^="JaneHeroSlider-"]');
    this.slides = this.querySelectorAll('.jane-hero__slide');
    this.bullets = this.querySelectorAll('.jane-hero__bullet');
    this.autoplayEnabled = this.dataset.autoplay === 'true';
    this.autoplaySpeed = (parseInt(this.dataset.speed, 10) || 5) * 1000;

    if (!this.slider || this.slides.length === 0) return;

    this.bullets.forEach((bullet) => {
      bullet.addEventListener('click', () => {
        const index = parseInt(bullet.dataset.slideIndex, 10);
        if (!Number.isNaN(index)) this.goToSlide(index);
      });
    });

    this.slider.addEventListener('scroll', this.onScroll, { passive: true });
    this.addEventListener('keydown', this.onKeydown);

    if (this.slides.length > 1) {
      this.initDrag();
    }

    if (this.reducedMotion.matches) {
      this.classList.add('jane-hero-banner--fade-visible');
      this.updateSlideContentFade(this.currentIndex);
    } else {
      this.initFadeIn();
    }

    this.initTransparentHeader();

    if (this.autoplayEnabled && this.slides.length > 1 && !this.reducedMotion.matches) {
      this.startAutoplay();
      this.addEventListener('mouseenter', () => this.stopAutoplay());
      this.addEventListener('mouseleave', () => this.startAutoplay());
      this.addEventListener('focusin', () => this.stopAutoplay());
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.startAutoplay();
      });
    }

    this.updateBullets();
  }

  disconnectedCallback() {
    this.stopAutoplay();
    this.removeDragListeners();
    this.destroyTransparentHeader();
    if (this.fadeObserver) {
      this.fadeObserver.disconnect();
    }
  }

  initDrag() {
    this.slider.classList.add('jane-hero__slider--draggable');
    this.addEventListener('pointerdown', this.onPointerDown, { capture: true });
    this.addEventListener('pointermove', this.onPointerMove, { capture: true, passive: false });
    this.addEventListener('pointerup', this.onPointerEnd, { capture: true });
    this.addEventListener('pointercancel', this.onPointerEnd, { capture: true });
  }

  removeDragListeners() {
    this.removeEventListener('pointerdown', this.onPointerDown, { capture: true });
    this.removeEventListener('pointermove', this.onPointerMove, { capture: true });
    this.removeEventListener('pointerup', this.onPointerEnd, { capture: true });
    this.removeEventListener('pointercancel', this.onPointerEnd, { capture: true });
  }

  isInteractiveTarget(target) {
    return Boolean(
      target.closest('button, input, select, textarea, label, .jane-hero__controls')
    );
  }

  handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (this.isInteractiveTarget(event.target)) return;

    this.potentialDrag = true;
    this.isDragging = false;
    this.dragMoved = false;
    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragScrollStart = this.slider.scrollLeft;
  }

  handlePointerMove(event) {
    if (!this.potentialDrag || event.pointerId !== this.dragPointerId) return;

    const deltaX = event.clientX - this.dragStartX;

    if (!this.isDragging && Math.abs(deltaX) >= JaneHeroBanner.DRAG_THRESHOLD) {
      this.isDragging = true;
      this.dragMoved = true;
      this.slider.classList.add('jane-hero__slider--dragging');
      this.setPointerCapture(event.pointerId);
      this.stopAutoplay();
    }

    if (!this.isDragging) return;

    event.preventDefault();
    this.slider.scrollLeft = this.dragScrollStart - deltaX;
  }

  handlePointerEnd(event) {
    if (!this.potentialDrag || event.pointerId !== this.dragPointerId) return;

    if (this.isDragging) {
      if (this.hasPointerCapture(event.pointerId)) {
        this.releasePointerCapture(event.pointerId);
      }

      const slideWidth = this.slides[0].clientWidth;
      if (slideWidth) {
        const index = Math.round(this.slider.scrollLeft / slideWidth);
        this.goToSlide(index);
      }

      if (this.dragMoved) {
        const preventClick = (clickEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopImmediatePropagation();
        };
        this.addEventListener('click', preventClick, { capture: true, once: true });
      }

      if (this.autoplayEnabled && !this.reducedMotion.matches) {
        this.startAutoplay();
      }
    }

    this.potentialDrag = false;
    this.isDragging = false;
    this.dragPointerId = null;
    this.slider.classList.remove('jane-hero__slider--dragging');
  }

  onScroll() {
    const slideWidth = this.slides[0].clientWidth;
    if (!slideWidth) return;
    const index = Math.round(this.slider.scrollLeft / slideWidth);
    if (index !== this.currentIndex) {
      this.currentIndex = index;
      this.updateBullets();
      this.updateSlideContentFade(index);
    }
  }

  goToSlide(index, behavior) {
    const slideWidth = this.slides[0].clientWidth;
    const maxIndex = this.slides.length - 1;
    const targetIndex = Math.max(0, Math.min(index, maxIndex));

    this.currentIndex = targetIndex;
    this.slider.scrollTo({
      left: slideWidth * targetIndex,
      behavior: behavior || (this.reducedMotion.matches ? 'auto' : 'smooth'),
    });
    this.updateBullets();
    this.updateSlideContentFade(targetIndex);
  }

  updateBullets() {
    this.bullets.forEach((bullet, index) => {
      const isActive = index === this.currentIndex;
      bullet.classList.toggle('jane-hero__bullet--active', isActive);
      bullet.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  onKeydown(event) {
    if (this.slides.length < 2) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      this.goToSlide(prev);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (this.currentIndex + 1) % this.slides.length;
      this.goToSlide(next);
    }
  }

  startAutoplay() {
    if (!this.autoplayEnabled || this.slides.length < 2) return;
    this.stopAutoplay();
    this.autoplayTimer = window.setInterval(() => {
      const next = (this.currentIndex + 1) % this.slides.length;
      this.goToSlide(next);
    }, this.autoplaySpeed);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  shouldAnimateContent() {
    if (this.reducedMotion.matches) return false;
    return (
      this.classList.contains('jane-hero-banner--fade-in-desktop') ||
      this.classList.contains('jane-hero-banner--fade-in-mobile')
    );
  }

  updateSlideContentFade(index) {
    const targetIndex = Math.max(0, Math.min(index, this.slides.length - 1));

    this.slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('jane-hero__slide--active', slideIndex === targetIndex);
    });

    if (!this.shouldAnimateContent()) {
      this.querySelectorAll('.jane-hero__content--animate').forEach((content) => {
        content.classList.add('jane-hero__content--visible');
      });
      return;
    }

    if (!this.classList.contains('jane-hero-banner--fade-visible')) return;

    this.querySelectorAll('.jane-hero__content--animate').forEach((content) => {
      content.classList.remove('jane-hero__content--visible');
    });

    const activeSlide = this.slides[targetIndex];
    if (!activeSlide) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        activeSlide.querySelectorAll('.jane-hero__content--animate').forEach((content) => {
          content.classList.add('jane-hero__content--visible');
        });
      });
    });
  }

  initFadeIn() {
    const hasFade =
      this.classList.contains('jane-hero-banner--fade-in-desktop') ||
      this.classList.contains('jane-hero-banner--fade-in-mobile');

    if (!hasFade) {
      this.updateSlideContentFade(this.currentIndex);
      return;
    }

    if (this.classList.contains('jane-hero-banner--fade-visible')) {
      this.updateSlideContentFade(this.currentIndex);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.classList.add('jane-hero-banner--fade-visible');
      this.updateSlideContentFade(this.currentIndex);
      return;
    }

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.classList.add('jane-hero-banner--fade-visible');
            this.updateSlideContentFade(this.currentIndex);
            this.fadeObserver.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );

    this.fadeObserver.observe(this);
  }

  initTransparentHeader() {
    if (!this.classList.contains('jane-hero-banner--transparent-header')) return;

    const section = this.closest('.shopify-section');
    const main = this.closest('main');
    if (!section || !main || main.querySelector('.shopify-section') !== section) return;

    this.transparentHeaderActive = true;
    document.body.classList.add('jane-hero-has-transparent-header');
    this.setTransparentHeaderOffset();

    this.onTransparentHeaderScroll = this.updateTransparentHeaderState.bind(this);
    window.addEventListener('scroll', this.onTransparentHeaderScroll, { passive: true });
    window.addEventListener('resize', this.onTransparentHeaderScroll, { passive: true });
    this.updateTransparentHeaderState();
  }

  setTransparentHeaderOffset() {
    const headerGroup = document.querySelector('.shopify-section-group-header-group');
    const headerHeight = headerGroup
      ? headerGroup.getBoundingClientRect().height
      : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;

    document.documentElement.style.setProperty('--jane-hero-header-offset', `${headerHeight}px`);
  }

  updateTransparentHeaderState() {
    if (!this.transparentHeaderActive) return;

    this.setTransparentHeaderOffset();
    const heroBottom = this.getBoundingClientRect().bottom;
    const headerOffset =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jane-hero-header-offset')) || 0;

    document.body.classList.toggle('jane-hero-header-solid', heroBottom <= headerOffset + 1);
  }

  destroyTransparentHeader() {
    if (!this.transparentHeaderActive) return;

    this.transparentHeaderActive = false;
    document.body.classList.remove('jane-hero-has-transparent-header', 'jane-hero-header-solid');

    if (this.onTransparentHeaderScroll) {
      window.removeEventListener('scroll', this.onTransparentHeaderScroll);
      window.removeEventListener('resize', this.onTransparentHeaderScroll);
      this.onTransparentHeaderScroll = null;
    }
  }
}

customElements.define('jane-hero-banner', JaneHeroBanner);
