/* ─── Utilities ────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Footer: year & subscribe form ───────────────────── */
$$('.footer-year').forEach(el => el.textContent = new Date().getFullYear());

const footerForm = $('#footerForm');
if (footerForm) {
  footerForm.addEventListener('submit', e => {
    e.preventDefault();
    footerForm.classList.add('hidden');
    const thanks = $('#footerThanks');
    if (thanks) thanks.classList.remove('hidden');
  });
}

/* ─── Navbar scroll state (home page only — inner pages stay dark) ─ */
const navbar = $('#navbar');
if (navbar && $('#waveformCanvas')) {
  const onNavScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

/* ─── Mobile menu toggle ───────────────────────────────── */
const hamburger = $('#navHamburger');
const navMobile = $('#navMobile');
const iconMenu  = $('#iconMenu');
const iconX     = $('#iconX');

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const open = navMobile.classList.toggle('open');
    if (iconMenu) iconMenu.classList.toggle('hidden', open);
    if (iconX)    iconX.classList.toggle('hidden', !open);
  });
}

/* ─── Fade-in on scroll (IntersectionObserver) ─────────── */
const fadeEls = $$('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));
}

/* ─── Waveform canvas animation (home page only) ───────── */
const canvas = $('#waveformCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let animId;
  let time = 0;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  };
  resize();
  window.addEventListener('resize', resize);

  const drawWave = (yOffset, amplitude, frequency, speed, color, lineWidth) => {
    const w = canvas.width, h = canvas.height;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    for (let x = 0; x <= w; x += 2) {
      const nx       = x / w;
      const envelope = Math.sin(nx * Math.PI);
      const y        = yOffset * h +
        Math.sin(nx * frequency * Math.PI * 2 + time * speed) *
        amplitude * h * envelope;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const animate = () => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWave(0.5,  0.08,  3,  0.8, 'hsla(180,45%,35%,0.15)', 3   * dpr);
    drawWave(0.5,  0.06,  5,  1.2, 'hsla(38, 70%,50%,0.20)', 2.5 * dpr);
    drawWave(0.5,  0.04,  8,  1.8, 'hsla(180,45%,35%,0.25)', 2   * dpr);
    drawWave(0.5,  0.03, 12,  2.5, 'hsla(42, 40%,90%,0.15)', 1.5 * dpr);
    drawWave(0.5,  0.05,  6, -1.0, 'hsla(38, 70%,50%,0.15)', 2   * dpr);
    drawWave(0.45, 0.02, 18,  3.0, 'hsla(180,45%,35%,0.12)', 1   * dpr);
    drawWave(0.55, 0.02, 15, -2.2, 'hsla(38, 70%,50%,0.10)', 1   * dpr);
    time   += 0.015;
    animId  = requestAnimationFrame(animate);
  };
  animate();
}

/* ─── Sticky Filmstrip (home page only) ────────────────── */
const filmstrip = $('#filmstrip');
if (filmstrip) {
  const bgSlides   = $$('.filmstrip-bg-slide',      filmstrip);
  const textSlides = $$('.filmstrip-text-slide',    filmstrip);
  const progItems  = $$('.filmstrip-progress-item', filmstrip);
  const count      = bgSlides.length;
  let   current    = -1;

  const setActive = idx => {
    if (idx === current) return;
    current = idx;

    bgSlides.forEach((el, i) =>
      el.classList.toggle('active', i === idx)
    );

    progItems.forEach((el, i) =>
      el.classList.toggle('active', i === idx)
    );

    textSlides.forEach((el, i) => {
      const isPast   = i < idx;
      const isActive = i === idx;
      el.classList.toggle('active', isActive);
      el.classList.toggle('past',   isPast);
      el.style.opacity   = isActive ? '1' : '0';
      el.style.transform = isActive
        ? 'translateY(0)'
        : (isPast ? 'translateY(-40px)' : 'translateY(40px)');
    });
  };

  const onFilmstripScroll = () => {
    const top    = filmstrip.offsetTop;
    const scrollY = window.scrollY;
    const viewH  = window.innerHeight;
    const totalH = filmstrip.clientHeight - viewH;
    const past   = scrollY - top;

    if (totalH <= 0 || past < 0) { setActive(0); return; }

    const progress = Math.max(0, Math.min(1, past / totalH));
    const idx      = Math.min(count - 1, Math.floor(progress * count));
    setActive(idx);
  };

  window.addEventListener('scroll', onFilmstripScroll, { passive: true });
  setActive(0);
}

/* ─── Team expand / collapse ───────────────────────────── */
$$('.team-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const content  = btn.nextElementSibling;
    const expanded = btn.classList.toggle('expanded');

    btn.setAttribute('aria-expanded', String(expanded));
    if (content) content.classList.toggle('open', expanded);

    // Update label while preserving the chevron SVG
    const chevron = btn.querySelector('.chevron');
    btn.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
    btn.insertBefore(
      document.createTextNode(expanded ? 'Less' : 'More'),
      chevron
    );
  });
});

/* ─── Donate UI (donate page only) ─────────────────────── */
const donateSection = $('.donate-section');
if (donateSection) {
  const freqBtns      = $$('.freq-btn');
  const amountBtns    = $$('.amount-btn');
  const customWrap    = $('#customInputWrap');
  const customInput   = $('#customAmountInput');
  const impactEl      = $('#donateImpact');
  const donateBtn     = $('#donateBtn');

  const impacts = {
    25:  'Funds one hour of field recording equipment use',
    50:  'Supports acoustic data analysis for a research day',
    100: 'Covers travel costs for a community engagement session',
    250: 'Sponsors a full week of field research operations',
  };

  let freq     = 'one-time';
  let selected = 50;

  const updateBtn = () => {
    const amt    = selected === 'custom'
      ? (customInput && customInput.value ? `$${customInput.value}` : '')
      : `$${selected}`;
    const suffix = freq === 'monthly' ? ' / month' : '';
    if (donateBtn) donateBtn.textContent = `Donate ${amt}${suffix}`;
  };

  freqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      freq = btn.dataset.freq;
      freqBtns.forEach(b => b.classList.toggle('active', b === btn));
      updateBtn();
    });
  });

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selected = btn.dataset.amount === 'custom'
        ? 'custom'
        : Number(btn.dataset.amount);

      amountBtns.forEach(b => b.classList.toggle('active', b === btn));

      if (customWrap)
        customWrap.classList.toggle('visible', selected === 'custom');

      if (impactEl)
        impactEl.textContent = selected !== 'custom'
          ? (impacts[selected] || '')
          : '';

      updateBtn();
    });
  });

  if (customInput) {
    customInput.addEventListener('input', updateBtn);
  }
}
