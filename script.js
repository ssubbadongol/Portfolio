// ============================================
//  PIXEL ART PORTFOLIO — SCRIPT
// ============================================

// --- LOADING SCREEN ---
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadScreen = document.getElementById('loading-screen');
    loadScreen.classList.add('fade-out');
    setTimeout(() => loadScreen.style.display = 'none', 800);
  }, 2400);
});

// --- GENERATE STARS ---
(function generateStars() {
  const starsLayer = document.getElementById('stars-layer');
  const worldWidth = 5200;
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    const size = Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 2 : 1;
    star.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      background:#fff;
      left:${Math.random() * worldWidth}px;
      top:${Math.random() * 55}%;
      opacity:${0.4 + Math.random() * 0.6};
      border-radius:${size > 1 ? '50%' : '0'};
      animation:starTwinkle ${1.5 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite;
    `;
    starsLayer.appendChild(star);
  }
})();

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes starTwinkle {
    0%,100%{opacity:0.8;transform:scale(1)}
    50%{opacity:0.2;transform:scale(0.6)}
  }
`;
document.head.appendChild(styleSheet);

// ============================================
//  WORLD WRAPPER & SCROLL
// ============================================
const wrapper = document.getElementById('world-wrapper');

// cameraLocked = true  → camera follows the knight automatically
// cameraLocked = false → mouse has taken over; camera is free
// Pressing any arrow key re-locks to the knight.
let cameraLocked = true;

// --- VERTICAL SCROLL → HORIZONTAL SCROLL ---
// Using the mouse wheel also unlocks the camera from the knight.
wrapper.addEventListener('wheel', e => {
  // Only redirect if no popup is open
  if (document.querySelector('.popup-overlay.active')) return;
  e.preventDefault();
  cameraLocked = false;           // detach camera from knight
  wrapper.scrollLeft += e.deltaY * 1.2;
}, { passive: false });

// --- HIDE SCROLL HINT ON SCROLL ---
let hintHidden = false;
wrapper.addEventListener('scroll', () => {
  if (!hintHidden && wrapper.scrollLeft > 80) {
    const hint = document.getElementById('scroll-hint');
    if (hint) hint.classList.add('hide');
    hintHidden = true;
  }
  updateParallax();
});

// --- 3-LAYER PARALLAX ---
function updateParallax() {
  const scrollX = wrapper.scrollLeft;
  const moon    = document.getElementById('moon');
  const stars   = document.getElementById('stars-layer');
  const bgLayer = document.getElementById('bg-layer');
  const fgLayer = document.getElementById('fg-layer');
  if (moon)    moon.style.transform    = `translateX(${scrollX * 0.05}px)`;
  if (stars)   stars.style.transform   = `translateX(${-scrollX * 0.02}px)`;
  if (bgLayer) bgLayer.style.transform = `translateX(${-scrollX * 0.25}px)`;
  if (fgLayer) fgLayer.style.transform = `translateX(${scrollX * 0.08}px)`;
  document.querySelectorAll('.cloud').forEach((cloud, i) => {
    cloud.style.transform = `translateX(${scrollX * (0.03 + i * 0.004)}px)`;
  });
}

// ============================================
//  KNIGHT MOVEMENT SYSTEM
// ============================================

const knightHorse = document.getElementById('knight-horse');

// Physics constants
const KNIGHT_SPEED = 7;       // faster movement (was 4)
const JUMP_FORCE   = 16;      // slightly stronger jump for better window reach
const GRAVITY      = 0.7;
const WORLD_MIN_X  = 0;
const WORLD_MAX_X  = 5100;

// Ground Y for the knight = cobblestone top surface.
// Cobblestone: bottom:108px, height:54px → top = 162px from world bottom.
// #knight-horse is appended to #mid-layer. mid-layer bottom = world bottom = 0.
// So the knight's ground (bottom value in CSS) = 162px.
const GROUND_Y = 162;

// Detach knight-horse from #knight-scene and place freely in #mid-layer.
// #knight-scene is at left:55px; #knight-horse inside it is at left:20px.
// So world X start = 55 + 20 = 75px.
const midLayer     = document.getElementById('mid-layer');
const knightStartX = 75;

midLayer.appendChild(knightHorse);
knightHorse.style.position = 'absolute';
knightHorse.style.bottom   = GROUND_Y + 'px';
knightHorse.style.left     = knightStartX + 'px';
knightHorse.style.zIndex   = '9';
// Clear inline transform — CSS on .knight-sprite handles idle bob animation.
// We only set transform on #knight-horse for the scaleX flip so it doesn't
// fight the CSS animation (which was causing the flashing).
knightHorse.style.transform = 'scaleX(1)';

// Knight physics state
let knightX    = knightStartX;
let knightVelY = 0;
let knightY    = GROUND_Y;    // current bottom offset (world-bottom-relative)
let isJumping  = false;
let lastFacing = 1;           // 1 = right, -1 = left (only update transform on change)

// Key state
const moveKeys = {};

document.addEventListener('keydown', e => {
  moveKeys[e.key] = true;

  // Prevent arrow keys / space from scrolling the page/wrapper
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
  }

  // Any arrow key or space re-locks the camera back onto the knight
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
    cameraLocked = true;
  }

  // Jump on ArrowUp or Space (only when grounded)
  if ((e.key === 'ArrowUp' || e.key === ' ') && !isJumping) {
    knightVelY = JUMP_FORCE;
    isJumping  = true;
  }

  // ArrowDown closes any open popup (but does NOT re-lock camera on its own)
  if (e.key === 'ArrowDown') {
    document.querySelectorAll('.popup-overlay.active').forEach(o => {
      o.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

document.addEventListener('keyup', e => { moveKeys[e.key] = false; });

// WASD scrolls world (alternative for users who prefer keyboard without the knight)
const SCROLL_SPEED = 18;
function wasdScroll() {
  if (!document.querySelector('.popup-overlay.active')) {
    if (moveKeys['d'] || moveKeys['D']) wrapper.scrollLeft += SCROLL_SPEED;
    if (moveKeys['a'] || moveKeys['A']) wrapper.scrollLeft -= SCROLL_SPEED;
  }
  requestAnimationFrame(wasdScroll);
}
wasdScroll();

// ============================================
//  WINDOW POSITION LOOKUP
// ============================================
// Returns all clickable-window world-positions so we can detect
// when the knight jumps near one and trigger its popup.
function getWindowPositions() {
  const windows = [];
  document.querySelectorAll('.clickable-window').forEach(win => {
    const building = win.closest('.building');
    if (!building) return;

    const buildingLeft = parseInt(building.style.left) || 0;
    const winLeft      = parseInt(win.style.left)      || 0;
    const winTop       = parseInt(win.style.top)       || 50;
    const winHeight    = 90; // approximate window height in px

    // Approximate wall section height from computed style
    const wallSection = win.closest('.wall-section');
    const wallHeight  = wallSection
      ? parseInt(getComputedStyle(wallSection).height)
      : 260;

    // World X at the horizontal centre of the window
    const worldX = buildingLeft + winLeft + 48; // 48 ≈ half window width

    // Buildings sit at bottom:162px (cobblestone top).
    // Wall section starts at building bottom.
    // Window top is measured from top of wall-section downward.
    // So window centre Y above world-bottom:
    //   162 (building base) + wallHeight - winTop - winHeight/2
    const windowCentreY = 162 + wallHeight - winTop - winHeight / 2;

    windows.push({ worldX, windowCentreY, section: win.dataset.section });
  });
  return windows;
}

// ============================================
//  JUMP-TRIGGERED POPUP
// ============================================
// Called every frame while the knight is rising.
// Knight "centre" for detection: X = knightX + 70, Y = knightY + 80 (mid-torso).
function checkWindowOnJump() {
  const windows = getWindowPositions();
  const PROX_X  = 140;  // generous horizontal tolerance (px)
  const PROX_Y  = 100;  // generous vertical tolerance (px)

  // Knight's approximate body centre
  const kx = knightX + 70;
  const ky  = knightY + 80; // 80px up from knight-horse bottom = roughly mid-torso

  for (const win of windows) {
    const dx = Math.abs(kx - win.worldX);
    const dy = Math.abs(ky - win.windowCentreY);
    if (dx < PROX_X && dy < PROX_Y) {
      openPopup(win.section);
      break;
    }
  }
}

// ============================================
//  MAIN KNIGHT GAME LOOP
// ============================================
(function startKnight() {
  function loop() {
    // --- Horizontal movement ---
    if (moveKeys['ArrowRight']) {
      knightX += KNIGHT_SPEED;
      if (lastFacing !== 1) {
        lastFacing = 1;
        knightHorse.style.transform = 'scaleX(1)';
      }
    }
    if (moveKeys['ArrowLeft']) {
      knightX -= KNIGHT_SPEED;
      if (lastFacing !== -1) {
        lastFacing = -1;
        knightHorse.style.transform = 'scaleX(-1)';
      }
    }
    knightX = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, knightX));

    // --- Vertical (jump / gravity) ---
    if (isJumping) {
      knightVelY -= GRAVITY;
      knightY    += knightVelY;

      // While rising check for nearby windows
      if (knightVelY > 0) checkWindowOnJump();

      // Land on ground
      if (knightY <= GROUND_Y) {
        knightY    = GROUND_Y;
        knightVelY = 0;
        isJumping  = false;
      }
    }

    // --- Apply position ---
    knightHorse.style.left   = knightX + 'px';
    knightHorse.style.bottom = knightY + 'px';

    // --- Camera follow ---
    // Only runs when cameraLocked = true (i.e. user is using arrow keys, not mouse).
    // Mouse wheel sets cameraLocked=false for free scrolling; any arrow key re-locks.
    if (cameraLocked) {
      const viewWidth     = wrapper.clientWidth;
      const knightScreenX = knightX - wrapper.scrollLeft;
      const leftMargin    = 220;
      const rightMargin   = 380; // scroll kicks in further from right edge (more space)
      if (knightScreenX > viewWidth - rightMargin) {
        wrapper.scrollLeft = knightX - (viewWidth - rightMargin);
      } else if (knightScreenX < leftMargin) {
        wrapper.scrollLeft = knightX - leftMargin;
      }
    }

    requestAnimationFrame(loop);
  }
  loop();
})();

// ============================================
//  POPUP SYSTEM
// ============================================
function openPopup(sectionId) {
  const overlay = document.getElementById('popup-' + sectionId);
  if (!overlay || overlay.classList.contains('active')) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Animate skill bars when skills popup opens
  if (sectionId === 'skills') {
    setTimeout(() => {
      document.querySelectorAll('.skill-fill').forEach(bar => {
        const target = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = target; }, 50);
      });
    }, 50);
  }
}

function closePopup(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Click on window sprite → open popup
document.querySelectorAll('.clickable-window').forEach(win => {
  win.addEventListener('click', () => openPopup(win.dataset.section));
});

// Close button
document.querySelectorAll('.popup-close').forEach(btn => {
  btn.addEventListener('click', () => closePopup(btn.dataset.target));
});

// Click backdrop to close
document.querySelectorAll('.popup-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Escape key closes all popups (ArrowDown also handled in keydown above)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup-overlay.active').forEach(o => {
      o.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// Click-bounce animation on window sprites
document.querySelectorAll('.clickable-window').forEach(win => {
  win.addEventListener('mousedown', () => { win.style.transform = 'scale(0.95)'; });
  win.addEventListener('mouseup',   () => { win.style.transform = ''; });
  win.addEventListener('mouseleave',() => { win.style.transform = ''; });
});

// ============================================
//  AMBIENT FIREFLIES
// ============================================
(function spawnFireflies() {
  const world    = document.getElementById('world');
  const variants = 15;
  let css = '';
  for (let i = 0; i < variants; i++) {
    const x1 = (Math.random() - 0.5) * 55, y1 = (Math.random() - 0.5) * 55;
    const x2 = (Math.random() - 0.5) * 70, y2 = (Math.random() - 0.5) * 70;
    css += `@keyframes fireflyFloat${i}{
      0%{transform:translate(0,0);opacity:0}
      15%{opacity:0.9}
      40%{transform:translate(${x1}px,${y1}px);opacity:1}
      70%{transform:translate(${x2}px,${y2}px);opacity:0.7}
      100%{transform:translate(0,0);opacity:0}
    }`;
  }
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  for (let i = 0; i < 30; i++) {
    const fly = document.createElement('div');
    const size = 2 + Math.random() * 3;
    fly.style.cssText = `
      position:absolute;
      left:${Math.random() * 5200}px;
      top:${100 + Math.random() * (window.innerHeight - 280)}px;
      width:${size}px; height:${size}px;
      background:#f9d46e; border-radius:50%;
      box-shadow:0 0 6px 3px rgba(249,212,110,0.6);
      animation:fireflyFloat${i % variants} ${4 + Math.random() * 8}s ease-in-out ${Math.random() * 8}s infinite;
      z-index:9; pointer-events:none;
    `;
    world.appendChild(fly);
  }
})();

// ============================================
//  TOUCH SUPPORT
// ============================================
let touchStartX = 0;
wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
wrapper.addEventListener('touchmove',  e => {
  const diff = touchStartX - e.touches[0].clientX;
  wrapper.scrollLeft += diff * 0.5;
  touchStartX = e.touches[0].clientX;
}, { passive: true });
