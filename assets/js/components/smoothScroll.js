/**
 * SMOOTH SCROLL COMPONENT
 * Initializes Lenis smooth scrolling, header sticky effects, active section spy,
 * and smooth navigation anchor routing.
 */

export function initSmoothScroll() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');

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
    window.lenisInstance = lenis;

    lenis.on('scroll', (e) => {
      // Header sticky glass styling
      if (header) {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Update active nav link based on section in view
      updateActiveNavLink();

      // Dispatch lenis-scroll event for backgroundEngine and other listeners
      window.dispatchEvent(new CustomEvent('lenis-scroll', {
        detail: {
          progress: e.progress,
          scroll: e.scroll,
          velocity: e.velocity
        }
      }));
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
        if (window.lenisInstance) {
          window.lenisInstance.scrollTo(targetEl, { offset: -60, duration: 1.2 });
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
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  return lenis;
}

