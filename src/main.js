import * as THREE from 'three';
import { Clock } from './core/Clock.js';
import { CameraManager } from './core/CameraManager.js';
import { SceneManager } from './core/SceneManager.js';
import { Renderer } from './core/Renderer.js';
import { PostProcessingPipeline } from './core/PostProcessingPipeline.js';
import { FireworkSystem } from './systems/FireworkSystem.js';
import { TrailSystem } from './systems/TrailSystem.js';
import { CometSystem } from './systems/CometSystem.js';
import { SmokeSystem } from './systems/SmokeSystem.js';
import { SkyLightReactionSystem } from './systems/SkyLightReactionSystem.js';
import { FireworkSequencer } from './directors/FireworkSequencer.js';
import { ShowDirector } from './directors/ShowDirector.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { renderingConfig } from './config/rendering.js';
import './style.css';

// ==========================================================================
// 1. Core WebGL ECS Setup & 3D Stage Background
// ==========================================================================

const clock = new Clock();
const renderer = new Renderer();
const cameraManager = new CameraManager();
const sceneManager = new SceneManager();

// Mount Renderer canvas to background canvas if exists, otherwise append
const existingCanvas = document.getElementById('bg-canvas');
if (existingCanvas && existingCanvas.parentNode) {
  existingCanvas.replaceWith(renderer.instance.domElement);
  renderer.instance.domElement.id = 'bg-canvas';
} else {
  renderer.instance.domElement.id = 'bg-canvas';
  document.body.prepend(renderer.instance.domElement);
}

// Particle & Physics Systems
const trailSystem = new TrailSystem(sceneManager.instance);
const smokeSystem = new SmokeSystem(sceneManager);
const fireworkSystem = new FireworkSystem(
  sceneManager.instance,
  trailSystem,
  smokeSystem
);
fireworkSystem.autoLaunchEnabled = true;
fireworkSystem.autoLaunchInterval = 1.6;

const skyLightReactionSystem = new SkyLightReactionSystem(sceneManager);
const cometSystem = new CometSystem(
  sceneManager.instance,
  trailSystem,
  smokeSystem
);

// Sequencer & Show Director for live choreography
const fireworkSequencer = new FireworkSequencer(fireworkSystem, cometSystem);
const showDirector = new ShowDirector(fireworkSequencer, fireworkSystem);
const audioSystem = new AudioSystem(cameraManager);

const postProcessing = renderingConfig?.post?.enabled
  ? new PostProcessingPipeline(
      renderer.instance,
      sceneManager.instance,
      cameraManager.instance,
      renderingConfig
    )
  : null;

if (postProcessing) {
  renderer.addResizeListener((width, height, pixelRatio) => {
    postProcessing.setSize(width, height, pixelRatio);
  });
}

// Camera targets per section (wide panoramic view for experience block)
const camTargets = {
  0: { pos: new THREE.Vector3(0, 22, 340), look: new THREE.Vector3(0, 95, 0) },  // Intro block
  1: { pos: new THREE.Vector3(0, 30, 300), look: new THREE.Vector3(0, 105, 0) }, // Experience block: dock visible
  2: { pos: new THREE.Vector3(0, 28, 360), look: new THREE.Vector3(0, 105, 0) }  // Community block
};

// When dock is closed with X button, camera angles up higher to fill viewport
const camTargetExperienceHidden = {
  pos: new THREE.Vector3(0, 22, 300),
  look: new THREE.Vector3(0, 145, 0)
};

let isDockHidden = false;

function updateExperienceCamera() {
  if (currentBlockIndex === 1) {
    currentCamTarget = isDockHidden ? camTargetExperienceHidden : camTargets[1];
  }
}

let currentCamTarget = camTargets[0];
let currentLookTarget = camTargets[0].look.clone();

if (cameraManager.instance) {
  cameraManager.instance.position.copy(camTargets[0].pos);
  cameraManager.instance.lookAt(camTargets[0].look);
}

// ==========================================================================
// 2. Full-Page Scroll Snap Controller (Wuthering Waves style)
// ==========================================================================

const snapContainer = document.getElementById('snap-container');
const pageBlocks = Array.from(document.querySelectorAll('.page-block'));
const navItems = Array.from(document.querySelectorAll('.nav-menu .nav-item'));
const sideDots = Array.from(document.querySelectorAll('.side-nav .side-dot'));

let currentBlockIndex = 0;
let isScrollLocked = false;
let scrollLockTimeout = null;

function setActiveIndicator(index) {
  currentBlockIndex = index;
  if (index === 1) {
    updateExperienceCamera();
  } else if (camTargets[index]) {
    currentCamTarget = camTargets[index];
  }

  navItems.forEach((btn, i) => {
    if (i === index) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  sideDots.forEach((dot, i) => {
    if (i === index) dot.classList.add('active');
    else dot.classList.remove('active');
  });
}

function scrollToBlock(index) {
  if (index < 0 || index >= pageBlocks.length) return;
  
  isScrollLocked = true;
  clearTimeout(scrollLockTimeout);
  
  currentBlockIndex = index;
  setActiveIndicator(index);
  
  pageBlocks[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

  scrollLockTimeout = setTimeout(() => {
    isScrollLocked = false;
  }, 750);
}

// Bind all data-scroll-to triggers
document.querySelectorAll('[data-scroll-to]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const targetIdx = parseInt(el.getAttribute('data-scroll-to'), 10);
    scrollToBlock(targetIdx);
  });
});

// Wheel Snap Event Listener with inner-scroll delegation
window.addEventListener('wheel', (e) => {
  // Check if target is inside an internally scrollable container
  const scrollableParent = e.target.closest('.dock-content, .dock-shells-list, .dock-shows-list, .card-bullets');
  if (scrollableParent) {
    const isAtLeft = scrollableParent.scrollLeft === 0;
    const isAtRight = Math.ceil(scrollableParent.scrollLeft + scrollableParent.clientWidth) >= scrollableParent.scrollWidth;
    
    // If user is scrolling horizontally inside dock, don't hijack vertical snap
    if (e.deltaX !== 0 && ((e.deltaX < 0 && !isAtLeft) || (e.deltaX > 0 && !isAtRight))) {
      return;
    }
  }

  // Prevent default page scroll
  e.preventDefault();

  if (isScrollLocked) return;

  const threshold = 18;
  if (e.deltaY > threshold) {
    if (currentBlockIndex < pageBlocks.length - 1) {
      scrollToBlock(currentBlockIndex + 1);
    }
  } else if (e.deltaY < -threshold) {
    if (currentBlockIndex > 0) {
      scrollToBlock(currentBlockIndex - 1);
    }
  }
}, { passive: false });

// Keyboard navigation
window.addEventListener('keydown', (e) => {
  if (isScrollLocked) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    if (currentBlockIndex < pageBlocks.length - 1) {
      scrollToBlock(currentBlockIndex + 1);
    }
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    if (currentBlockIndex > 0) {
      scrollToBlock(currentBlockIndex - 1);
    }
  }
});

// IntersectionObserver to sync indicators during smooth scrolling
const blockObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const idx = parseInt(entry.target.getAttribute('data-block-index'), 10);
        if (!isNaN(idx) && !isScrollLocked) {
          setActiveIndicator(idx);
        }
      }
    });
  },
  {
    root: snapContainer,
    threshold: [0.5]
  }
);

pageBlocks.forEach((block) => blockObserver.observe(block));

// ==========================================================================
// 3. Interactive Stage Click Trigger (Fire phao khi click vao bau troi)
// ==========================================================================

window.addEventListener('click', (event) => {
  if (audioSystem) audioSystem.resumeContext();
  const target = event.target;
  if (
    target &&
    (target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'VIDEO' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('video') ||
      target.closest('.experience-dock') ||
      target.closest('.intro-left-card') ||
      target.closest('.flow-card') ||
      target.closest('.navbar-fixed'))
  ) {
    return;
  }

  // Calculate normalized coordinate from click position
  const xRatio = event.clientX / window.innerWidth;
  const yRatio = 0.45 + Math.random() * 0.45;
  const zRatio = 0.3 + Math.random() * 0.4;

  if (fireworkSystem && typeof fireworkSystem.launchRandom === 'function') {
    fireworkSystem.launchRandom(null, {
      ratioX: xRatio,
      ratioY: yRatio,
      ratioZ: zRatio,
      sectorId: 'center'
    });
  }
});

// ==========================================================================
// 4. Experience Dock Controllers (Tabs & Shell/Show Selectors)
// ==========================================================================

const tabShows = document.getElementById('tab-shows');
const tabBigShell = document.getElementById('tab-big-shell');
const tabSmallShell = document.getElementById('tab-small-shell');

const dockShowsView = document.getElementById('dock-shows-view');
const dockShellsView = document.getElementById('dock-shells-view');

const stageStatusText = document.getElementById('stage-status-text');
const showTimeDisplay = document.getElementById('show-time-display');
const btnStopShow = document.getElementById('btn-stop-show');
const btnFireRandom = document.getElementById('btn-fire-random');

let currentActiveShowCard = null;
let showDurationTotal = 0;

let currentLang =
  (typeof localStorage !== 'undefined' &&
    localStorage.getItem('fdshow_web_lang')) ||
  'vi';

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const remS = s % 60;
  return `${m < 10 ? '0' : ''}${m}:${remS < 10 ? '0' : ''}${remS}`;
}

// Timeline Scrubber DOM & State
const dockScrubberBar = document.getElementById('dock-scrubber-bar');
const scrubberTrackWrap = document.getElementById('scrubber-track-wrap');
const scrubberTrack = document.getElementById('scrubber-track');
const scrubberProgress = document.getElementById('scrubber-progress');
const scrubberThumb = document.getElementById('scrubber-thumb');
const scrubberTooltip = document.getElementById('scrubber-tooltip');
const scrubberTimeCurrent = document.getElementById('scrubber-time-current');
const scrubberTimeTotal = document.getElementById('scrubber-time-total');

let isScrubbing = false;
let scrubbedTime = 0;
let lastThrottledSeekTime = 0;

function updateScrubberUI(currentTime, totalTime) {
  if (isScrubbing) return;
  const validTotal = Math.max(0, totalTime || 0);
  const validCurrent = Math.min(validTotal, Math.max(0, currentTime || 0));
  const pct = validTotal > 0 ? (validCurrent / validTotal) * 100 : 0;

  if (scrubberProgress) scrubberProgress.style.width = `${pct}%`;
  if (scrubberThumb) scrubberThumb.style.left = `${pct}%`;
  if (scrubberTimeCurrent) scrubberTimeCurrent.textContent = formatTime(validCurrent);
  if (scrubberTimeTotal) scrubberTimeTotal.textContent = formatTime(validTotal);
}

function getScrubberRatio(e) {
  if (!scrubberTrack) return 0;
  const rect = scrubberTrack.getBoundingClientRect();
  const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function updateScrubberVisual(ratio, time) {
  const pct = ratio * 100;
  if (scrubberProgress) scrubberProgress.style.width = `${pct}%`;
  if (scrubberThumb) scrubberThumb.style.left = `${pct}%`;
  if (scrubberTimeCurrent) scrubberTimeCurrent.textContent = formatTime(time);
  if (showTimeDisplay) {
    showTimeDisplay.textContent = `${formatTime(time)} / ${formatTime(showDurationTotal)}`;
  }
}

async function ensureShowLoadedForScrubbing() {
  if (showDurationTotal > 0 && showDirector.scriptConfig && showDirector.scriptConfig.length > 0) {
    return true;
  }
  const firstCard = document.querySelector('.dock-show-item');
  if (firstCard && typeof startShow === 'function') {
    startShow(firstCard, null, true);
    await new Promise((r) => setTimeout(r, 180));
    return true;
  }
  return false;
}

if (scrubberTrackWrap) {
  scrubberTrackWrap.addEventListener('pointermove', (e) => {
    const ratio = getScrubberRatio(e);
    const hoverTime = ratio * (showDurationTotal || 0);

    if (scrubberTooltip) {
      const rect = scrubberTrackWrap.getBoundingClientRect();
      const clientX = e.clientX ?? 0;
      const offsetX = Math.max(12, Math.min(rect.width - 12, clientX - rect.left));
      scrubberTooltip.style.left = `${offsetX}px`;
      scrubberTooltip.textContent = formatTime(hoverTime);
    }

    if (isScrubbing) {
      scrubbedTime = hoverTime;
      updateScrubberVisual(ratio, scrubbedTime);

      const now = performance.now();
      if (now - lastThrottledSeekTime > 75) {
        if (showDirector && (showDirector.isPlaying || showDirector.scriptConfig)) {
          showDirector.seek(scrubbedTime);
        }
        lastThrottledSeekTime = now;
      }
    }
  });

  scrubberTrackWrap.addEventListener('pointerdown', async (e) => {
    e.stopPropagation();
    e.preventDefault();

    await ensureShowLoadedForScrubbing();

    isScrubbing = true;
    scrubberTrackWrap.classList.add('is-dragging');
    try {
      scrubberTrackWrap.setPointerCapture(e.pointerId);
    } catch (_) {}

    const ratio = getScrubberRatio(e);
    scrubbedTime = ratio * (showDurationTotal || 0);
    updateScrubberVisual(ratio, scrubbedTime);

    if (showDirector && (showDirector.isPlaying || showDirector.scriptConfig)) {
      showDirector.seek(scrubbedTime);
    }
    
  });

  const onPointerEnd = (e) => {
    if (!isScrubbing) return;
    isScrubbing = false;
    scrubberTrackWrap.classList.remove('is-dragging');
    try {
      if (scrubberTrackWrap.hasPointerCapture(e.pointerId)) {
        scrubberTrackWrap.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (showDirector && (showDirector.isPlaying || showDirector.scriptConfig)) {
      showDirector.seek(scrubbedTime);
      if (!showDirector.isPlaying && currentActiveShowCard) {
        showDirector.play();
      }
    }
    
  };

  scrubberTrackWrap.addEventListener('pointerup', onPointerEnd);
  scrubberTrackWrap.addEventListener('pointercancel', onPointerEnd);
}

function stopCurrentShow() {
  if (showDirector) {
    showDirector.stop();
  }
  if (currentActiveShowCard) {
    currentActiveShowCard.classList.remove('active-show');
    const btn = currentActiveShowCard.querySelector('.btn-dock-play');
    if (btn) btn.textContent = 'Phát show';
    currentActiveShowCard = null;
  }
  showDurationTotal = 0;
  if (showTimeDisplay) showTimeDisplay.textContent = '00:00 / 00:00';
  updateScrubberUI(0, 0);
  if (stageStatusText) stageStatusText.textContent = 'Bầu trời 3D sẵn sàng';
  
  fireworkSystem.autoLaunchEnabled = true;
  
  showDock();
  if (skyHint) skyHint.style.opacity = '1';
}

if (btnStopShow) {
  btnStopShow.addEventListener('click', (e) => {
    e.stopPropagation();
    stopCurrentShow();
  });
}

if (btnFireRandom) {
  btnFireRandom.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audioSystem) audioSystem.resumeContext();
    if (fireworkSystem && typeof fireworkSystem.launchRandom === 'function') {
      fireworkSystem.launchRandom(null, {
        ratioX: 0.15 + Math.random() * 0.7,
        ratioY: 0.45 + Math.random() * 0.45,
        ratioZ: 0.3 + Math.random() * 0.4,
        sectorId: 'center'
      });
      if (stageStatusText) stageStatusText.textContent = 'Đã phóng pháo hoa ngẫu nhiên';
    }
  });
}

// Sound Mute / Unmute Toggle Button (Top Navbar & Experience Dock)
const btnNavSound = document.getElementById('btn-nav-sound');
const btnToggleSound = document.getElementById('btn-toggle-sound');
const savedSoundPref =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('fdshow_sound_muted')
    : null;
const isDefaultMuted = savedSoundPref !== null ? savedSoundPref === 'true' : true;

if (audioSystem) {
  audioSystem.setMuted(isDefaultMuted);
}

function updateSoundButtonUI() {
  if (!audioSystem) return;
  const isMuted = audioSystem.muted;

  if (btnNavSound) {
    if (isMuted) {
      btnNavSound.classList.add('is-muted');
      btnNavSound.title = currentLang === 'en'
        ? 'Turn sound ON (currently OFF)'
        : 'Bật âm thanh pháo hoa (hiện đang tắt)';
    } else {
      btnNavSound.classList.remove('is-muted');
      btnNavSound.title = currentLang === 'en'
        ? 'Turn sound OFF (currently ON)'
        : 'Tắt âm thanh pháo hoa (hiện đang bật)';
    }
  }

  if (btnToggleSound) {
    if (isMuted) {
      btnToggleSound.classList.add('is-muted');
      btnToggleSound.textContent =
        currentLang === 'en' ? 'Sound: OFF' : 'Âm thanh: Tắt';
    } else {
      btnToggleSound.classList.remove('is-muted');
      btnToggleSound.textContent =
        currentLang === 'en' ? 'Sound: ON' : 'Âm thanh: Bật';
    }
  }
}

function handleToggleSound(e) {
  if (e) e.stopPropagation();
  if (audioSystem) {
    audioSystem.resumeContext();
    const isMuted = audioSystem.toggleMute();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fdshow_sound_muted', isMuted ? 'true' : 'false');
    }
    updateSoundButtonUI();
    if (stageStatusText) {
      stageStatusText.textContent = isMuted
        ? (currentLang === 'en' ? 'Sound muted' : 'Đã tắt âm thanh pháo')
        : (currentLang === 'en' ? 'Sound enabled' : 'Đã bật âm thanh pháo');
    }
  }
}

if (btnNavSound) {
  btnNavSound.addEventListener('click', handleToggleSound);
}

if (btnToggleSound) {
  btnToggleSound.addEventListener('click', handleToggleSound);
}

updateSoundButtonUI();

// Render Shell Chips for Big/Small shell modes
function renderShellChips(category) {
  if (!dockShellsView) return;
  dockShellsView.innerHTML = '';

  const count = category === 'big' ? 8 : 26;
  const folder = category === 'big' ? 'big-shell' : 'small-shell';

  for (let i = 1; i <= count; i++) {
    const chip = document.createElement('div');
    chip.className = 'shell-chip';
    chip.textContent = category === 'big' ? `Pháo ${i}` : `S-${i}`;
    chip.title = `Kích nổ ${folder}/shell${i}.json`;
    chip.dataset.path = `/scripts/fireworks/${folder}/shell${i}.json`;

    chip.addEventListener('click', async (e) => {
      e.stopPropagation();
      chip.classList.add('firing');
      setTimeout(() => chip.classList.remove('firing'), 500);

      const filePath = chip.dataset.path;
      if (stageStatusText) {
        stageStatusText.textContent = `Đang bắn: ${category === 'big' ? 'Big Shell' : 'Small Shell'} ${i}`;
      }

      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`Failed to fetch ${filePath}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const success = showDirector.previewEvents(data);
          if (!success) {
            data.forEach((evt) => showDirector.executeEvent(evt));
          }
        } else if (data && typeof data === 'object') {
          showDirector.executeEvent(data);
        } else {
          fireworkSystem.launchRandom(null, { sectorId: 'center' });
        }
      } catch (err) {
        console.warn('Could not launch shell script:', err);
        fireworkSystem.launchRandom(null, { sectorId: 'center' });
      }
    });

    dockShellsView.appendChild(chip);
  }
}

// Switch between Dock Views (Shows, Big Shell, Small Shell)
function switchDockView(mode) {
  [tabShows, tabBigShell, tabSmallShell].forEach((tab) => {
    if (tab && tab.dataset.mode === mode) tab.classList.add('active');
    else if (tab) tab.classList.remove('active');
  });

  if (mode === 'shows') {
    dockShowsView.classList.add('active');
    dockShellsView.classList.remove('active');
  } else {
    dockShowsView.classList.remove('active');
    dockShellsView.classList.add('active');
    renderShellChips(mode);
  }
}

if (tabShows) tabShows.addEventListener('click', () => switchDockView('shows'));
if (tabBigShell) tabBigShell.addEventListener('click', () => switchDockView('big'));
if (tabSmallShell) tabSmallShell.addEventListener('click', () => switchDockView('small'));

// ==========================================================================
// Local Audio Binding and Copyright-Compliant Show Director
// ==========================================================================

const audioModalBackdrop = document.getElementById('audio-modal-backdrop');
const btnAudioModalClose = document.getElementById('btn-audio-modal-close');
const btnModalChooseFile = document.getElementById('btn-modal-choose-file');
const btnModalPlaySilent = document.getElementById('btn-modal-play-silent');
const localAudioInput = document.getElementById('local-audio-input');
const btnImportAudio = document.getElementById('btn-import-audio');
const audioModalTitle = document.getElementById('audio-modal-title');
const audioModalDesc = document.getElementById('audio-modal-desc');

let pendingShowCard = null;
const loadedAudioMap = new Map(); // folder -> { blobUrl, fileName }

function openAudioModal(card) {
  pendingShowCard = card;
  const showName = card.querySelector('.item-title')?.textContent || 'Kịch bản show';
  const audioFile = card.dataset.audio || '';

  if (audioModalTitle) {
    audioModalTitle.textContent = showName;
  }
  if (audioModalDesc) {
    audioModalDesc.innerHTML = `Kịch bản này được dàn dựng đồng bộ với bài hát <strong>${showName}</strong> (${audioFile}). Nhằm tôn trọng và tuân thủ bản quyền âm nhạc quốc tế, trang web không lưu trữ tệp MP3 này trên máy chủ.`;
  }
  if (audioModalBackdrop) {
    audioModalBackdrop.classList.add('is-open');
  }
}

function closeAudioModal() {
  if (audioModalBackdrop) {
    audioModalBackdrop.classList.remove('is-open');
  }
}

if (btnAudioModalClose) {
  btnAudioModalClose.addEventListener('click', () => {
    closeAudioModal();
    pendingShowCard = null;
  });
}

if (audioModalBackdrop) {
  audioModalBackdrop.addEventListener('click', (e) => {
    if (e.target === audioModalBackdrop) {
      closeAudioModal();
      pendingShowCard = null;
    }
  });
}

if (btnModalPlaySilent) {
  btnModalPlaySilent.addEventListener('click', () => {
    closeAudioModal();
    if (pendingShowCard) {
      startShow(pendingShowCard, null, true);
    }
  });
}

if (btnModalChooseFile) {
  btnModalChooseFile.addEventListener('click', () => {
    if (localAudioInput) {
      localAudioInput.click();
    }
  });
}

if (btnImportAudio) {
  btnImportAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    pendingShowCard = currentActiveShowCard || showItems[0];
    if (localAudioInput) {
      localAudioInput.click();
    }
  });
}

if (localAudioInput) {
  localAudioInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const card = pendingShowCard || currentActiveShowCard || showItems[0];
      const folder = card ? card.dataset.folder : 'secret-base';
      loadedAudioMap.set(folder, { blobUrl, fileName: file.name });
      closeAudioModal();
      if (card) {
        startShow(card, blobUrl, false);
      }
    }
  });
}

async function startShow(card, useBlobUrl = null, isSilent = false) {
  stopCurrentShow();

  const folder = card.dataset.folder;
  const scriptFile = card.dataset.script;
  const showName = card.querySelector('.item-title')?.textContent || folder;
  const scriptUrl = `/scripts/shows/${folder}/${scriptFile}`;

  if (stageStatusText) stageStatusText.textContent = `Đang nạp: ${showName}...`;

  try {
    let res = await fetch(scriptUrl);
    if (!res.ok && scriptFile === 'secret-base-trial-v7.json') {
      res = await fetch(`/scripts/shows/${folder}/secret-base.json`);
    }
    if (!res.ok) throw new Error(`Failed to fetch show script: ${scriptUrl}`);
    const scriptData = await res.json();

    const effectiveBlob = useBlobUrl || (loadedAudioMap.has(folder) ? loadedAudioMap.get(folder).blobUrl : null);

    showDurationTotal = 0;
    scriptData.forEach((evt) => {
      if (evt.type === 'audio') {
        if (effectiveBlob) {
          evt._blobUrl = effectiveBlob;
        } else {
          evt._blobUrl = null;
          evt.url = null;
        }
      }
      const end = (evt.time || 0) + (evt.duration || 0);
      if (end > showDurationTotal) showDurationTotal = end;
    });

    fireworkSystem.autoLaunchEnabled = false;
    updateScrubberUI(0, showDurationTotal);

    showDirector.loadScript(scriptData);
    showDirector.play();
    if (skyHint) skyHint.style.opacity = '0';

    card.classList.add('active-show');
    const playBtn = card.querySelector('.btn-dock-play');
    if (playBtn) playBtn.textContent = 'Dừng';
    currentActiveShowCard = card;

    if (stageStatusText) {
      stageStatusText.textContent = effectiveBlob
        ? `Đang biểu diễn: ${showName} (Đã nạp nhạc)`
        : `Đang biểu diễn: ${showName} (Âm thanh pháo 3D)`;
    }
  } catch (err) {
    console.error('Error starting show:', err);
    if (stageStatusText) stageStatusText.textContent = 'Lỗi nạp show: ' + err.message;
    fireworkSystem.autoLaunchEnabled = true;
  }
}

// Wire up Shows play buttons
const showItems = Array.from(document.querySelectorAll('.dock-show-item'));
showItems.forEach((card) => {
  const playBtn = card.querySelector('.btn-dock-play');
  if (!playBtn) return;

  playBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    if (card === currentActiveShowCard && showDirector.isPlaying) {
      stopCurrentShow();
      return;
    }

    const folder = card.dataset.folder;
    if (loadedAudioMap.has(folder)) {
      startShow(card, loadedAudioMap.get(folder).blobUrl, false);
      return;
    }

    openAudioModal(card);
  });
});

// ==========================================================================
// 5. Language Switcher (VI / EN)
// ==========================================================================

// (currentLang is initialized above)

function applyLanguage(lang) {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fdshow_web_lang', lang);
  }

  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = lang.toUpperCase();
  }
  const langBadge = document.getElementById('lang-mini-badge');
  if (langBadge) {
    langBadge.textContent = lang.toUpperCase();
  }
  const downloadBtn = document.getElementById('btn-nav-download');
  if (downloadBtn) {
    downloadBtn.title = lang === 'en'
      ? 'Download FDShowStudio (GitHub Releases)'
      : 'Tải FDShowStudio (GitHub Releases)';
  }

  document.querySelectorAll('.lang-option-btn').forEach((btn) => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.documentElement.lang = lang;
  updateSoundButtonUI();
}

// Language Option Click Handler
document.querySelectorAll('.lang-option-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const lang = btn.dataset.lang;
    applyLanguage(lang);
    document.querySelectorAll('.nav-dropdown-wrap').forEach((wrap) => {
      wrap.classList.remove('is-open');
    });
  });
});

// Click toggling for mobile / touch devices
const wrapNavCommunity = document.getElementById('wrap-nav-community');
const btnNavCommunity = document.getElementById('btn-nav-community');
if (btnNavCommunity && wrapNavCommunity) {
  btnNavCommunity.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapNavCommunity.classList.toggle('is-open');
    const wrapLang = document.getElementById('wrap-nav-lang');
    if (wrapLang) wrapLang.classList.remove('is-open');
  });
}

const wrapNavLang = document.getElementById('wrap-nav-lang');
const langBtn = document.getElementById('lang-switch-btn');
if (langBtn && wrapNavLang) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapNavLang.classList.toggle('is-open');
    if (wrapNavCommunity) wrapNavCommunity.classList.remove('is-open');
  });
}

// Close all popups when clicking outside
window.addEventListener('click', () => {
  document.querySelectorAll('.nav-dropdown-wrap').forEach((wrap) => {
    wrap.classList.remove('is-open');
  });
});


// ==========================================================================
// Experience Dock Manual Toggle (X Button & Sky Camera Sync)
// ==========================================================================

const experienceDock = document.getElementById('experience-dock') || document.querySelector('.experience-dock');
const btnCloseDock = document.getElementById('btn-close-dock');
const btnDockToggle = document.getElementById('btn-dock-toggle');
const blockExperience = document.getElementById('block-experience');
const skyHint = document.querySelector('.experience-sky-hint');

function showDock() {
  isDockHidden = false;
  if (experienceDock) {
    experienceDock.classList.remove('dock-hidden');
  }
  if (btnDockToggle) {
    btnDockToggle.classList.remove('visible');
  }
  updateExperienceCamera();
}

function hideDock() {
  isDockHidden = true;
  if (experienceDock) {
    experienceDock.classList.add('dock-hidden');
  }
  if (btnDockToggle) {
    btnDockToggle.classList.add('visible');
  }
  updateExperienceCamera();
}

if (btnCloseDock) {
  btnCloseDock.addEventListener('click', (e) => {
    e.stopPropagation();
    hideDock();
  });
}

if (btnDockToggle) {
  btnDockToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    showDock();
  });
}


// ==========================================================================
// 6. Main 60 FPS Render Loop
// ==========================================================================

function animate() {
  requestAnimationFrame(animate);

  clock.update();
  const deltaTime = clock.deltaTime;

  // Smooth camera transition to target view
  if (cameraManager && cameraManager.instance && currentCamTarget) {
    cameraManager.instance.position.lerp(currentCamTarget.pos, 0.04);
    currentLookTarget.lerp(currentCamTarget.look, 0.04);
    cameraManager.instance.lookAt(currentLookTarget);
  }

  // Update physics and firework particles
  if (fireworkSystem && typeof fireworkSystem.update === 'function') {
    fireworkSystem.update(deltaTime);
  }
  if (cometSystem && typeof cometSystem.update === 'function') {
    cometSystem.update(deltaTime);
  }
  if (trailSystem && typeof trailSystem.update === 'function') {
    trailSystem.update(deltaTime);
  }
  if (skyLightReactionSystem && typeof skyLightReactionSystem.update === 'function') {
    skyLightReactionSystem.update(deltaTime);
  }
  if (smokeSystem && typeof smokeSystem.update === 'function') {
    smokeSystem.update(deltaTime);
  }

  // Update Sequencer and Show Director
  if (fireworkSequencer && typeof fireworkSequencer.update === 'function') {
    fireworkSequencer.update(deltaTime);
  }
  if (showDirector && typeof showDirector.update === 'function') {
    showDirector.update(deltaTime);

    // Update timer display and timeline scrubber
    if (showDirector.isPlaying) {
      if (showTimeDisplay) {
        showTimeDisplay.textContent = `${formatTime(showDirector.elapsedTime)} / ${formatTime(showDurationTotal)}`;
      }
      updateScrubberUI(showDirector.elapsedTime, showDurationTotal);

      if (showDurationTotal > 0 && showDirector.elapsedTime >= showDurationTotal + 2) {
        stopCurrentShow();
        if (stageStatusText) stageStatusText.textContent = 'Show hoàn thành!';
      }
    }
  }

  // Render scene
  if (postProcessing) {
    postProcessing.render();
  } else if (renderer && sceneManager && cameraManager) {
    renderer.render(sceneManager.instance, cameraManager.instance);
  }
}

// Start animation loop
animate();

// Smoothly Dismiss Page Preloader Screen
function hidePreloader() {
  const loader = document.getElementById('app-loader');
  if (loader) {
    const progressFill = loader.querySelector('.loader-progress-fill');
    if (progressFill) {
      progressFill.style.animation = 'none';
      progressFill.style.width = '100%';
    }

    const statusText = loader.querySelector('.loader-status');
    if (statusText) {
      statusText.textContent = 'Systems Ready!';
      statusText.style.color = '#00e5ff';
      statusText.style.textShadow = '0 0 10px rgba(0, 229, 255, 0.6)';
    }

    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.remove();
        }
      }, 650);
    }, 400);
  }
}

if (document.readyState === 'complete') {
  hidePreloader();
} else {
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 3500);
}
