// Homepage service guidance carousel
(function () {
  'use strict';

  const slider = document.querySelector('#home-assistance-slider');
  if (!slider) return;

  const track = slider.querySelector('.home-slider-track');
  const slides = Array.from(slider.querySelectorAll('.home-slider-slide'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slideInterval = 3000;
  let activeIndex = 0;
  let autoAdvanceTimer = 0;
  let pointerStart = null;

  function updateLanguageLabels() {
    const language = document.body.getAttribute('data-lang') === 'ta' ? 'ta' : 'en';

    document.querySelectorAll('[data-aria-en]').forEach(element => {
      element.setAttribute('aria-label', element.getAttribute(`data-aria-${language}`));
    });

    slider.querySelectorAll('img[data-alt-en]').forEach(image => {
      image.alt = image.getAttribute(`data-alt-${language}`);
    });

    slides.forEach((slide, index) => {
      slide.setAttribute(
        'aria-label',
        language === 'ta'
          ? `படம் ${index + 1}, மொத்தம் ${slides.length}`
          : `${index + 1} of ${slides.length}`
      );
    });
  }

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', String(slideIndex !== activeIndex));
    });
  }

  function stopAutoAdvance() {
    window.clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = 0;
  }

  function startAutoAdvance() {
    if (autoAdvanceTimer || reducedMotion.matches || document.hidden) return;
    autoAdvanceTimer = window.setInterval(() => showSlide(activeIndex + 1), slideInterval);
  }

  function resumeAfterInteraction() {
    startAutoAdvance();
  }

  slider.addEventListener('pointerdown', event => {
    if (!['touch', 'mouse'].includes(event.pointerType) || event.target.closest('button')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    slider.setPointerCapture(event.pointerId);
    if (event.pointerType === 'mouse') event.preventDefault();
    stopAutoAdvance();
  });

  slider.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    resumeAfterInteraction();
  });

  slider.addEventListener('pointercancel', () => {
    if (!pointerStart) return;
    pointerStart = null;
    resumeAfterInteraction();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoAdvance();
    } else {
      startAutoAdvance();
    }
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) {
      stopAutoAdvance();
    } else {
      startAutoAdvance();
    }
  };

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  new MutationObserver(updateLanguageLabels).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-lang']
  });

  updateLanguageLabels();
  showSlide(activeIndex);
  startAutoAdvance();
})();
