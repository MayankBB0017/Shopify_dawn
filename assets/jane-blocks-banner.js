
/* =========================================
   JANÉ BLOCKS BANNER
========================================= */

.jbb {
  padding-top: var(--jbb-padding-top);
  padding-bottom: var(--jbb-padding-bottom);
  overflow: hidden;
}

.jbb__container {
  width: 100%;
}

.jbb__header {
  margin-bottom: 18px;
}

.jbb__section-heading {
  margin: 0;
  color: var(--jbb-title-color);
  font-size: var(--jbb-title-desktop);
  line-height: 1.2;
  font-weight: 500;
}

.jbb__description {
  margin-top: 8px;
}

/* GRID */

.jbb__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--jbb-gap);
}

/* 2 IMAGES */

.jbb--desktop-two .jbb__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* 3 IMAGES */

.jbb--desktop-three .jbb__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* 4 IMAGES */

.jbb--desktop-four .jbb__grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* FEATURED LEFT */

.jbb--desktop-featured-left .jbb__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.jbb--desktop-featured-left .jbb__item:first-child {
  grid-column: span 2;
  grid-row: span 2;
}

/* FEATURED RIGHT */

.jbb--desktop-featured-right .jbb__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.jbb--desktop-featured-right .jbb__item:last-child {
  grid-column: span 2;
  grid-row: span 2;
}

/* ITEM */

.jbb__item {
  min-width: 0;
  min-height: 0;
}

.jbb__link {
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border-radius: var(--jbb-radius);
}

.jbb__media {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180px;
  overflow: hidden;
  background: #eee;
}

/* IMAGE RATIOS */

.jbb__media--adapt {
  min-height: 1px;
}

.jbb__media--square {
  aspect-ratio: 1 / 1;
}

.jbb__media--portrait {
  aspect-ratio: 4 / 5;
}

.jbb__media--landscape {
  aspect-ratio: 16 / 9;
}

.jbb__media picture {
  display: block;
  width: 100%;
  height: 100%;
}

.jbb__image,
.jbb__placeholder {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.jbb__media--adapt .jbb__image {
  height: auto;
}

.jbb__item:first-child .jbb__media {
  min-height: 100%;
}

/* OVERLAY */

.jbb__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, var(--jbb-overlay)) 0%,
    rgba(0, 0, 0, 0) 65%
  );
}

/* CONTENT */

.jbb__content {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  padding: 24px;
  color: var(--jbb-text-color);
  pointer-events: none;
}

.jbb__content--top-left {
  top: 0;
}

.jbb__content--top-center {
  top: 0;
  text-align: center;
}

.jbb__content--center-left {
  top: 50%;
  transform: translateY(-50%);
}

.jbb__content--center {
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
}

.jbb__content--bottom-left {
  bottom: 0;
}

.jbb__content--bottom-center {
  bottom: 0;
  text-align: center;
}

/* TITLES */

.jbb__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.jbb__title {
  margin: 0;
  color: inherit;
  font-size: var(
    --jbb-block-title-desktop,
    var(--jbb-title-desktop)
  );
  line-height: 1.15;
  font-weight: 500;
}

.jbb__text {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
}

/* BUTTON */

.jbb__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  padding: 10px 24px;
  min-height: 38px;
  border: 1px solid currentColor;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* HOVER */

.jbb__image {
  transition: transform 0.5s ease;
}

.jbb__link:hover .jbb__image {
  transform: scale(1.025);
}

/* CAROUSEL CONTROLS */

.jbb__controls {
  display: none;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.jbb__arrow {
  width: 38px;
  height: 38px;
  border: 1px solid #222;
  border-radius: 50%;
  background: transparent;
  color: #222;
  cursor: pointer;
}

/* =========================================
   MOBILE
========================================= */

@media screen and (max-width: 749px) {

  .jbb__header {
    margin-bottom: 12px;
  }

  .jbb__section-heading {
    font-size: var(--jbb-title-mobile);
  }

  /* STACKED */

  .jbb--mobile-stacked .jbb__grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  /* TWO COLUMNS */

  .jbb--mobile-two .jbb__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* MOBILE CAROUSEL */

  .jbb--mobile-carousel .jbb__grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    gap: var(--jbb-gap);
  }

  .jbb--mobile-carousel .jbb__grid::-webkit-scrollbar {
    display: none;
  }

  .jbb--mobile-carousel .jbb__item {
    flex: 0 0 85%;
    scroll-snap-align: start;
  }

  .jbb--mobile-carousel .jbb__controls {
    display: flex;
  }

  .jbb__content {
    padding: 14px;
  }

  .jbb__title {
    font-size: var(
      --jbb-block-title-mobile,
      var(--jbb-title-mobile)
    );
  }

  .jbb__text {
    font-size: 12px;
  }

  .jbb__button {
    margin-top: 10px;
    padding: 8px 16px;
  }

  .jbb__media {
    min-height: 160px;
  }

  .jbb__item:first-child .jbb__media {
    min-height: 160px;
  }

  .jbb--mobile-stacked .jbb__media--adapt .jbb__image,
  .jbb--mobile-two .jbb__media--adapt .jbb__image {
    height: auto;
  }

  .jbb--mobile-stacked .jbb__item:first-child {
    grid-column: auto;
    grid-row: auto;
  }

  .jbb--mobile-two .jbb__item:first-child {
    grid-column: auto;
    grid-row: auto;
  }

}

/* ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {
  .jbb__image,
  .jbb__grid {
    transition: none;
    scroll-behavior: auto;
  }
}
