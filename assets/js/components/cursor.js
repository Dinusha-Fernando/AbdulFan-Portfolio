/**
 * CUSTOM CURSOR COMPONENT
 * Implements smooth gold trailing ring and magnetic hover response for desktop fine pointers.
 */

export function initCursor() {
  const cursorRing = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');

  if (!cursorRing || !cursorDot || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  const interactiveSelector = 'a, button, .pillar-card, .book-card, .gallery-item, .track-item, input, textarea, .tab-pill, .control-btn, .spine-item, .spotlight-tab, .writer-filter-pill';

  // Event delegation for dynamic components & existing DOM elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('cursor-hover');
    }
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

