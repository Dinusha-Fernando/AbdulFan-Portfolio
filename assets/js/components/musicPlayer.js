/**
 * MUSIC PLAYER COMPONENT (VISUAL ONLY - COMPLETELY SILENT)
 * Drives the vinyl turntable rotation, waveform visualization, progress timer,
 * and track switching without emitting any audio.
 */

export function initMusicPlayer() {
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

  // Load initial track
  loadTrack(0);
}

