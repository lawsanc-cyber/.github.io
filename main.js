/* ⚡ ZapZone – main.js (homepage) */

// ── Mobile nav toggle ──────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.textContent = '☰';
  })
);

// ── Scroll-based navbar shadow ─────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 10 ? '0 4px 30px rgba(0,0,0,.5)' : '0 4px 24px rgba(0,0,0,.4)';
}, { passive: true });

// ── Card click → navigate ──────────────────────
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', e => {
    if (!e.target.classList.contains('play-btn')) {
      window.location.href = card.dataset.href;
    }
  });
});

// ── Sparkle burst on card hover ────────────────
const SPARKLES = ['⭐','✨','🌟','💫','⚡','🎉'];

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('mouseenter', e => {
    const rect = card.getBoundingClientRect();
    spawnSparkles(rect.left + rect.width / 2, rect.top + 40, 6);
  });
});

function spawnSparkles(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
    const angle  = (Math.PI * 2 * i) / count + Math.random() * .5;
    const dist   = 50 + Math.random() * 60;
    const dx     = Math.cos(angle) * dist;
    const dy     = Math.sin(angle) * dist - 30;
    const size   = 14 + Math.random() * 16;

    Object.assign(el.style, {
      position:      'fixed',
      left:          `${cx}px`,
      top:           `${cy}px`,
      fontSize:      `${size}px`,
      pointerEvents: 'none',
      zIndex:        9999,
      transition:    'transform .7s ease-out, opacity .7s ease-out',
      transform:     'translate(-50%, -50%)',
      opacity:       '1',
    });
    document.body.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
      el.style.opacity   = '0';
    }));

    setTimeout(() => el.remove(), 750);
  }
}

// ── Intersection Observer: animate cards on scroll ──
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.game-card').forEach(card => io.observe(card));
