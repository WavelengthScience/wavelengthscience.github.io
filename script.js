/* ================================================
   WAVELENGTH — Animal Communication Science
   Main JavaScript  ·  v2
   ================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


// ── Footer Year ───────────────────────────────
const yearEl = $('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ════════════════════════════════════════════════
// WAVE CANVAS ANIMATION
// ════════════════════════════════════════════════
(function initWaves() {
    const canvas = $('#wave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Waves styled to echo the Wavelength logo:
    // vibrant multi-color flowing curves on a dark teal background
    const waves = [
        { color: '#ff4080', amp: 0.08, freq: 3,  speed: 0.8,   lw: 3,   alpha: 0.80 },
        { color: '#c026d3', amp: 0.06, freq: 5,  speed: 1.2,   lw: 2.5, alpha: 0.55 },
        { color: '#818cf8', amp: 0.04, freq: 8,  speed: 1.8,   lw: 2,   alpha: 0.50 },
        { color: '#2dd4bf', amp: 0.05, freq: 6,  speed: -1.0,  lw: 3.5, alpha: 0.42 },
        { color: '#4ade80', amp: 0.03, freq: 11, speed: 2.4,   lw: 1.5, alpha: 0.48 },
        { color: '#c8952f', amp: 0.035,freq: 7,  speed: -1.5,  lw: 2,   alpha: 0.60 },
    ];

    let raf = null;
    let time = 0;

    function resize() {
        // Use 2× pixel ratio for sharpness on retina displays
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = canvas.offsetWidth  * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
    }

    function drawWave(w, t) {
        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;
        const yCenter = H * 0.6;

        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth   = w.lw;
        ctx.globalAlpha = w.alpha;
        ctx.shadowBlur  = 14;
        ctx.shadowColor = w.color;

        for (let x = 0; x <= W; x += 2) {
            const nx = x / W;
            // Envelope: sine pulse that fades at edges
            const envelope = Math.sin(nx * Math.PI);
            const y = yCenter + (w.amp * H * envelope) *
                      Math.sin(nx * w.freq * Math.PI * 2 + t * w.speed);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function draw() {
        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;
        ctx.clearRect(0, 0, W, H);

        waves.forEach(w => drawWave(w, time));

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        // Bottom gradient fade into next section
        const fadeBot = ctx.createLinearGradient(0, H * 0.6, 0, H);
        fadeBot.addColorStop(0, 'rgba(12,32,39,0)');
        fadeBot.addColorStop(1, 'rgba(12,32,39,1)');
        ctx.fillStyle = fadeBot;
        ctx.fillRect(0, H * 0.6, W, H * 0.4);

        // Top fade (keeps nav area fully dark)
        const fadeTop = ctx.createLinearGradient(0, 0, 0, H * 0.15);
        fadeTop.addColorStop(0, 'rgba(12,32,39,1)');
        fadeTop.addColorStop(1, 'rgba(12,32,39,0)');
        ctx.fillStyle = fadeTop;
        ctx.fillRect(0, 0, W, H * 0.15);

        time += 0.015;
        raf = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(draw);
    });

    resize();
    window.addEventListener('resize', () => {
        resize();
        // Re-scale happens in resize(); time continues
    });
    raf = requestAnimationFrame(draw);
})();


// ════════════════════════════════════════════════
// STICKY FILMSTRIP — Scroll Narrative
// ════════════════════════════════════════════════
(function initFilmstrip() {
    const wrap       = $('#filmstrip');
    const bgSlides   = $$('.filmstrip-slide');
    const textSlides = $$('.filmstrip-text-slide');
    const dots       = $$('.filmstrip-dot');
    if (!wrap || !bgSlides.length) return;

    const count = bgSlides.length; // 5
    let currentIdx = -1;           // force first update

    function setActive(idx) {
        if (idx === currentIdx) return;
        currentIdx = idx;

        bgSlides.forEach((s, i) => s.classList.toggle('active', i === idx));
        dots.forEach((d, i)    => d.classList.toggle('active', i === idx));

        textSlides.forEach((t, i) => {
            const isActive = i === idx;
            const isPast   = i < idx;
            t.classList.toggle('active', isActive);
            if (!isActive) {
                t.style.opacity   = '0';
                t.style.transform = isPast ? 'translateY(-36px)' : 'translateY(36px)';
            } else {
                t.style.opacity   = '';
                t.style.transform = '';
            }
        });
    }

    function onScroll() {
        const wrapTop  = wrap.offsetTop;
        const scrollY  = window.scrollY;
        const viewH    = window.innerHeight;
        const totalH   = wrap.clientHeight - viewH;
        const past     = scrollY - wrapTop;

        if (totalH <= 0 || past < 0) { setActive(0); return; }

        const progress = Math.max(0, Math.min(1, past / totalH));
        const idx      = Math.min(count - 1, Math.floor(progress * count));
        setActive(idx);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
})();


// ════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════
(function initNav() {
    const navbar   = $('#navbar');
    const toggle   = $('#nav-toggle');
    const navLinks = $('#nav-links');
    if (!navbar || !toggle || !navLinks) return;

    // Scroll → solid background
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    let open = false;
    const openMenu  = () => {
        open = true;
        navLinks.classList.add('open');
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        open = false;
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => open ? closeMenu() : openMenu());
    $$('a', navLinks).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });
})();


// ════════════════════════════════════════════════
// SMOOTH SCROLL
// ════════════════════════════════════════════════
(function initSmoothScroll() {
    const navbar = $('#navbar');
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = $(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = (navbar ? navbar.offsetHeight : 0) + 12;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        });
    });
})();


// ════════════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════════════
(function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
})();


// ════════════════════════════════════════════════
// TEAM "MORE" EXPAND/COLLAPSE
// ════════════════════════════════════════════════
(function initTeamExpand() {
    $$('.team-more-btn').forEach(btn => {
        const content = btn.nextElementSibling;
        if (!content) return;

        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            content.classList.toggle('open', !expanded);
        });
    });
})();
