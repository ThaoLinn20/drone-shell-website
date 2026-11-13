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
  1: { pos: new THREE.Vector3(0, 38, 410), look: new THREE.Vector3(0, 115, 0) }, // Experience block: nicely balanced closer view
  2: { pos: new THREE.Vector3(0, 28, 360), look: new THREE.Vector3(0, 105, 0) }  // Community block
};

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
  if (camTargets[index]) {
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
      ratioZ: zRatio
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

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const remS = s % 60;
  return `${m < 10 ? '0' : ''}${m}:${remS < 10 ? '0' : ''}${remS}`;
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
  if (stageStatusText) stageStatusText.textContent = 'Bầu trời 3D sẵn sàng';
  
  fireworkSystem.autoLaunchEnabled = true;
  clearTimeout(dockIdleTimeout);
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
    if (fireworkSystem && typeof fireworkSystem.launchRandom === 'function') {
      fireworkSystem.launchRandom(null, {
        ratioX: 0.15 + Math.random() * 0.7,
        ratioY: 0.45 + Math.random() * 0.45,
        ratioZ: 0.3 + Math.random() * 0.4
      });
      if (stageStatusText) stageStatusText.textContent = 'Đã phóng pháo hoa ngẫu nhiên';
    }
  });
}

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
          fireworkSystem.launchRandom(null, {});
        }
      } catch (err) {
        console.warn('Could not launch shell script:', err);
        fireworkSystem.launchRandom(null, {});
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

// Wire up Shows play buttons
const showItems = Array.from(document.querySelectorAll('.dock-show-item'));
showItems.forEach((card) => {
  const playBtn = card.querySelector('.btn-dock-play');
  if (!playBtn) return;

  playBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    // If currently playing this show, clicking stops it
    if (card === currentActiveShowCard && showDirector.isPlaying) {
      stopCurrentShow();
      return;
    }

    // Stop previously playing show
    stopCurrentShow();

    const folder = card.dataset.folder;
    const scriptFile = card.dataset.script;
    const audioFile = card.dataset.audio;
    const showName = card.querySelector('.item-title')?.textContent || folder;

    const scriptUrl = `/scripts/shows/${folder}/${scriptFile}`;
    const audioUrl = `/scripts/shows/${folder}/${audioFile}`;

    if (stageStatusText) stageStatusText.textContent = `Đang nạp: ${showName}...`;

    try {
      let res = await fetch(scriptUrl);
      if (!res.ok && scriptFile === 'secret-base-trial-v7.json') {
        res = await fetch(`/scripts/shows/${folder}/secret-base.json`);
      }
      if (!res.ok) throw new Error(`Failed to fetch show script: ${scriptUrl}`);
      const scriptData = await res.json();

      // Normalize script and resolve audio path
      showDurationTotal = 0;
      scriptData.forEach((evt) => {
        if (evt.type === 'audio') {
          evt.url = audioUrl.replace(/^\//, '');
        }
        const end = (evt.time || 0) + (evt.duration || 0);
        if (end > showDurationTotal) showDurationTotal = end;
      });

      // Pause ambient firework to let the orchestrated show shine
      fireworkSystem.autoLaunchEnabled = false;

      // Load into showDirector
      showDirector.loadScript(scriptData);
      showDirector.play();
      if (skyHint) skyHint.style.opacity = '0';
      triggerDockWakeup();

      card.classList.add('active-show');
      playBtn.textContent = 'Dừng';
      currentActiveShowCard = card;

      if (stageStatusText) stageStatusText.textContent = `Đang biểu diễn: ${showName}`;
    } catch (err) {
      console.error('Error starting show:', err);
      if (stageStatusText) stageStatusText.textContent = 'Lỗi nạp show: ' + err.message;
      fireworkSystem.autoLaunchEnabled = true;
    }
  });
});

// ==========================================================================
// 5. Language Switcher (VI / EN)
// ==========================================================================

let currentLang =
  (typeof localStorage !== 'undefined' &&
    localStorage.getItem('fdshow_web_lang')) ||
  'vi';

function applyLanguage(lang) {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('fdshow_web_lang', lang);
  }

  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = lang.toUpperCase();
  }
  document.documentElement.lang = lang;
}

const langBtn = document.getElementById('lang-switch-btn');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    applyLanguage(nextLang);
  });
}


// ==========================================================================
// Auto-hide Dock during Show Playback
// ==========================================================================

const experienceDock = document.querySelector('.experience-dock');
const btnCloseDock = document.getElementById('btn-close-dock');
const btnDockToggle = document.getElementById('btn-dock-toggle');
const blockExperience = document.getElementById('block-experience');
const skyHint = document.querySelector('.experience-sky-hint');

let dockIdleTimeout = null;
let isHoveringDock = false;

function showDock() {
  if (experienceDock) {
    experienceDock.classList.remove('dock-hidden');
  }
  if (btnDockToggle) {
    btnDockToggle.classList.remove('visible');
  }
}

function hideDock(force = false) {
  if (force || (showDirector && showDirector.isPlaying && !isHoveringDock)) {
    if (experienceDock) {
      experienceDock.classList.add('dock-hidden');
    }
    if (btnDockToggle) {
      btnDockToggle.classList.add('visible');
    }
  }
}

function triggerDockWakeup() {
  showDock();
  clearTimeout(dockIdleTimeout);

  if (showDirector && showDirector.isPlaying && !isHoveringDock) {
    dockIdleTimeout = setTimeout(() => {
      hideDock();
    }, 2800);
  }
}

if (experienceDock) {
  experienceDock.addEventListener('mouseenter', () => {
    isHoveringDock = true;
    showDock();
    clearTimeout(dockIdleTimeout);
  });

  experienceDock.addEventListener('mouseleave', () => {
    isHoveringDock = false;
    triggerDockWakeup();
  });
}

if (blockExperience) {
  blockExperience.addEventListener('mousemove', () => {
    triggerDockWakeup();
  });
}

if (btnCloseDock) {
  btnCloseDock.addEventListener('click', (e) => {
    e.stopPropagation();
    hideDock(true); // Manually close dock immediately
  });
}

if (btnDockToggle) {
  btnDockToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    showDock(); // Reopen dock
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

    // Update timer display
    if (showDirector.isPlaying && showTimeDisplay) {
      showTimeDisplay.textContent = `${formatTime(showDirector.elapsedTime)} / ${formatTime(showDurationTotal)}`;

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

// Write files to targetDir
fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtml, 'utf8');
console.log('Successfully wrote index.html');

fs.writeFileSync(path.join(targetDir, 'src', 'style.css'), styleCss, 'utf8');
console.log('Successfully wrote src/style.css');

fs.writeFileSync(path.join(targetDir, 'src', 'main.js'), mainJs, 'utf8');
console.log('Successfully wrote src/main.js');
