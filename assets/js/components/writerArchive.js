/**
 * WRITER ARCHIVE COMPONENT
 * Interactive 32-Book Literary Salon:
 * 1. Marquee Masterworks Spotlight Selector (Top 3 Releases)
 * 2. 3D Bookshelf (Spine View for all 32 published works)
 * 3. Instant Real-Time Search & Category Filters
 */

import { BOOKS_CATALOG } from './booksData.js';

export function initWriterArchive() {
  const spotlightContainer = document.getElementById('marquee-spotlight-wrap');
  const spotlightTabs = document.querySelectorAll('.spotlight-tab');
  const shelfContainer = document.getElementById('bookshelf-shelf');
  const searchInput = document.getElementById('book-search-input');
  const searchCount = document.getElementById('book-search-count');
  const filterTabs = document.querySelectorAll('.writer-filter-pill');
  
  let currentCategory = 'all';
  let searchQuery = '';
  let activeSpotlightIndex = 0;

  // -------------------------------------------------------------
  // 1. MARQUEE SPOTLIGHT CONTROLLER (Top 3 Masterworks)
  // -------------------------------------------------------------
  const SPOTLIGHT_BOOKS = [
    BOOKS_CATALOG[0], // Echoes of the Silent Horizon
    BOOKS_CATALOG[1], // The Architecture of Solitude
    BOOKS_CATALOG[2]  // Whispers Beneath the Banyan
  ];

  function renderSpotlight(index) {
    activeSpotlightIndex = index;
    const book = SPOTLIGHT_BOOKS[index];
    if (!book || !spotlightContainer) return;

    spotlightTabs.forEach((tab, idx) => {
      if (idx === index) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    spotlightContainer.innerHTML = `
      <article class="book-card spotlight-card animate-fade-in" data-book="${book.id}">
        <div class="book-3d-wrapper">
          <div class="book-cover-mockup book-cover-${book.id}">
            <div class="book-spine"></div>
            <div class="book-front" style="background: ${book.coverGradient}; border-color: ${book.accent}55;">
              <div class="book-gold-seal" title="AbdulFandom Press">AF</div>
              <div class="book-titles">
                <span class="book-genre" style="color: ${book.accent};">${book.categoryLabel.toUpperCase()}</span>
                <h3 class="book-name">${book.title}</h3>
                <span class="book-author">ABDUL UMAR SAHAN NETHMINA</span>
              </div>
              <div class="book-motif motif-${book.id}"></div>
              <div class="book-foil-accent"></div>
            </div>
          </div>
        </div>

        <div class="book-info">
          <div class="book-meta">
            <span class="book-status" style="color: ${book.accent};">${book.categoryLabel.toUpperCase()}</span>
            <span class="book-year">Published ${book.year} · ${book.pages}</span>
          </div>
          <h3 class="book-title">${book.title}</h3>
          <p class="book-synopsis">${book.synopsis}</p>
          <blockquote class="book-quote">${book.quote}</blockquote>
          <div class="book-actions">
            <button class="btn btn-gold btn-sm read-excerpt-btn" data-book-id="${book.id}">
              <span>Read Sample Excerpt</span>
            </button>
            <a href="https://abdulfandom.lk/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              <span>Order at abdulfandom.lk ↗</span>
            </a>
            <a href="#contact" class="btn btn-outline btn-sm book-inquire-btn" data-book-title="${book.title}">
              <span>Signed Copy</span>
            </a>
          </div>
        </div>
      </article>
    `;

    // Re-bind excerpt buttons
    window.dispatchEvent(new CustomEvent('rebind-excerpt-btns'));
  }

  if (spotlightTabs.length > 0) {
    spotlightTabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-spotlight-idx'), 10);
        renderSpotlight(idx);
      });
    });
    renderSpotlight(0);
  }

  // -------------------------------------------------------------
  // 2. FILTERING & SEARCH LOGIC FOR ALL 32 BOOKS
  // -------------------------------------------------------------
  function getFilteredBooks() {
    return BOOKS_CATALOG.filter((book) => {
      const matchCat = currentCategory === 'all' || book.category === currentCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        book.title.toLowerCase().includes(q) ||
        String(book.year).includes(q) ||
        book.categoryLabel.toLowerCase().includes(q) ||
        book.synopsis.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  function updateCountBadge(count) {
    if (searchCount) {
      searchCount.textContent = `${count} of 32 Works`;
    }
  }

  // -------------------------------------------------------------
  // 3. RENDER 3D BOOKSHELF (Authentic Library Spines)
  // -------------------------------------------------------------
  function renderBookshelf() {
    if (!shelfContainer) return;
    const books = getFilteredBooks();
    updateCountBadge(books.length);

    if (books.length === 0) {
      shelfContainer.innerHTML = `
        <div class="shelf-empty-state">
          <p>No literary works matched your search or category filter.</p>
          <button class="btn btn-outline btn-sm reset-filter-btn">
            <span>Reset Filters</span>
          </button>
        </div>
      `;
      const resetBtn = shelfContainer.querySelector('.reset-filter-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      return;
    }

    let html = '<div class="shelf-spines-row">';
    books.forEach((book) => {
      // Deterministic slight variations in spine height and width for realism
      const heightVar = 205 + ((book.id * 5) % 30);
      const widthVar = 30 + ((book.id * 3) % 10);

      html += `
        <div class="spine-item" 
             data-book-id="${book.id}"
             style="--spine-h: ${heightVar}px; --spine-w: ${widthVar}px; --spine-color: ${book.color}; --spine-accent: ${book.accent};"
             title="${book.title} (${book.year})">
          <div class="spine-body">
            <span class="spine-year">${book.year}</span>
            <div class="spine-title-wrap">
              <span class="spine-title">${book.title}</span>
            </div>
            <span class="spine-seal" title="AbdulFandom">AF</span>
            <div class="spine-ribbon"></div>
          </div>
          <div class="spine-tooltip">
            <strong>${book.title}</strong>
            <span>${book.year} · ${book.categoryLabel}</span>
            <em>Click to Open Book</em>
          </div>
        </div>
      `;
    });
    html += '</div><div class="shelf-ledge"><div class="shelf-ledge-glow"></div></div>';

    shelfContainer.innerHTML = html;

    // Attach click listeners to spines
    shelfContainer.querySelectorAll('.spine-item').forEach((spine) => {
      spine.addEventListener('click', function () {
        const bookId = parseInt(this.getAttribute('data-book-id'), 10);
        window.dispatchEvent(new CustomEvent('open-book-modal', { detail: { bookId } }));
      });
    });
  }

  function resetAllFilters() {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    filterTabs.forEach((tab) => {
      if (tab.getAttribute('data-category') === 'all') tab.classList.add('active');
      else tab.classList.remove('active');
    });
    renderBookshelf();
  }

  // -------------------------------------------------------------
  // 4. EVENT BINDINGS
  // -------------------------------------------------------------
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      filterTabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.getAttribute('data-category');
      renderBookshelf();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      searchQuery = e.target.value;
      renderBookshelf();
    });
  }

  // Pre-fill contact form when "Inquire / Signed Copy" is clicked
  document.addEventListener('click', (e) => {
    const inquireBtn = e.target.closest('.book-inquire-btn');
    if (inquireBtn) {
      const bookTitle = inquireBtn.getAttribute('data-book-title');
      const subjectInput = document.getElementById('inquiry-subject');
      const rightsRadio = document.querySelector('input[name="inquiry_type"][value="Literary / Book Rights"]');
      if (subjectInput && bookTitle) {
        subjectInput.value = `Inquiry regarding "${bookTitle}" (Abdul Umar Sahan Nethmina)`;
      }
      if (rightsRadio) {
        rightsRadio.checked = true;
      }
    }
  });

  // Initial render
  renderBookshelf();
}
