/* ⛏️ XanCraft – Placeholder Block-World Animation */
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const BS = 40; // block size
  const COLS = Math.ceil(W / BS);
  const ROWS = Math.ceil(H / BS);

  const GROUND_ROW = Math.floor(ROWS * 0.42);

  /* ── Block colours ── */
  const BLOCK = {
    sky:     null,
    grass:   { face:'#56AB2F', top:'#6BCB77', rim:'#2D6A4F' },
    dirt:    { face:'#A0612A', top:'#B8752F', rim:'#7A4A1A' },
    stone:   { face:'#9E9E9E', top:'#BDBDBD', rim:'#757575' },
    wood:    { face:'#A0622A', top:'#C07232', rim:'#7A4A1A' },
    leaves:  { face:'#2D6A4F', top:'#40916C', rim:'#1B4332' },
    gold:    { face:'#F5C518', top:'#FFDD00', rim:'#B8960C' },
    diamond: { face:'#00BCD4', top:'#40E0FF', rim:'#006978' },
    coal:    { face:'#333',    top:'#555',    rim:'#111'    },
  };

  /* ── World grid ── */
  let world = [];

  function build() {
    world = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        if (r < GROUND_ROW) return 'sky';
        if (r === GROUND_ROW) return 'grass';
        if (r <= GROUND_ROW + 3) {
          const rnd = Math.random();
          if (rnd < 0.04) return 'gold';
          if (rnd < 0.07) return 'coal';
          return 'dirt';
        }
        const rnd = Math.random();
        if (rnd < 0.025) return 'diamond';
        if (rnd < 0.055) return 'gold';
        if (rnd < 0.09)  return 'coal';
        return 'stone';
      })
    );

    // Trees
    for (let c = 2; c < COLS - 2; c += 5) {
      const base = GROUND_ROW;
      world[base - 1][c] = 'wood';
      world[base - 2][c] = 'wood';
      world[base - 3][c] = 'wood';
      [-1, 0, 1].forEach(dc => {
        if (world[base - 4] && world[base - 4][c + dc]) world[base - 4][c + dc] = 'leaves';
        if (dc !== 0 && world[base - 3][c + dc])         world[base - 3][c + dc] = 'leaves';
      });
      if (world[base - 5]) world[base - 5][c] = 'leaves';
    }
  }

  function drawBlock(c, r, type) {
    if (!type || type === 'sky') return;
    const x = c * BS, y = r * BS;
    const b = BLOCK[type] || BLOCK.stone;

    ctx.fillStyle = b.face;
    ctx.fillRect(x, y, BS, BS);

    // Top highlight
    ctx.fillStyle = b.top;
    ctx.fillRect(x, y, BS, 4);
    ctx.fillRect(x, y, 4, BS);

    // Bottom-right shadow
    ctx.fillStyle = b.rim;
    ctx.fillRect(x, y + BS - 3, BS, 3);
    ctx.fillRect(x + BS - 3, y, 3, BS);

    // Pixel outline
    ctx.strokeStyle = b.rim;
    ctx.lineWidth = .5;
    ctx.strokeRect(x + .5, y + .5, BS - 1, BS - 1);

    // Sparkle on precious blocks
    if ((type === 'gold' || type === 'diamond') && Math.random() < 0.008) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(x + Math.random() * (BS - 6) + 2, y + Math.random() * (BS - 6) + 2, 4, 4);
    }
  }

  /* ── Sky gradient ── */
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND_ROW * BS);
    g.addColorStop(0, '#5BB3F0');
    g.addColorStop(1, '#A8D8F0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, GROUND_ROW * BS);
  }

  /* ── Clouds ── */
  const clouds = [
    { x: 60,  y: 28, w: 100, s: 0.22 },
    { x: 280, y: 48, w: 80,  s: 0.18 },
    { x: 520, y: 32, w: 120, s: 0.25 },
    { x: 700, y: 52, w: 90,  s: 0.20 },
  ];
  function drawCloud(c) {
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.beginPath();
    ctx.ellipse(c.x,          c.y,       c.w * .48, c.w * .24, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * .3,  c.y - c.w * .1,  c.w * .34, c.w * .2, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - c.w * .28, c.y - c.w * .05, c.w * .28, c.w * .17,0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Character (pixel art) ── */
  let charX = 60, charDir = 1, charFrame = 0;
  let mining = false, mineTimer = 0;

  function drawChar(x) {
    const groundY = GROUND_ROW * BS;
    const bob = Math.sin(charFrame * 0.18) * 2.5;
    const y   = groundY - BS * 2 + bob;

    ctx.save();
    ctx.translate(x, y);
    if (charDir < 0) { ctx.scale(-1, 1); }

    // Legs
    ctx.fillStyle = '#1565C0';
    const ls = Math.sin(charFrame * 0.22) * 6;
    ctx.fillRect(-10, 30, 8, 18 + ls);
    ctx.fillRect(2,   30, 8, 18 - ls);

    // Body
    ctx.fillStyle = '#43A047';
    ctx.fillRect(-12, 10, 24, 22);

    // Belt
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(-12, 28, 24, 4);

    // Head
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(-11, -12, 22, 22);

    // Hair
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(-12, -14, 24, 8);

    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(2,  -6, 5, 5);
    ctx.fillRect(-7, -6, 5, 5);

    // Smile
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(-5, 4, 10, 3);
    ctx.fillStyle = '#FFCC80';
    ctx.fillRect(-4, 4, 2, 3);
    ctx.fillRect(2,  4, 2, 3);

    // Pickaxe
    const swing = mining ? Math.sin(charFrame * 0.5) * 25 : -15;
    ctx.save();
    ctx.translate(14, 0);
    ctx.rotate((swing * Math.PI) / 180);
    ctx.fillStyle = '#90A4AE'; // shaft
    ctx.fillRect(0, -4, 22, 5);
    ctx.fillStyle = '#B0BEC5'; // head
    ctx.fillRect(18, -10, 6, 14);
    ctx.restore();

    ctx.restore();
  }

  /* ── Particles ── */
  let particles = [];
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - .5) * 5,
        vy: -(Math.random() * 4 + 2),
        life: 1, color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  /* ── Frame ── */
  let frame = 0;

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawSky();

    clouds.forEach(c => {
      c.x -= c.s;
      if (c.x + c.w < 0) c.x = W + c.w;
      drawCloud(c);
    });

    // Draw world
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        drawBlock(c, r, world[r]?.[c]);

    // Move character
    charFrame++;
    mineTimer++;

    if (mineTimer < 90) {
      // Walk
      mining = false;
      charX += charDir * 1.4;
    } else if (mineTimer < 150) {
      // Mine
      mining = true;
      if (mineTimer % 20 === 0) {
        const col = Math.floor((charX + 20 * charDir) / BS);
        const row = GROUND_ROW;
        if (col >= 0 && col < COLS && world[row]?.[col] === 'grass') {
          world[row][col] = 'dirt';
          spawnParticles(col * BS + BS / 2, row * BS, '#6BCB77');
        }
      }
    } else {
      mineTimer = 0;
      mining = false;
      // Turn
      if (charX > W - 80) charDir = -1;
      if (charX < 60)     charDir = 1;
    }

    drawChar(charX);

    // Particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.04;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    });

    frame++;
    requestAnimationFrame(animate);
  }

  build();
  animate();
})();
