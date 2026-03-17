/* ================================================
   WAVELENGTH — Animal Communication Science
   Main JavaScript
   ================================================ */

'use strict';

// ── Utility ───────────────────────────────────
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

    // Wave definitions — each has color, amplitude, frequency, speed, phase, lineWidth, alpha
    const waves = [
        { color: '#ff4080', amp: 58,  freq: 0.0055, speed: 0.30, phase: 0.00, lw: 2.8, alpha: 0.88 },
        { color: '#c026d3', amp: 82,  freq: 0.0040, speed: 0.19, phase: 2.09, lw: 3.8, alpha: 0.55 },
        { color: '#818cf8', amp: 44,  freq: 0.0074, speed: 0.38, phase: 4.19, lw: 2.0, alpha: 0.52 },
        { color: '#2dd4bf', amp: 64,  freq: 0.0050, speed: 0.23, phase: 1.05, lw: 4.2, alpha: 0.42 },
        { color: '#86efac', amp: 34,  freq: 0.0090, speed: 0.34, phase: 3.14, lw: 1.6, alpha: 0.50 },
        { color: '#fbbf24', amp: 26,  freq: 0.0070, speed: 0.44, phase: 5.24, lw: 1.5, alpha: 0.56 },
    ];

    let raf = null;
    let t   = 0;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function draw(timestamp) {
        t = timestamp * 0.001;
        const { width, height } = canvas;
        const cy = height * 0.60;

        ctx.clearRect(0, 0, width, height);

        waves.forEach(w => {
            // ── Glow pass ──
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth   = w.lw * 5;
            ctx.globalAlpha = w.alpha * 0.12;
            ctx.shadowBlur  = 0;
            for (let x = 0; x <= width; x += 3) {
                const y = cy + w.amp * Math.sin(w.freq * x + w.phase + t * w.speed);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            // ── Core line ──
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth   = w.lw;
            ctx.globalAlpha = w.alpha;
            ctx.shadowBlur  = 16;
            ctx.shadowColor = w.color;
            for (let x = 0; x <= width; x += 2) {
                const y = cy + w.amp * Math.sin(w.freq * x + w.phase + t * w.speed);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Reset shadow and alpha
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        // ── Gradient fades ──
        // Bottom fade (blend into next section)
        const botFade = ctx.createLinearGradient(0, height * 0.62, 0, height);
        botFade.addColorStop(0, 'rgba(7,17,29,0)');
        botFade.addColorStop(1, 'rgba(7,17,29,1)');
        ctx.fillStyle = botFade;
        ctx.fillRect(0, height * 0.62, width, height * 0.38);

        // Top fade (keep header area dark & readable)
        const topFade = ctx.createLinearGradient(0, 0, 0, height * 0.18);
        topFade.addColorStop(0, 'rgba(7,17,29,1)');
        topFade.addColorStop(1, 'rgba(7,17,29,0)');
        ctx.fillStyle = topFade;
        ctx.fillRect(0, 0, width, height * 0.18);

        raf = requestAnimationFrame(draw);
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(raf);
        } else {
            raf = requestAnimationFrame(draw);
        }
    });

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
})();


// ════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════
(function initNav() {
    const navbar    = $('#navbar');
    const toggle    = $('#nav-toggle');
    const navLinks  = $('#nav-links');
    if (!navbar || !toggle || !navLinks) return;

    // Scroll → solid background
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load

    // Mobile menu
    let menuOpen = false;
    const openMenu = () => {
        menuOpen = true;
        navLinks.classList.add('open');
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        navbar.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        menuOpen = false;
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        navbar.classList.remove('menu-open');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());

    // Close on nav link click
    $$('a', navLinks).forEach(a => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menuOpen) closeMenu();
    });
})();


// ════════════════════════════════════════════════
// SMOOTH SCROLL (for anchor links)
// ════════════════════════════════════════════════
(function initSmoothScroll() {
    const navbar = $('#navbar');
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href   = this.getAttribute('href');
            const target = href === '#' ? document.documentElement : $(href);
            if (!target) return;
            e.preventDefault();
            const offset = (navbar ? navbar.offsetHeight : 0) + 16;
            const top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();


// ════════════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════════════
(function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold:  0.10,
        rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach(el => observer.observe(el));
})();


// ════════════════════════════════════════════════
// NAVBAR ACTIVE SECTION HIGHLIGHT  (optional, subtle)
// ════════════════════════════════════════════════
(function initActiveSection() {
    const sections = $$('section[id]');
    const navAs    = $$('#nav-links a[href^="#"]');
    if (!sections.length || !navAs.length) return;

    const onScroll = () => {
        const scrollY = window.scrollY + 100;
        let current  = '';
        sections.forEach(sec => {
            if (sec.offsetTop <= scrollY) current = sec.id;
        });
        navAs.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
})();
