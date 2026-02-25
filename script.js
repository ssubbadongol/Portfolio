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
  const starCount = 200;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    const size = Math.random() < 0.2 ? 3 : Math.random() < 0.5 ? 2 : 1;
    star.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      background:#fff;
      left:${Math.random() * worldWidth}px;
      top:${Math.random() * 55}%;
      opacity:${0.4 + Math.random() * 0.6};
      border-radius:${size > 1 ? '50%' : '0'};
      animation: starTwinkle ${1.5 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite;
    `;
    starsLayer.appendChild(star);
  }
})();

// Inject star twinkle keyframe
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes starTwinkle {
    0%,100%{opacity:0.8;transform:scale(1)}
    50%{opacity:0.2;transform:scale(0.6)}
  }
`;
document.head.appendChild(styleSheet);

// --- KEYBOARD SCROLL ---
const wrapper = document.getElementById('world-wrapper');
const SCROLL_SPEED = 18;
const keys = {};

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

function keyScroll() {
  if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    wrapper.scrollLeft += SCROLL_SPEED;
  }
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    wrapper.scrollLeft -= SCROLL_SPEED;
  }
  requestAnimationFrame(keyScroll);
}
keyScroll();

// --- HIDE SCROLL HINT ON SCROLL ---
let hintHidden = false;
wrapper.addEventListener('scroll', () => {
  if (!hintHidden && wrapper.scrollLeft > 80) {
    document.getElementById('scroll-hint').classList.add('hide');
    hintHidden = true;
  }
});

// --- 3-LAYER PARALLAX SCROLL ---
wrapper.addEventListener('scroll', () => {
  const scrollX = wrapper.scrollLeft;

  // Sky elements — very slow (almost fixed)
  const moon = document.getElementById('moon');
  const stars = document.getElementById('stars-layer');
  if (moon)  moon.style.transform  = `translateX(${scrollX * 0.05}px)`;
  if (stars) stars.style.transform = `translateX(${-scrollX * 0.02}px)`;

  // Background layer — slow parallax (distant trees & clouds)
  const bgLayer = document.getElementById('bg-layer');
  if (bgLayer) bgLayer.style.transform = `translateX(${-scrollX * 0.25}px)`;

  // Midground layer — normal speed (mid-layer scrolls with world, no offset needed)
  // The mid-layer sits inside #world which scrolls via the wrapper, so it naturally
  // moves at 1x. No extra transform needed for mid-layer.

  // Foreground layer — faster parallax (close bushes move faster than world)
  const fgLayer = document.getElementById('fg-layer');
  if (fgLayer) fgLayer.style.transform = `translateX(${scrollX * 0.08}px)`;

  // Clouds (inside bg-layer, get additional drift relative to bg-layer)
  document.querySelectorAll('.cloud').forEach((cloud, i) => {
    cloud.style.transform = `translateX(${scrollX * (0.03 + i * 0.004)}px)`;
  });
});

// --- POPUP SYSTEM ---
function openPopup(sectionId) {
  const overlay = document.getElementById('popup-' + sectionId);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Trigger skill bar animations when skills popup opens
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

// Attach window click events
document.querySelectorAll('.clickable-window').forEach(win => {
  win.addEventListener('click', () => {
    const section = win.dataset.section;
    openPopup(section);
  });
});

// Attach close button events
document.querySelectorAll('.popup-close').forEach(btn => {
  btn.addEventListener('click', () => {
    closePopup(btn.dataset.target);
  });
});

// Close on overlay background click
document.querySelectorAll('.popup-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// ESC to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup-overlay.active').forEach(o => {
      o.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// --- WINDOW CLICK BOUNCE EFFECT ---
document.querySelectorAll('.clickable-window').forEach(win => {
  win.addEventListener('mousedown', () => {
    win.style.transform = 'scale(0.95)';
  });
  win.addEventListener('mouseup', () => {
    win.style.transform = '';
  });
  win.addEventListener('mouseleave', () => {
    win.style.transform = '';
  });
});

// --- AMBIENT PARTICLE EFFECT (fireflies) ---
(function spawnFireflies() {
  const world = document.getElementById('world');
  const count = 30;

  // Generate unique animation variants
  const flyStyles = document.createElement('style');
  const variants = 15;
  let css = '';
  for (let i = 0; i < variants; i++) {
    const x1 = (Math.random() - 0.5) * 55;
    const y1 = (Math.random() - 0.5) * 55;
    const x2 = (Math.random() - 0.5) * 70;
    const y2 = (Math.random() - 0.5) * 70;
    css += `
      @keyframes fireflyFloat${i} {
        0%   { transform:translate(0,0); opacity:0; }
        15%  { opacity:0.9; }
        40%  { transform:translate(${x1}px,${y1}px); opacity:1; }
        70%  { transform:translate(${x2}px,${y2}px); opacity:0.7; }
        100% { transform:translate(0,0); opacity:0; }
      }
    `;
  }
  flyStyles.textContent = css;
  document.head.appendChild(flyStyles);

  for (let i = 0; i < count; i++) {
    const fly = document.createElement('div');
    const x = Math.random() * 5200;
    const y = 100 + Math.random() * (window.innerHeight - 280);
    const size = 2 + Math.random() * 3;
    const duration = 4 + Math.random() * 8;
    const delay = Math.random() * 8;
    const variant = i % variants;
    fly.style.cssText = `
      position:absolute;
      left:${x}px;
      top:${y}px;
      width:${size}px;
      height:${size}px;
      background:#f9d46e;
      border-radius:50%;
      box-shadow:0 0 6px 3px rgba(249,212,110,0.6);
      animation: fireflyFloat${variant} ${duration}s ease-in-out ${delay}s infinite;
      z-index:9;
      pointer-events:none;
    `;
    world.appendChild(fly);
  }
})();

// --- TOUCH SUPPORT ---
let touchStartX = 0;
wrapper.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
wrapper.addEventListener('touchmove', e => {
  const diff = touchStartX - e.touches[0].clientX;
  wrapper.scrollLeft += diff * 0.5;
  touchStartX = e.touches[0].clientX;
}, { passive: true });
