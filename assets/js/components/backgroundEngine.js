/**
 * BACKGROUND ENGINE COMPONENT
 * Preloads 238 frames and renders them to #global-sequence-canvas with high-DPI LERP interpolation.
 */

export function initBackgroundEngine() {
  const TOTAL_FRAMES = 238;
  const images = new Array(TOTAL_FRAMES);

  let loadedFrames = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let lastRenderedIndex = -1;
  let needsRedraw = true;

  const canvas = document.getElementById('global-sequence-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  const preloader = document.getElementById('site-preloader');
  const preloaderProgress = document.getElementById('preloader-progress');
  const preloaderPercent = document.getElementById('preloader-percent');

  function getFrameFilename(index) {
    const num = String(index + 1).padStart(3, '0');
    return `assets/images/ezgif-frame-${num}.jpg`;
  }

  function resizeCanvas() {
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
          window.dispatchEvent(new CustomEvent('preloader-done'));
        }, 300);
      }
    }
  }

  function preloadFrames() {
    resizeCanvas();

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameFilename(i);
      img.onload = () => handleFrameLoaded(i);
      img.onerror = () => handleFrameLoaded(i);
      images[i] = img;
    }
  }

  function renderLoop(time) {
    if (window.lenisInstance) {
      window.lenisInstance.raf(time);
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

  // Update target progress from Lenis scroll events
  window.addEventListener('lenis-scroll', (e) => {
    if (e.detail && typeof e.detail.progress === 'number') {
      targetProgress = Math.max(0, Math.min(1, e.detail.progress));
    }
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });

  preloadFrames();
  requestAnimationFrame(renderLoop);
}

