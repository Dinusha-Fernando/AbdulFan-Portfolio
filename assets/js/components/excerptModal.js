/**
 * LITERARY EXCERPTS MODAL COMPONENT
 * Manages preview modal dialogs for any of the 32 published novels in BOOKS_CATALOG.
 */

import { BOOKS_CATALOG } from './booksData.js';

export function initExcerptModal() {
  const excerptModal = document.getElementById('excerpt-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBookTitle = document.getElementById('modal-book-title');
  const modalBookMeta = document.getElementById('modal-book-meta');
  const modalExcerptText = document.getElementById('modal-excerpt-text');

  function openBookModal(bookId) {
    const book = BOOKS_CATALOG.find((b) => b.id === Number(bookId));
    if (!book || !excerptModal) return;

    if (modalBookTitle) modalBookTitle.textContent = book.title;
    if (modalBookMeta) {
      modalBookMeta.innerHTML = `
        <span style="color: ${book.accent}; font-weight: 600;">${book.categoryLabel.toUpperCase()}</span> · Published ${book.year} · ${book.pages}
      `;
    }

    if (modalExcerptText) {
      modalExcerptText.innerHTML = `
        <div class="modal-book-layout">
          <div class="modal-cover-preview">
            <div class="modal-mini-cover" style="background: ${book.coverGradient}; border-color: ${book.accent}66;">
              <div class="modal-cover-seal" title="AbdulFandom Press">AF</div>
              <span class="modal-cover-cat" style="color: ${book.accent};">${book.categoryLabel}</span>
              <h4 class="modal-cover-title">${book.title}</h4>
              <span class="modal-cover-author">ABDUL UMAR SAHAN NETHMINA</span>
            </div>
          </div>
          <div class="modal-content-details">
            <p class="modal-synopsis-highlight">${book.synopsis}</p>
            <blockquote class="modal-quote-highlight">${book.quote}</blockquote>
          </div>
        </div>
        <div class="modal-excerpt-body">
          <h4 class="modal-sample-heading">Selected Literary Excerpt</h4>
          ${book.excerpt}
        </div>
        <div class="modal-footer-actions" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="https://abdulfandom.lk/" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm">
            <span>Order Book at abdulfandom.lk ↗</span>
          </a>
          <a href="#contact" class="btn btn-outline btn-sm modal-contact-btn" data-book-title="${book.title}">
            <span>Inquire About Translation or Rights</span>
          </a>
        </div>
      `;

      const contactBtn = modalExcerptText.querySelector('.modal-contact-btn');
      if (contactBtn) {
        contactBtn.addEventListener('click', () => {
          excerptModal.classList.remove('open');
          const subjectInput = document.getElementById('inquiry-subject');
          const rightsRadio = document.querySelector('input[name="inquiry_type"][value="Literary / Book Rights"]');
          if (subjectInput) {
            subjectInput.value = `Inquiry regarding "${book.title}" (Abdul Umar Sahan Nethmina)`;
          }
          if (rightsRadio) rightsRadio.checked = true;
        });
      }
    }

    excerptModal.classList.add('open');
  }

  // Bind clicks dynamically
  function bindExcerptButtons() {
    document.querySelectorAll('.read-excerpt-btn').forEach((btn) => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const bookId = this.getAttribute('data-book-id');
        if (bookId) openBookModal(bookId);
      };
    });
  }

  // Initial bind
  bindExcerptButtons();

  // Listen for re-bind events after dynamic updates
  window.addEventListener('rebind-excerpt-btns', bindExcerptButtons);

  // Listen for custom open-book-modal event
  window.addEventListener('open-book-modal', (e) => {
    if (e.detail && e.detail.bookId) {
      openBookModal(e.detail.bookId);
    }
  });

  if (modalCloseBtn && excerptModal) {
    modalCloseBtn.addEventListener('click', () => excerptModal.classList.remove('open'));
    excerptModal.addEventListener('click', (e) => {
      if (e.target === excerptModal) excerptModal.classList.remove('open');
    });
  }
}
