class Otta {
  static init() {
    this.bindAtlas();
    this.bindProjectGalleries();
    this.bindSliders();
    this.bindNavHighlight();
    this.bindRuotaStagioni();
  }

  static bindAtlas() {
    const buttons = Array.from(document.querySelectorAll('[data-atlas-button]'));
    const groups = Array.from(document.querySelectorAll('[data-atlas-group]'));
    const stageImage = document.querySelector('[data-stage-image]');
    const stageCaption = document.querySelector('[data-stage-caption]');

    if (!buttons.length || !groups.length || !stageImage || !stageCaption) {
      return;
    }

    const setStage = (thumb) => {
      if (!thumb) return;
      stageImage.src = thumb.dataset.src;
      stageImage.alt = thumb.dataset.alt || '';
      stageCaption.textContent = thumb.dataset.caption || '';

      document.querySelectorAll('[data-thumb]').forEach((item) => {
        item.classList.toggle('is-active', item === thumb);
      });
    };

    const setGroup = (groupName) => {
      groups.forEach((group) => {
        const isActive = group.dataset.atlasGroup === groupName;
        group.hidden = !isActive;
      });

      buttons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.atlasGroup === groupName);
      });

      const activeGroup = groups.find((group) => group.dataset.atlasGroup === groupName);
      const firstThumb = activeGroup ? activeGroup.querySelector('[data-thumb]') : null;
      setStage(firstThumb);
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => setGroup(button.dataset.atlasGroup));
    });

    document.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => setStage(thumb));
    });

    const defaultGroup = buttons.find((button) => button.classList.contains('is-active'));
    if (defaultGroup) {
      setGroup(defaultGroup.dataset.atlasGroup);
    }
  }

  static bindNavHighlight() {
    const links = Array.from(document.querySelectorAll('.nav a[data-scroll]'));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === `#${entry.target.id}`
              );
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  static bindProjectGalleries() {
    const triggers = Array.from(document.querySelectorAll('[data-gallery-trigger]'));
    const modal = document.querySelector('[data-gallery-modal]');

    if (!triggers.length || !modal) return;

    const image = modal.querySelector('[data-gallery-image]');
    const title = modal.querySelector('[data-gallery-title]');
    const desc = modal.querySelector('[data-gallery-desc]');
    const closeBtn = modal.querySelector('[data-gallery-close]');
    const prevBtn = modal.querySelector('[data-gallery-prev]');
    const nextBtn = modal.querySelector('[data-gallery-next]');

    let currentImages = [];
    let currentIndex = 0;
    let currentTitle = 'Galleria progetto';
    let closeTimeout = null;
    let closeListener = null;

    const setIndex = (nextIndex) => {
      if (!currentImages.length) return;
      currentIndex = (nextIndex + currentImages.length) % currentImages.length;
      if (image) {
        image.style.backgroundImage ='url("'+currentImages[currentIndex]+'")';
        image.alt = currentTitle;
      }
    };

    const openModal = (trigger) => {
      const tpl = trigger.querySelector('template[data-gallery]');
      if (!tpl) return;
      const content = tpl.content;

      const images = (content.querySelector('[data-gallery-images]')?.textContent || '')
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean);

      if (!images.length) return;

      currentImages = images;
      currentIndex = 0;
      currentTitle = content.querySelector('[data-gallery-title]')?.textContent || 'Galleria progetto';

      if (title) {
        title.textContent = currentTitle;
      }

      if (desc) {
        const descEl = content.querySelector('[data-gallery-desc]');
        const descHTML = descEl ? descEl.innerHTML : '';
        desc.innerHTML = descHTML;
        desc.hidden = !descHTML;
      }

      setIndex(0);

      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      if (closeListener) {
        modal.removeEventListener('transitionend', closeListener);
        closeListener = null;
      }

      modal.removeAttribute('hidden');
      modal.classList.remove('is-closing');
      window.requestAnimationFrame(() => modal.classList.add('is-open'));
      document.body.classList.add('gallery-open');
    };

    const closeModal = () => {
      if (modal.hasAttribute('hidden') || modal.classList.contains('is-closing')) return;
      modal.classList.remove('is-open');
      modal.classList.add('is-closing');
      document.body.classList.remove('gallery-open');

      const finalizeClose = () => {
        if (modal.hasAttribute('hidden')) return;
        modal.setAttribute('hidden', '');
        modal.classList.remove('is-closing');
        if (closeListener) {
          modal.removeEventListener('transitionend', closeListener);
          closeListener = null;
        }
      };

      closeListener = (event) => {
        if (event.target !== modal) return;
        finalizeClose();
      };

      modal.addEventListener('transitionend', closeListener);
      closeTimeout = window.setTimeout(finalizeClose, 320);
    };

    const handleTriggerClick = (event) => {
      const trigger = event.target.closest('[data-gallery-trigger]');
      if (!trigger) return;
      event.preventDefault();
      openModal(trigger);
    };

    document.addEventListener('click', handleTriggerClick);

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => setIndex(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => setIndex(currentIndex + 1));
    }

    document.addEventListener('keydown', (event) => {
      if (modal.hasAttribute('hidden')) return;
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') setIndex(currentIndex - 1);
      if (event.key === 'ArrowRight') setIndex(currentIndex + 1);
    });
  }

  static bindSliders() {
    const sliders = Array.from(document.querySelectorAll('[data-slider]'));
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const track = slider.querySelector('[data-slider-track]');
      const prev = slider.querySelector('[data-slider-prev]');
      const next = slider.querySelector('[data-slider-next]');

      if (!track || !prev || !next) return;

      const slides = Array.from(track.querySelectorAll('.slider-slide'));
      if (!slides.length) return;

      let index = 0;

      const render = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
      };

      prev.addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        render();
      });

      next.addEventListener('click', () => {
        index = (index + 1) % slides.length;
        render();
      });

      render();
    });
  }

  static bindRuotaStagioni() {
    const viewer = document.querySelector('[data-ruota-viewer]');
    const image = document.querySelector('[data-ruota-image]');

    if (!viewer || !image) return;

    let rotation = 0;
    let isDragging = false;
    let startAngle = 0;
    let startRotation = 0;

    const getAngle = (centerX, centerY, pointX, pointY) => {
      return Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);
    };

    const updateTransform = () => {
      image.style.transform = `rotate(${rotation}deg)`;
    };

    const handleStart = (event) => {
      isDragging = true;
      const rect = viewer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      startAngle = getAngle(centerX, centerY, clientX, clientY);
      startRotation = rotation;
    };

    const handleMove = (event) => {
      if (!isDragging) return;
      event.preventDefault();

      const rect = viewer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const currentAngle = getAngle(centerX, centerY, clientX, clientY);
      const angleDiff = currentAngle - startAngle;

      rotation = startRotation + angleDiff;
      updateTransform();
    };

    const handleEnd = () => {
      isDragging = false;
    };

    // Mouse events
    viewer.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    viewer.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    updateTransform();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Otta.init();
});
