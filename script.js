// Theme toggle with localStorage
(function () {
  const root = document.documentElement;
  const key = 'respawn-theme';
  const toggle = document.querySelector('.theme-toggle');
  const saved = localStorage.getItem(key);
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  toggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    localStorage.setItem(key, current);
  });
})();

// Canvas particle grid background (futuristic) with reduced-motion support
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr, points;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(window.innerWidth * dpr);
    height = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    initPoints();
  }

  function initPoints() {
    const cols = Math.ceil((window.innerWidth) / 90);
    const rows = Math.ceil((window.innerHeight) / 90);
    points = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        points.push({
          x: (x / cols) * width,
          y: (y / rows) * height,
          ox: (x / cols) * width,
          oy: (y / rows) * height,
          s: Math.random() * 1.2 + 0.4,
          p: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(0,204,102,0.35)' : 'rgba(26,238,136,0.18)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const nx = pt.ox;
      const ny = pt.oy;
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.4 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(0,204,102,0.35)' : 'rgba(26,238,136,0.18)';
    const lineColor1 = isLight ? 'rgba(0,204,102,0.12)' : 'rgba(26,238,136,0.06)';
    const lineColor2 = isLight ? 'rgba(51,221,119,0.08)' : 'rgba(68,204,111,0.04)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const wobble = Math.sin(t * 0.001 + pt.p) * 6 * pt.s;
      const nx = pt.ox + wobble;
      const ny = pt.oy + Math.cos(t * 0.0012 + pt.p) * 6 * pt.s;
      if (i % 2 === 0 && points[i + 1]) {
        const a = points[i + 1];
        ctx.strokeStyle = lineColor1;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(a.ox, a.oy);
        ctx.stroke();
      }
      if (points[i + 10]) {
        const b = points[i + 10];
        ctx.strokeStyle = lineColor2;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(b.ox, b.oy);
        ctx.stroke();
      }
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.4 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  if (prefersReduced) renderStatic(); else requestAnimationFrame(tick);
})();

// Smooth scroll for anchor links
(function () {
  const root = document.documentElement;
  const links = document.querySelectorAll('a[href^="#"]');
  for (const link of links) {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  }
})();

// Reveal on scroll
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => entry.target.classList.add('visible'));
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  reveals.forEach(el => io.observe(el));
})();

// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();

// Dialog modals (booking, merch)
(function () {
  function wireModal(modalId) {
    const openers = document.querySelectorAll(`[data-open="${modalId}"]`);
    const dialog = document.getElementById(modalId);
    if (!dialog) return;
    openers.forEach(btn => btn.addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }));
    dialog.addEventListener('click', (e) => {
      const rect = dialog.querySelector('.modal-card')?.getBoundingClientRect();
      if (!rect) return;
      const inDialog = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inDialog) dialog.close();
    });
  }
  wireModal('booking-modal');
  wireModal('merch-modal');
})();

// Contact form validation + toast
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const msg = form.querySelector('.form-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const zone = String(data.get('zone') || '');
    const hours = Number(data.get('hours'));
    if (!name || !email || !zone || !hours || hours <= 0) { msg.textContent = 'Please complete all required fields correctly.'; msg.style.color = '#ff6b6b'; return; }
    msg.textContent = `Thanks ${name}! Your ${hours}h reservation for ${zone} has been received.`;
    msg.style.color = '#22ff99';
    form.reset();
  });
})();

// Slider: autoplay, pagination, keyboard + swipe, ARIA live
(function () {
  const slider = document.querySelector('.slider');
  if (!slider) return;
  const viewport = slider.querySelector('.slider-viewport');
  const slidesWrap = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.nav.prev');
  const nextBtn = slider.querySelector('.nav.next');
  const pagination = slider.querySelector('.pagination');
  const live = slider.querySelector('#slider-live');

  let index = 0;
  let timer = 0;
  const intervalMs = 5200;
  const easing = (t) => 1 - Math.pow(1 - t, 3);

  function setIndex(i, opts = { announce: true }) {
    index = (i + slides.length) % slides.length;
    slidesWrap.style.transform = `translateX(${-100 * index}%)`;
    slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
    Array.from(pagination.children).forEach((b, bi) => b.setAttribute('aria-selected', String(bi === index)));
    const zone = slides[index].getAttribute('data-zone') || `Slide ${index + 1}`;
    if (opts.announce && live) live.textContent = `${zone} slide ${index + 1} of ${slides.length}`;
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(() => setIndex(index + 1), intervalMs);
  }
  function stopAutoplay() { if (timer) window.clearInterval(timer); }

  // Pagination
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => { setIndex(i); startAutoplay(); });
    pagination.appendChild(dot);
  });

  // Controls
  prevBtn?.addEventListener('click', () => { setIndex(index - 1); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { setIndex(index + 1); startAutoplay(); });

  // Keyboard
  viewport?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { setIndex(index - 1); startAutoplay(); }
    if (e.key === 'ArrowRight') { setIndex(index + 1); startAutoplay(); }
  });

  // Swipe / drag
  let startX = 0; let deltaX = 0; let dragging = false; let width = 0;
  function onDown(x) { dragging = true; startX = x; deltaX = 0; width = viewport.clientWidth; stopAutoplay(); }
  function onMove(x) {
    if (!dragging) return;
    deltaX = x - startX;
    const pct = Math.max(-100, Math.min(100, (deltaX / width) * 100));
    slidesWrap.style.transform = `translateX(calc(${-100 * index}% + ${pct}%))`;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    const threshold = width * 0.18;
    if (Math.abs(deltaX) > threshold) setIndex(index + (deltaX < 0 ? 1 : -1));
    else setIndex(index, { announce: false });
    startAutoplay();
  }
  viewport?.addEventListener('pointerdown', (e) => { viewport.setPointerCapture(e.pointerId); onDown(e.clientX); });
  viewport?.addEventListener('pointermove', (e) => onMove(e.clientX));
  viewport?.addEventListener('pointerup', onUp);
  viewport?.addEventListener('pointercancel', onUp);

  // Parallax backgrounds
  const parallaxEls = Array.from(slider.querySelectorAll('[data-parallax]'));
  function rafParallax() {
    const t = performance.now();
    parallaxEls.forEach((el, i) => {
      const amt = i % 2 ? 6 : -6;
      const tx = Math.sin(t * 0.0004 + i) * amt;
      const ty = Math.cos(t * 0.0005 + i) * amt;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
    requestAnimationFrame(rafParallax);
  }
  requestAnimationFrame(rafParallax);

  setIndex(0, { announce: true });
  startAutoplay();
})();

// Reference Website JavaScript - Smooth scroll and animations
const NAV_HEIGHT = 72;

// Active link highlighting - reliable intersection tracking
const sections = ['#zones','#games','#apps','#contact','#locations']
  .map((id) => document.querySelector(id)).filter(Boolean);
const navLinks = Array.from(document.querySelectorAll('.nav__link'));

// Smooth anchor scroll
for (const link of document.querySelectorAll('[data-scroll]')) {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: 'smooth' });

    // Clear all highlights immediately on click to prevent stale highlighting
    navLinks.forEach((l) => {
      l.setAttribute('aria-current', 'false');
      l.classList.remove('active');
    });

    // If navigating to contact section, focus the first form field
    const wantsFocus = href === '#contact' || link.hasAttribute('data-focus-contact');
    if (wantsFocus) {
      // Delay to allow smooth scroll to complete
      setTimeout(() => {
        const firstField = document.querySelector('#contact-form input, #contact-form select, #contact-form textarea');
        firstField?.focus({ preventScroll: true });
      }, 400);
    }
  });
}

function setActiveLink(href) {
  // Always clear ALL links first to ensure only one is highlighted
  navLinks.forEach((l) => {
    l.setAttribute('aria-current', 'false');
    l.classList.remove('active');
  });
  
  // Then set the active one
  const link = navLinks.find((a) => a.getAttribute('href') === href);
  if (link) {
    link.setAttribute('aria-current', 'true');
    link.classList.add('active');
  }
}

// Track intersection ratios for all sections
const sectionRatios = new Map();

const sectionObserver = new IntersectionObserver((entries) => {
  // Update ratios for changed sections
  entries.forEach((entry) => {
    const id = '#' + entry.target.id;
    if (entry.isIntersecting) {
      sectionRatios.set(id, entry.intersectionRatio);
    } else {
      sectionRatios.delete(id);
    }
  });
  
  // Find section with highest intersection ratio
  let maxRatio = 0;
  let activeId = null;
  sectionRatios.forEach((ratio, id) => {
    if (ratio > maxRatio) {
      maxRatio = ratio;
      activeId = id;
    }
  });
  
  // Update highlight if we found a visible section, otherwise clear all highlights
  if (activeId) {
    setActiveLink(activeId);
  } else {
    // Clear all highlights when no section is in view
    navLinks.forEach((l) => {
      l.setAttribute('aria-current', 'false');
      l.classList.remove('active');
    });
  }
}, { 
  rootMargin: '-20% 0px -50% 0px', 
  threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] 
});

sections.forEach((s) => sectionObserver.observe(s));

// Manual check function to update highlights based on scroll position
function checkActiveSection() {
  const scrollPos = window.scrollY + NAV_HEIGHT + 100;
  let currentSection = null;
  
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    
    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      currentSection = '#' + section.id;
    }
  });
  
  if (currentSection) {
    setActiveLink(currentSection);
  } else {
    // Clear all highlights when between sections
    navLinks.forEach((l) => {
      l.setAttribute('aria-current', 'false');
      l.classList.remove('active');
    });
  }
}

// Throttled scroll listener for real-time updates
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(checkActiveSection, 50);
}, { passive: true });

// Default to first section on load
setTimeout(() => {
  checkActiveSection();
}, 200);

// Honor URL hash on load
if (location.hash && document.querySelector(location.hash)) {
  setTimeout(() => {
    checkActiveSection();
  }, 300);
}

// Scroll reveal animation - improved to work continuously
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      // Remove class when element goes out of view so it can animate again
      entry.target.classList.remove('is-visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

requestAnimationFrame(() => {
  document.querySelectorAll('.card, .zone-content, .section-title, .reviews, .hero, .zone-buttons, .pricing-tiers, .hardware-specs, .langame-cutout-container').forEach((el) => {
    el.setAttribute('data-reveal','');
    revealObserver.observe(el);
  });
});

// Parallax layers
const parallaxLayers = Array.from(document.querySelectorAll('[data-parallax-speed]'));
function onScroll() {
  const scrollY = window.pageYOffset;
  parallaxLayers.forEach((layer) => {
    const speedY = parseFloat(layer.dataset.parallaxSpeed || '0');
    const speedX = parseFloat(layer.dataset.parallaxSpeedX || '0');
    const y = -(scrollY * speedY);
    const x = -(scrollY * speedX);
    layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}
document.addEventListener('scroll', onScroll, { passive: true });
requestAnimationFrame(onScroll);

// Enhanced scroll listener for continuous animations
let ticking = false;

function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}

document.addEventListener('scroll', handleScroll, { passive: true });

// Particles for parallax layer
const particlesCanvas = document.getElementById('particles');
const particlesCtx = particlesCanvas?.getContext('2d');
let particles = [];

function resizeParticlesCanvas() { 
  if (!particlesCanvas) return; 
  particlesCanvas.width = Math.floor(window.innerWidth * devicePixelRatio); 
  particlesCanvas.height = Math.floor(window.innerHeight * devicePixelRatio); 
}

window.addEventListener('resize', () => { resizeParticlesCanvas(); initParticles(); });
resizeParticlesCanvas();

function initParticles() {
  if (!particlesCanvas) return;
  const count = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 14000));
  particles = new Array(count).fill(0).map(() => ({ 
    x: Math.random()*particlesCanvas.width, 
    y: Math.random()*particlesCanvas.height, 
    vx: (Math.random()-0.5)*0.15*devicePixelRatio, 
    vy: (Math.random()-0.5)*0.15*devicePixelRatio, 
    r: Math.random()*1.5*devicePixelRatio, 
    glow: `rgba(26,238,136,${0.08 + Math.random()*0.12})` 
  }));
}

initParticles();
let lastT = 0;

function tickParticles(t){ 
  if(!particlesCanvas||!particlesCtx) return; 
  const dt=Math.min(32,t-lastT); 
  lastT=t; 
  particlesCtx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height); 
  for(const p of particles){ 
    p.x+=p.vx*dt; 
    p.y+=p.vy*dt; 
    if(p.x<0||p.x>particlesCanvas.width) p.vx*=-1; 
    if(p.y<0||p.y>particlesCanvas.height) p.vy*=-1; 
    particlesCtx.beginPath(); 
    particlesCtx.arc(p.x,p.y,p.r,0,Math.PI*2); 
    particlesCtx.fillStyle=p.glow; 
    particlesCtx.shadowColor='rgba(26,238,136,0.35)'; 
    particlesCtx.shadowBlur=8*devicePixelRatio; 
    particlesCtx.fill(); 
    particlesCtx.shadowBlur=0; 
  } 
  requestAnimationFrame(tickParticles); 
}

requestAnimationFrame(tickParticles);

// Counters animation
function animateCounter(el){ 
  const target=parseFloat(el.dataset.target||'0'); 
  const decimals=parseInt(el.dataset.decimals||'0'); 
  let start=0; 
  const duration=1200; 
  const startTime=performance.now(); 
  function frame(t){ 
    const p=Math.min(1,(t-startTime)/duration); 
    const val=(target*p).toFixed(decimals); 
    el.textContent=val; 
    if(p<1) requestAnimationFrame(frame); 
  } 
  requestAnimationFrame(frame); 
}

document.querySelectorAll('[data-counter]').forEach((el)=> animateCounter(el));

// Adjust scroll margin for sections
for (const sec of document.querySelectorAll('section[id]')) { 
  sec.style.scrollMarginTop = NAV_HEIGHT + 20 + 'px'; 
}


// Zone buttons functionality
(function () {
  const zoneButtons = document.querySelectorAll('.zone-btn');
  const zoneContents = document.querySelectorAll('.zone-content');
  let buttonClickTimeout;
  
  zoneButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Debounce button clicks
      if (buttonClickTimeout) {
        clearTimeout(buttonClickTimeout);
      }
      
      buttonClickTimeout = setTimeout(() => {
        const targetZone = button.getAttribute('data-zone');
        
        // Update active button
        zoneButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show target zone content
        zoneContents.forEach(content => {
          if (content.getAttribute('data-zone-content') === targetZone) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
        
        // Force intersection observer to re-check after DOM update
        setTimeout(() => {
          // Trigger a scroll event to make intersection observer re-evaluate
          window.dispatchEvent(new Event('scroll'));
        }, 10);
      }, 50); // Debounce delay
    });
  });
})();

// Green animated background for zones section
(function () {
  const canvas = document.getElementById('zones-bg-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr, points;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const section = document.getElementById('zones');
    if (!section) return;
    
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(section.offsetWidth * dpr);
    height = canvas.height = Math.floor(section.offsetHeight * dpr);
    canvas.style.width = section.offsetWidth + 'px';
    canvas.style.height = section.offsetHeight + 'px';
    initPoints();
  }

  function initPoints() {
    const cols = Math.ceil(width / (120 * dpr));
    const rows = Math.ceil(height / (120 * dpr));
    points = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        points.push({
          x: (x / cols) * width,
          y: (y / rows) * height,
          ox: (x / cols) * width,
          oy: (y / rows) * height,
          s: Math.random() * 1.2 + 0.4,
          p: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(0,204,102,0.25)' : 'rgba(26,238,136,0.12)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const nx = pt.ox;
      const ny = pt.oy;
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.2 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const wobble = Math.sin(t * 0.0008 + pt.p) * 4 * pt.s;
      const nx = pt.ox + wobble;
      const ny = pt.oy + Math.cos(t * 0.001 + pt.p) * 4 * pt.s;
      
      // Draw connecting lines between particles
      if (i % 3 === 0 && points[i + 1]) {
        const a = points[i + 1];
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.strokeStyle = isLight ? 'rgba(0,204,102,0.08)' : 'rgba(26,238,136,0.04)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(a.ox, a.oy);
        ctx.stroke();
      }
      
      if (points[i + 8]) {
        const b = points[i + 8];
        const isLight2 = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.strokeStyle = isLight2 ? 'rgba(51,221,119,0.06)' : 'rgba(68,204,111,0.03)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(b.ox, b.oy);
        ctx.stroke();
      }
      
      // Draw the particle points
      const isLight3 = document.documentElement.getAttribute('data-theme') === 'light';
      const particleColor = isLight3 ? 'rgba(0,204,102,0.25)' : 'rgba(26,238,136,0.12)';
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.2 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  
  // Initialize after a short delay to ensure section is rendered
  setTimeout(() => {
    resize();
    if (prefersReduced) {
      renderStatic();
    } else {
      requestAnimationFrame(tick);
    }
  }, 100);
})();

// LanGame Section Integrated Background
(function () {
  const canvas = document.getElementById('langame-bg-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr, points;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(canvas.offsetWidth * dpr);
    height = canvas.height = Math.floor(canvas.offsetHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    initPoints();
  }

  function initPoints() {
    const cols = Math.ceil(canvas.offsetWidth / 80);
    const rows = Math.ceil(canvas.offsetHeight / 80);
    points = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        points.push({
          x: (x / cols) * width,
          y: (y / rows) * height,
          ox: (x / cols) * width,
          oy: (y / rows) * height,
          s: Math.random() * 1.5 + 0.5,
          p: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(230,0,18,0.4)' : 'rgba(230,0,18,0.25)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(pt.ox, pt.oy, 1.2 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(230,0,18,0.4)' : 'rgba(230,0,18,0.25)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const nx = pt.ox + Math.sin(t * 0.0008 + pt.p) * 15 * dpr;
      const ny = pt.oy + Math.cos(t * 0.0006 + pt.p) * 10 * dpr;
      
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.2 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
      
      pt.x = nx;
      pt.y = ny;
    }
    
    // Draw connections with red theme
    ctx.strokeStyle = isLight ? 'rgba(230,0,18,0.15)' : 'rgba(230,0,18,0.1)';
    ctx.lineWidth = 0.5 * dpr;
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const pt2 = points[j];
        const dx = pt.x - pt2.x;
        const dy = pt.y - pt2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120 * dpr) {
          const opacity = (1 - dist / (120 * dpr)) * 0.3;
          ctx.globalAlpha = opacity;
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt2.x, pt2.y);
        }
      }
    }
    
    ctx.globalAlpha = 1;
    ctx.stroke();
    
    if (!prefersReduced) {
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  
  if (prefersReduced) {
    renderStatic();
  } else {
    requestAnimationFrame(tick);
  }
})();

// Games Modal
(function () {
  const modal = document.getElementById('games-modal');
  const openButtons = document.querySelectorAll('[data-open="games-modal"]');
  
  if (!modal) return;
  
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
    });
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.querySelector('.games-modal-card')?.getBoundingClientRect();
    if (!rect) return;
    const inDialog = e.clientX >= rect.left && e.clientX <= rect.right && 
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inDialog) modal.close();
  });
})();

// Contact Section Background Animation
(function () {
  const canvas = document.getElementById('contact-bg-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr, points;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const container = canvas.parentElement;
    if (!container) return;
    
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(container.offsetWidth * dpr);
    height = canvas.height = Math.floor(container.offsetHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    initPoints();
  }

  function initPoints() {
    const cols = Math.ceil(width / (100 * dpr));
    const rows = Math.ceil(height / (100 * dpr));
    points = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        points.push({
          x: (x / cols) * width,
          y: (y / rows) * height,
          ox: (x / cols) * width,
          oy: (y / rows) * height,
          s: Math.random() * 1.5 + 0.5,
          p: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(0,204,102,0.3)' : 'rgba(34,255,153,0.2)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(pt.ox, pt.oy, 1.5 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? 'rgba(0,204,102,0.3)' : 'rgba(34,255,153,0.2)';
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const nx = pt.ox + Math.sin(t * 0.0006 + pt.p) * 12 * dpr;
      const ny = pt.oy + Math.cos(t * 0.0008 + pt.p) * 12 * dpr;
      
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.5 * dpr * pt.s, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw subtle connections
      if (i % 4 === 0 && points[i + 1]) {
        const a = points[i + 1];
        ctx.strokeStyle = isLight ? 'rgba(0,204,102,0.08)' : 'rgba(34,255,153,0.05)';
        ctx.lineWidth = 0.8 * dpr;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(a.ox + Math.sin(t * 0.0006 + a.p) * 12 * dpr, a.oy + Math.cos(t * 0.0008 + a.p) * 12 * dpr);
        ctx.stroke();
      }
    }
    
    if (!prefersReduced) {
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('resize', resize);
  
  setTimeout(() => {
    resize();
    if (prefersReduced) {
      renderStatic();
    } else {
      requestAnimationFrame(tick);
    }
  }, 100);
})();
