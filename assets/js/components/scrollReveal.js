/**
 * SCROLL REVEAL & TEXT ANIMATION ENGINE
 * Manages IntersectionObserver triggers, staggered card entrances,
 * and smooth milestone number counters.
 */

export function initScrollReveal() {
  // Elements with explicit reveal classes or core structural blocks
  const targetSelectors = [
    '.reveal-on-scroll',
    '.reveal-slide-left',
    '.reveal-slide-right',
    '.reveal-scale-in',
    '.reveal-stagger',
    '.section-header',
    '.pillar-card',
    '.portrait-frame',
    '.milestones-bar',
    '.about-lead',
    '.about-prose p',
    '.about-quote-card',
    '.about-action-row',
    '.spotlight-card',
    '.archive-header-box',
    '.archive-controls-bar',
    '.bookshelf-stage',
    '.speaker-stage-hero',
    '.keynote-card',
    '.vinyl-player-card',
    '.discography-tracklist-card',
    '.gallery-tab',
    '.gallery-item',
    '.atelier-card',
    '.atelier-pillar-item',
    '.atelier-cta-banner',
    '.contact-info-card',
    '.contact-form-card',
    '.footer-monogram',
    '.footer-brand-statement'
  ];

  const elementsToObserve = document.querySelectorAll(targetSelectors.join(', '));

  // Configure observer with comfortable threshold
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.12
  };

  let hasAnimatedMilestones = false;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');

        // Check if this is the milestones bar to trigger number counter
        if (entry.target.classList.contains('milestones-bar') && !hasAnimatedMilestones) {
          hasAnimatedMilestones = true;
          animateMilestoneCounters();
        }

        // Once revealed, unobserve to maintain reading comfort
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elementsToObserve.forEach((el) => {
    // Add default reveal class if not already custom
    if (!el.classList.contains('reveal-on-scroll') && 
        !el.classList.contains('reveal-slide-left') && 
        !el.classList.contains('reveal-slide-right') && 
        !el.classList.contains('reveal-scale-in') && 
        !el.classList.contains('reveal-stagger') &&
        !el.classList.contains('section-header')) {
      el.classList.add('reveal-on-scroll');
    }
    revealObserver.observe(el);
  });

  // Stagger delays for spine settlement in bookshelf
  const spines = document.querySelectorAll('.spine-item');
  spines.forEach((spine, idx) => {
    spine.style.animationDelay = `${(idx * 0.02).toFixed(2)}s`;
  });

  // -------------------------------------------------------------
  // DYNAMIC MILESTONE NUMBERS COUNT-UP ANIMATION
  // -------------------------------------------------------------
  function animateMilestoneCounters() {
    const stats = [
      { selector: '.stat-item:nth-child(1) .stat-number', target: 32, suffix: '+' },
      { selector: '.stat-item:nth-child(3) .stat-number', target: 45, suffix: '+' },
      { selector: '.stat-item:nth-child(5) .stat-number', target: 12, suffix: '+' },
      { selector: '.stat-item:nth-child(7) .stat-number', target: 100, suffix: 'K+' }
    ];

    stats.forEach((item) => {
      const el = document.querySelector(item.selector);
      if (!el) return;

      const duration = 1600; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out exponential
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(ease * item.target);

        el.textContent = `${currentVal}${item.suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${item.target}${item.suffix}`;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // Preloader completion trigger for hero elements
  window.addEventListener('preloader-done', () => {
    document.querySelectorAll('.hero-content-wrapper > *').forEach((child, index) => {
      child.style.animationDelay = `${(0.2 + index * 0.15).toFixed(2)}s`;
    });
  });
}

