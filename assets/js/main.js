/**
 * MASTER JAVASCRIPT ENTRY POINT
 * Modular Component Orchestrator for Abdul Umar Sahan Nethmina's Portfolio
 */

import { initBackgroundEngine } from './components/backgroundEngine.js';
import { initSmoothScroll } from './components/smoothScroll.js';
import { initCursor } from './components/cursor.js';
import { initMusicPlayer } from './components/musicPlayer.js';
import { initExcerptModal } from './components/excerptModal.js';
import { initWriterArchive } from './components/writerArchive.js';
import { initGallery } from './components/gallery.js';
import { initContactForm } from './components/contactForm.js';
import { initScrollReveal } from './components/scrollReveal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Smooth Scrolling (Lenis)
  initSmoothScroll();

  // Initialize Global Full-Page Canvas Background Engine (238 frames)
  initBackgroundEngine();

  // Initialize Custom Cursor
  initCursor();

  // Initialize Music Player (Visual Discography Showcase - Silent)
  initMusicPlayer();

  // Initialize Literary Excerpts Dialog
  initExcerptModal();

  // Initialize Interactive 32-Book Grand Literary Archive
  initWriterArchive();

  // Initialize Gallery & Lightbox
  initGallery();

  // Initialize Priority Inquiry Form
  initContactForm();

  // Initialize Smooth & Clean Scroll Reveal System
  initScrollReveal();

  // Global Keydown Handler (Escape closes any open overlay)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const excerptModal = document.getElementById('excerpt-modal');
      const galleryLightbox = document.getElementById('gallery-lightbox');
      const mobileMenu = document.getElementById('mobile-menu');

      if (excerptModal) excerptModal.classList.remove('open');
      if (galleryLightbox) galleryLightbox.classList.remove('open');
      if (mobileMenu) mobileMenu.classList.remove('open');
    }
  });
});

