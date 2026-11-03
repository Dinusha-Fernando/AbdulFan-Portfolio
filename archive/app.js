(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & STATE
  // =========================================================================
  const TOTAL_FRAMES = 238;
  const images = new Array(TOTAL_FRAMES);

  let loadedFrames = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let lastRenderedIndex = -1;
  let needsRedraw = true;

  // DOM Elements
  const canvas = document.getElementById('global-sequence-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;

  // Preloader
  const preloader = document.getElementById('site-preloader');
  const preloaderProgress = document.getElementById('preloader-progress');
  const preloaderPercent = document.getElementById('preloader-percent');

  // Cursor
  const cursorRing = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');

  // Nav & Header
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Music Showcase Elements (Visual Player)
  const mainMusicPlayBtn = document.getElementById('main-music-play-btn');
  const musicPlaySvg = document.getElementById('music-play-svg');
  const musicPauseSvg = document.getElementById('music-pause-svg');
  const vinylRecordWrap = document.getElementById('vinyl-record-wrap');
  const waveformBarsContainer = document.getElementById('waveform-bars');
  const trackTitleEl = document.getElementById('track-title');
  const vinylLabelTitleEl = document.getElementById('vinyl-label-title');
  const playerTimeCurrent = document.getElementById('player-time-current');
  const playerTimeTotal = document.getElementById('player-time-total');
  const playerProgressBar = document.getElementById('player-progress-bar');
  const playerProgressFill = document.getElementById('player-progress-fill');
  const trackItems = document.querySelectorAll('.track-item');
  const prevTrackBtn = document.getElementById('prev-track-btn');
  const nextTrackBtn = document.getElementById('next-track-btn');

  // Modals & Lightbox
  const excerptModal = document.getElementById('excerpt-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBookTitle = document.getElementById('modal-book-title');
  const modalExcerptText = document.getElementById('modal-excerpt-text');
  const readExcerptBtns = document.querySelectorAll('.read-excerpt-btn');

  const galleryLightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryTabs = document.querySelectorAll('.gallery-tab');

  // Contact Form
  const contactForm = document.getElementById('portfolio-contact-form');
  const formFeedback = document.getElementById('form-feedback');

  // =========================================================================
  // 1. LENIS SMOOTH SCROLL INITIALIZATION
  // =========================================================================
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenis.on('scroll', (e) => {
      // Header sticky styling
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Update active nav link based on section in view
      updateActiveNavLink();

      // Update target scroll progress directly from Lenis
      if (typeof e.progress === 'number') {
        targetProgress = Math.max(0, Math.min(1, e.progress));
      }
    });
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    let currentId = 'hero';
    sections.forEach((section) => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
        }
      }
    });
  });

  // Mobile Menu Toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // =========================================================================
  // 2. CUSTOM CURSOR
  // =========================================================================
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  if (cursorRing && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const interactiveElements = document.querySelectorAll('a, button, .pillar-card, .book-card, .gallery-item, .track-item, input, textarea');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  // =========================================================================
  // 3. GLOBAL ANIMATED BACKGROUND CANVAS ENGINE
  // =========================================================================
  function getFrameFilename(index) {
    const num = String(index + 1).padStart(3, '0');
    return `images/ezgif-frame-${num}.jpg`;
  }

  function resizeGlobalCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      needsRedraw = true;
    }
  }

  function drawCoverImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0 || !ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const ox = (cw - nw) * 0.5;
    const oy = (ch - nh) * 0.5;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, ox, oy, nw, nh);
  }

  function getBestLoadedFrame(index) {
    if (images[index] && images[index].complete && images[index].naturalWidth > 0) {
      return images[index];
    }
    for (let delta = 1; delta < TOTAL_FRAMES; delta++) {
      const prev = index - delta;
      if (prev >= 0 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) return images[prev];
      const next = index + delta;
      if (next < TOTAL_FRAMES && images[next] && images[next].complete && images[next].naturalWidth > 0) return images[next];
    }
    return null;
  }

  function renderFrame(index) {
    const img = getBestLoadedFrame(index);
    if (img) {
      drawCoverImage(img);
    }
  }

  // Preload all 238 frames
  function preloadFrames() {
    resizeGlobalCanvas();

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameFilename(i);

      img.onload = () => handleFrameLoaded(i);
      img.onerror = () => handleFrameLoaded(i);
      images[i] = img;
    }
  }

  function handleFrameLoaded(index) {
    loadedFrames++;

    if (index === 0) {
      renderFrame(0);
      lastRenderedIndex = 0;
      needsRedraw = true;
    }

    const percent = Math.min(100, Math.round((loadedFrames / TOTAL_FRAMES) * 100));
    if (preloaderProgress) preloaderProgress.style.width = `${percent}%`;
    if (preloaderPercent) preloaderPercent.textContent = `${percent}%`;

    if (loadedFrames >= TOTAL_FRAMES || (loadedFrames >= 30 && percent >= 20)) {
      if (preloader && !preloader.classList.contains('loaded')) {
        setTimeout(() => {
          preloader.classList.add('loaded');
        }, 300);
      }
    }
  }

  // Main Render Loop (Interpolates frames smoothly with whole-site scroll)
  function renderLoop(time) {
    if (lenis) {
      lenis.raf(time);
    } else {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = scrollHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollHeight)) : 0;
    }

    // High precision LERP for liquid-smooth background animation
    const lerpFactor = 0.12;
    currentProgress += (targetProgress - currentProgress) * lerpFactor;

    if (Math.abs(targetProgress - currentProgress) < 0.00005) {
      currentProgress = targetProgress;
    }

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    if (frameIndex !== lastRenderedIndex || needsRedraw) {
      renderFrame(frameIndex);
      lastRenderedIndex = frameIndex;
      needsRedraw = false;
    }

    requestAnimationFrame(renderLoop);
  }

  // =========================================================================
  // 4. MUSIC DISCOGRAPHY SHOWCASE (PURE VISUAL - NO SOUND)
  // =========================================================================
  let isMusicPlaying = false;
  let currentTrackIndex = 0;
  let musicPlaybackInterval = null;
  let trackSecondsElapsed = 0;

  const PLAYLIST = [
    { title: 'Midnight Echoes', duration: 222, genre: 'Acoustic Soul · 2024' },
    { title: 'Sands of Time', duration: 255, genre: 'Atmospheric Ballad · 2024' },
    { title: 'Unspoken Vows', duration: 198, genre: 'Piano & Vocals · 2023' },
    { title: 'Resonance', duration: 302, genre: 'Cinematic Orchestral · 2023' }
  ];

  // Populate dynamic waveform visualizer bars
  if (waveformBarsContainer) {
    waveformBarsContainer.innerHTML = '';
    const NUM_BARS = 36;
    for (let i = 0; i < NUM_BARS; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform-bar';
      const staticHeight = 20 + Math.sin(i * 0.3) * 35 + ((i % 5) * 8);
      bar.style.height = `${staticHeight}%`;
      bar.style.animationDelay = `${(i * 0.05).toFixed(2)}s`;
      waveformBarsContainer.appendChild(bar);
    }
  }

  function setMusicPlayingState(playing) {
    isMusicPlaying = playing;
    if (playing) {
      if (musicPlaySvg) musicPlaySvg.classList.add('hidden');
      if (musicPauseSvg) musicPauseSvg.classList.remove('hidden');
      if (vinylRecordWrap) vinylRecordWrap.classList.add('spinning');
      if (waveformBarsContainer) waveformBarsContainer.classList.add('playing');

      clearInterval(musicPlaybackInterval);
      musicPlaybackInterval = setInterval(() => {
        trackSecondsElapsed++;
        const total = PLAYLIST[currentTrackIndex].duration;
        if (trackSecondsElapsed >= total) {
          nextTrack();
          return;
        }
        updateMusicPlayerUI();
      }, 1000);
    } else {
      if (musicPlaySvg) musicPlaySvg.classList.remove('hidden');
      if (musicPauseSvg) musicPauseSvg.classList.add('hidden');
      if (vinylRecordWrap) vinylRecordWrap.classList.remove('spinning');
      if (waveformBarsContainer) waveformBarsContainer.classList.remove('playing');

      clearInterval(musicPlaybackInterval);
    }
  }

  function updateMusicPlayerUI() {
    const curM = Math.floor(trackSecondsElapsed / 60);
    const curS = Math.floor(trackSecondsElapsed % 60);
    if (playerTimeCurrent) playerTimeCurrent.textContent = `${curM}:${String(curS).padStart(2, '0')}`;

    const total = PLAYLIST[currentTrackIndex].duration;
    const totM = Math.floor(total / 60);
    const totS = Math.floor(total % 60);
    if (playerTimeTotal) playerTimeTotal.textContent = `${totM}:${String(totS).padStart(2, '0')}`;

    const percent = (trackSecondsElapsed / total) * 100;
    if (playerProgressFill) playerProgressFill.style.width = `${percent}%`;
  }

  function loadTrack(index) {
    currentTrackIndex = index;
    trackSecondsElapsed = 0;
    const track = PLAYLIST[index];

    if (trackTitleEl) trackTitleEl.textContent = track.title;
    if (vinylLabelTitleEl) vinylLabelTitleEl.textContent = track.title.toUpperCase();

    trackItems.forEach((item, idx) => {
      if (idx === index) item.classList.add('active');
      else item.classList.remove('active');
    });

    updateMusicPlayerUI();
  }

  function nextTrack() {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    loadTrack(nextIdx);
  }

  function prevTrack() {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(prevIdx);
  }

  if (mainMusicPlayBtn) {
    mainMusicPlayBtn.addEventListener('click', () => {
      setMusicPlayingState(!isMusicPlaying);
    });
  }

  if (nextTrackBtn) nextTrackBtn.addEventListener('click', nextTrack);
  if (prevTrackBtn) prevTrackBtn.addEventListener('click', prevTrack);

  trackItems.forEach((item) => {
    item.addEventListener('click', function () {
      const idx = parseInt(this.getAttribute('data-track-index'), 10);
      loadTrack(idx);
      setMusicPlayingState(true);
    });
  });

  if (playerProgressBar) {
    playerProgressBar.addEventListener('click', (e) => {
      const rect = playerProgressBar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const total = PLAYLIST[currentTrackIndex].duration;
      trackSecondsElapsed = Math.floor(fraction * total);
      updateMusicPlayerUI();
    });
  }

  // =========================================================================
  // 5. LITERARY EXCERPTS MODAL
  // =========================================================================
  const EXCERPTS = {
    1: {
      title: "Echoes of the Silent Horizon",
      genre: "Literary Fiction · Published 2024",
      content: `
        <p>The dawn that arrived over the western ridge did not bring clarity; it merely stripped the world of its comforting shadows. Sahan pulled his collar tight against the saltwater wind that rose from the reef below, smelling of iron and ancient brine.</p>
        <p>In his hand lay the unsealed letter from his grandfather, its parchment brittle with fifty years of unspoken grievances. “We do not outgrow our quietest memories,” the old man had written with a trembling fountain pen, “we merely build louder cities over them, hoping the concrete will suffocate what our hearts refuse to bury.”</p>
        <p>He looked out toward the line where the turquoise tide collided with the midnight blue of the deep channel. For twenty years, he had believed that distance was the cure for grief. But standing on this jagged cliff, he understood for the first time: peace was never a destination to be reached; it was the quiet courage to stop running from one's own reflection.</p>
      `
    },
    2: {
      title: "The Architecture of Solitude",
      genre: "Philosophical Novel · Published 2023",
      content: `
        <p>Kian designed skyscrapers for clients who measured importance in vertical feet and square meters of glass. But on rainy Tuesday evenings, when the glass towers reflected only the grey desolation of the clouds, he would sit in his empty drafting room, tracing the blueprint of an unbuilt cathedral.</p>
        <p>“Every room is built with walls,” he said softly to the apprentice who lingered by the door, “but it is lived only in the emptiness between them. Modern man fears the emptiness. We pack our rooms with furniture, our calendars with meetings, and our silence with music, because to sit in an unfurnished room is to confront who we are when all applause ceases.”</p>
        <p>He turned off the overhead fluorescent lamps. In the dim blue twilight filtering through the floor-to-ceiling windows, the steel framework of the metropolis looked less like an achievement and more like a majestic, illuminated cage.</p>
      `
    },
    3: {
      title: "Whispers Beneath the Banyan",
      genre: "Cultural Narrative · Published 2022",
      content: `
        <p>Under the canopy of the colossal banyan tree, the earth was always cool, dampened by the secrets of four generations. The village elders said that trees of such antiquity possessed an intellect of their own, measuring human lifetimes as mere seasons of blossom and decay.</p>
        <p>Lalitha knelt among the twisted roots, feeling the slow pulse of the soil. Somewhere beneath this very courtyard lay the brass cylinder her great-grandmother had buried on the eve of the great flood of 1947. “The roots remember what the leaves pretend to have forgotten,” her grandmother had warned her before slipping into the deep sleep.</p>
        <p>Now, with developers' machines humming in the valley, Lalitha drove the spade into the dark loam. She wasn't digging for lost wealth; she was unearthing the only proof that her people had once loved this valley with an intimacy that contracts could never buy.</p>
      `
    }
  };

  readExcerptBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const bookId = this.getAttribute('data-book-id');
      const data = EXCERPTS[bookId];
      if (data && excerptModal) {
        modalBookTitle.textContent = data.title;
        document.getElementById('modal-book-meta').textContent = `${data.genre} · By Abdul Umar Sahan Nethmina`;
        modalExcerptText.innerHTML = data.content;
        excerptModal.classList.add('open');
      }
    });
  });

  if (modalCloseBtn && excerptModal) {
    modalCloseBtn.addEventListener('click', () => excerptModal.classList.remove('open'));
    excerptModal.addEventListener('click', (e) => {
      if (e.target === excerptModal) excerptModal.classList.remove('open');
    });
  }

  // =========================================================================
  // 6. GALLERY FILTERING & LIGHTBOX
  // =========================================================================
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

  galleryItems.forEach((item) => {
    item.addEventListener('click', function () {
      const img = this.querySelector('img');
      const caption = this.querySelector('.gallery-caption');
      if (img && galleryLightbox) {
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        galleryLightbox.classList.add('open');
      }
    });
  });

  if (lightboxClose && galleryLightbox) {
    lightboxClose.addEventListener('click', () => galleryLightbox.classList.remove('open'));
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox) galleryLightbox.classList.remove('open');
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (excerptModal) excerptModal.classList.remove('open');
      if (galleryLightbox) galleryLightbox.classList.remove('open');
      if (mobileMenu) mobileMenu.classList.remove('open');
    }
  });

  // =========================================================================
  // 7. CONTACT FORM SUBMISSION
  // =========================================================================
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-inquiry-btn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Processing Priority Inquiry...</span>';
        submitBtn.style.opacity = '0.75';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (formFeedback) {
          formFeedback.className = 'form-feedback-message success';
          formFeedback.textContent = 'Thank you. Your inquiry has been received. Abdul Umar Sahan Nethmina\'s management team will review your proposal and respond within 24 hours.';
        }
        contactForm.reset();

        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.style.opacity = '1';
          submitBtn.disabled = false;
        }

        setTimeout(() => {
          if (formFeedback) formFeedback.style.display = 'none';
        }, 8000);
      }, 900);
    });
  }

  // Window resize listeners
  window.addEventListener('resize', () => {
    resizeGlobalCanvas();
  }, { passive: true });

  // Initialize
  preloadFrames();
  requestAnimationFrame(renderLoop);
  loadTrack(0);
})();
