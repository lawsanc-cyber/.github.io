/* 🏄 KaiSurfing – Placeholder Ocean Animation */
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let frame = 0;

  const HORIZON = H * 0.48;

  /* ── Wave layers (back → front) ── */
  const waveLayers = [
    { amp: 18, freq: 0.014, speed: 0.025, yBase: HORIZON + 10, color: 'rgba(0,96,160,0.55)' },
    { amp: 22, freq: 0.018, speed: 0.038, yBase: HORIZON + 28, color: 'rgba(0,119,182,0.65)' },
    { amp: 26, freq: 0.022, speed: 0.055, yBase: HORIZON + 50, color: 'rgba(0,150,210,0.75)' },
    { amp: 30, freq: 0.028, speed: 0.075, yBase: HORIZON + 75, color: 'rgba(0,180,216,0.88)' },
    { amp: 24, freq: 0.034, speed: 0.100, yBase: HORIZON + 105,'color':'rgba(72,202,228,0.95)'},
  ];

  function waveY(layer, x) {
    return layer.yBase + Math.sin(x * layer.freq + frame * layer.speed) * layer.amp;
  }

  /* ── Clouds ── */
  const clouds = [
    { x: 50,  y: 42, w: 110, s: 0.20 },
    { x: 250, y: 65, w: 85,  s: 0.15 },
    { x: 490, y: 38, w: 130, s: 0.22 },
    { x: 700, y: 60, w: 90,  s: 0.18 },
  ];

  /* ── Birds ── */
  const birds = Array.from({ length: 5 }, (_, i) => ({
    x: i * 160 + 40, y: 50 + Math.random() * 70, s: 0.4 + Math.random() * 0.5,
  }));

  /* ── Fish ── */
  const FISH_COLORS = ['#FF6B6B','#FFD93D','#06D6A0','#4361EE','#FF2D78'];
  const fish = Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * W,
    y: HORIZON + 130 + Math.random() * (H - HORIZON - 160),
    sz: 12 + Math.random() * 16,
    speed: (0.6 + Math.random() * 1.2) * (Math.random() > .5 ? 1 : -1),
    color: FISH_COLORS[i % FISH_COLORS.length],
  }));

  /* ── Bubbles ── */
  const bubbles = Array.from({ length: 18 }, () => ({
    x: Math.random() * W,
    y: HORIZON + 120 + Math.random() * (H - HORIZON - 130),
    r: 3 + Math.random() * 7,
    vy: -(0.3 + Math.random() * 0.6),
    alpha: 0.25 + Math.random() * 0.45,
  }));

  /* ── Seagulls ── */
  function drawBird(b) {
    ctx.strokeStyle = 'rgba(30,30,60,.65)';
    ctx.lineWidth = 2;
    const flap = Math.sin(frame * 0.13 + b.x * 0.04) * 6;
    ctx.beginPath();
    ctx.moveTo(b.x - 10, b.y);
    ctx.quadraticCurveTo(b.x - 5, b.y - flap, b.x, b.y);
    ctx.quadraticCurveTo(b.x + 5, b.y - flap, b.x + 10, b.y);
    ctx.stroke();
  }

  /* ── Sky & Sun ── */
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, '#0A3D8F');
    g.addColorStop(0.45, '#0077C8');
    g.addColorStop(1, '#48CAE4');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HORIZON);

    // Sun
    const sx = W * 0.78, sy = H * 0.12;
    const sunG = ctx.createRadialGradient(sx, sy, 0, sx, sy, 55);
    sunG.addColorStop(0, '#FFE066');
    sunG.addColorStop(0.55, '#FFAA00');
    sunG.addColorStop(1, 'transparent');
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(sx, sy, 55, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.save();
    ctx.translate(sx, sy);
    ctx.strokeStyle = 'rgba(255,220,80,.22)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(58, 0);
      ctx.lineTo(80, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Sun shimmer on water
    const shimG = ctx.createLinearGradient(sx - 60, HORIZON, sx + 60, H);
    shimG.addColorStop(0, 'rgba(255,220,80,.25)');
    shimG.addColorStop(1, 'rgba(255,220,80,0)');
    ctx.fillStyle = shimG;
    ctx.fillRect(sx - 60, HORIZON, 120, H - HORIZON);
  }

  function drawCloud(c) {
    ctx.fillStyle = 'rgba(255,255,255,.80)';
    ctx.beginPath();
    ctx.ellipse(c.x,           c.y,      c.w * .48, c.w * .24, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * .32, c.y - c.w * .1,  c.w * .33, c.w * .2,  0, 0, Math.PI * 2);
    ctx.ellipse(c.x - c.w * .28, c.y - c.w * .05, c.w * .28, c.w * .17, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Deep ocean ── */
  function drawDeepOcean() {
    const g = ctx.createLinearGradient(0, HORIZON, 0, H);
    g.addColorStop(0, '#023E8A');
    g.addColorStop(1, '#03045E');
    ctx.fillStyle = g;
    ctx.fillRect(0, HORIZON, W, H - HORIZON);
  }

  function drawWave(layer) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, waveY(layer, 0));
    for (let x = 2; x <= W; x += 2) ctx.lineTo(x, waveY(layer, x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
  }

  function drawFoam(layer) {
    ctx.beginPath();
    ctx.moveTo(0, waveY(layer, 0));
    for (let x = 2; x <= W; x += 2) ctx.lineTo(x, waveY(layer, x));
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function drawFish(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.speed < 0 ? -1 : 1, 1);

    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.sz, f.sz * .5, 0, 0, Math.PI * 2);
    ctx.fill();

    // tail
    ctx.beginPath();
    ctx.moveTo(-f.sz, 0);
    ctx.lineTo(-f.sz - f.sz * .55, -f.sz * .4);
    ctx.lineTo(-f.sz - f.sz * .55,  f.sz * .4);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(f.sz * .45, -f.sz * .12, f.sz * .22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(f.sz * .5, -f.sz * .12, f.sz * .1, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  function drawBubble(b) {
    ctx.strokeStyle = `rgba(144,224,239,${b.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${b.alpha * .45})`;
    ctx.beginPath();
    ctx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .35, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Kai the surfer ── */
  function drawKai() {
    const frontLayer = waveLayers[3];
    const kx = W * 0.35;
    const ky = waveY(frontLayer, kx) - 30;
    const tilt = Math.sin(frame * 0.045) * 12; // body sway
    const bob  = Math.sin(frame * 0.075) * 4;

    ctx.save();
    ctx.translate(kx, ky + bob);
    ctx.rotate((tilt * Math.PI) / 180);

    // Surfboard shadow
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 46, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Surfboard
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.ellipse(0, 22, 46, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fin
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(38, 24); ctx.lineTo(50, 38); ctx.lineTo(26, 30);
    ctx.closePath(); ctx.fill();

    // Stripe on board
    ctx.strokeStyle = '#FF2D78';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-30, 22); ctx.lineTo(30, 22);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(-13, 6, 9, 17);
    ctx.fillRect(2, 6, 9, 17);

    // Body (wetsuit)
    ctx.fillStyle = '#00B4D8';
    ctx.fillRect(-15, -14, 30, 22);

    // Head
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(0, -22, 14, 0, Math.PI * 2);
    ctx.fill();

    // Hair / helmet
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.arc(0, -30, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-11, -32, 22, 8);

    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(-8, -26, 5, 5);
    ctx.fillRect(3, -26, 5, 5);

    // Big smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0.25, Math.PI - 0.25);
    ctx.stroke();

    // Arms raised (holding balance)
    const armWave = Math.sin(frame * 0.09) * 14;
    ctx.fillStyle = '#FFCC80';

    ctx.save();
    ctx.translate(-16, -6);
    ctx.rotate((-70 + armWave) * Math.PI / 180);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    ctx.save();
    ctx.translate(16, -6);
    ctx.rotate((70 - armWave) * Math.PI / 180);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    ctx.restore();

    // Water spray droplets
    for (let i = 0; i < 2; i++) {
      if (Math.random() < 0.35) {
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        const sx = kx - 50 + Math.random() * 30;
        const sy = ky + 20 + Math.random() * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ── Main loop ── */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    drawSky();

    // Clouds
    clouds.forEach(c => {
      c.x -= c.s;
      if (c.x + c.w < 0) c.x = W + c.w;
      drawCloud(c);
    });

    // Birds
    birds.forEach(b => {
      b.x += b.s;
      if (b.x > W + 20) b.x = -20;
      drawBird(b);
    });

    drawDeepOcean();

    // Back wave layers
    waveLayers.slice(0, 4).forEach(drawWave);

    // Fish (between wave layers)
    fish.forEach(f => {
      f.x += f.speed;
      if (f.x > W + 30) f.x = -30;
      if (f.x < -30)    f.x = W + 30;
      drawFish(f);
    });

    // Bubbles
    bubbles.forEach(b => {
      b.y += b.vy;
      if (b.y < HORIZON + 60) { b.y = H - 20; b.x = Math.random() * W; }
      drawBubble(b);
    });

    // Front wave layers
    waveLayers.slice(4).forEach(drawWave);
    waveLayers.forEach(drawFoam);

    // Kai on waves
    drawKai();

    // Random surface sparkles
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.25) {
        const fx = Math.random() * W;
        const fy = waveY(waveLayers[4], fx);
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.fillRect(fx, fy, 2, 2);
      }
    }

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
})();
