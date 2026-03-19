class Otta {
  static init() {
    this.bindProjectGalleries();
    this.bindSliders();
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
    let imageTimeout = null;

    const setIndex = (nextIndex) => {
      if (!currentImages.length) return;
      currentIndex = (nextIndex + currentImages.length) % currentImages.length;
      if (image) {
        if (imageTimeout) {
          window.clearTimeout(imageTimeout);
          imageTimeout = null;
        }

        image.classList.add('is-transitioning');
        imageTimeout = window.setTimeout(() => {
          image.style.backgroundImage ='url("'+currentImages[currentIndex]+'")';
          image.classList.remove('is-transitioning');
        }, 90);
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
}

document.addEventListener('DOMContentLoaded', () => {
  Otta.init();
});
