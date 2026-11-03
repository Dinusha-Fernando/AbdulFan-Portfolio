/**
 * GALLERY & LIGHTBOX COMPONENT
 * Manages photo filtering by category and full-resolution lightbox viewing.
 */

export function initGallery() {
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryTabs = document.querySelectorAll('.gallery-tab');

  // Filter tabs
  galleryTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      galleryTabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');
      galleryItems.forEach((item) => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox click trigger
  galleryItems.forEach((item) => {
    item.addEventListener('click', function () {
      const img = this.querySelector('img');
      const caption = this.querySelector('.gallery-caption');
      if (img && galleryLightbox && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) {
          lightboxCaption.textContent = caption ? caption.textContent : '';
        }
        galleryLightbox.classList.add('open');
      }
    });
  });

  // Lightbox close
  if (lightboxClose && galleryLightbox) {
    lightboxClose.addEventListener('click', () => galleryLightbox.classList.remove('open'));
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox) galleryLightbox.classList.remove('open');
    });
  }
}

