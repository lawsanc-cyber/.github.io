/* 🚗 XanCars – Placeholder Racing Animation */
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let frame = 0;

  /* ── Road constants ── */
  const ROAD_TOP    = H * 0.55;
  const ROAD_HEIGHT = H - ROAD_TOP;

  /* ── Clouds ── */
  const clouds = [
    { x: 80,  y: 55,  w: 110, speed: 0.25 },
    { x: 310, y: 35,  w: 90,  speed: 0.18 },
    { x: 560, y: 65,  w: 130, speed: 0.30 },
    { x: 720, y: 42,  w: 80,  speed: 0.22 },
  ];

  /* ── Roadside trees ── */
  const trees = [60, 210, 360, 510, 660, 750].map(x => ({ x, speed: 2.2 }));

  /* ── Lane markers ── */
  const DASH_W = 70, DASH_GAP = 50, DASH_TOTAL = DASH_W + DASH_GAP;
  let dashOffset = 0;

  /* ── Cars ── */
  const CAR_COLORS = ['#FF4040', '#4361EE', '#06D6A0', '#FF6B35', '#FFD60A', '#FF2D78'];
  let cars = [
    { x: -120, lane: 0, speed: 3.2, color: CAR_COLORS[0], trail: [] },
    { x: W + 60, lane: 1, speed: -2.5, color: CAR_COLORS[1], trail: [] }, // going left
  ];
  let nextCarTimer = 0;

  /* ── Mountains ── */
  const mountains = [
    { pts: [0,H*.55, 150,H*.22, 300,H*.55] },
    { pts: [100,H*.55, 280,H*.15, 460,H*.55] },
    { pts: [320,H*.55, 500,H*.28, 670,H*.55] },
    { pts: [550,H*.55, 700,H*.18, 850,H*.55] },
    { pts: [700,H*.55, 870,H*.30, W+40,H*.55] },
  ];

  /* ─────────────────────────────── draw helpers ─────────────────────────────── */

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, ROAD_TOP);
    g.addColorStop(0, '#87CEEB');
    g.addColorStop(1, '#C9E8F5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, ROAD_TOP);
  }

  function drawMountains() {
    mountains.forEach((m, i) => {
      ctx.beginPath();
      ctx.moveTo(m.pts[0], m.pts[1]);
      ctx.lineTo(m.pts[2], m.pts[3]);
      ctx.lineTo(m.pts[4], m.pts[5]);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#B0C4DE' : '#9BAECC';
      ctx.fill();
      // snow cap
      const mx = (m.pts[0] + m.pts[4]) / 2;
      const my = m.pts[3];
      ctx.beginPath();
      ctx.moveTo(mx - 18, my + 22);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + 18, my + 22);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fill();
    });
  }

  function drawCloud(c) {
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.beginPath();
    ctx.ellipse(c.x,        c.y,      c.w * .5,  c.w * .25, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * .35, c.y - c.w * .1, c.w * .35, c.w * .2, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - c.w * .3,  c.y - c.w * .05, c.w * .3, c.w * .18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGrass() {
    // Lower grass
    ctx.fillStyle = '#5BA832';
    ctx.fillRect(0, ROAD_TOP, W, ROAD_HEIGHT);
    // Edge strips
    ctx.fillStyle = '#6BCB77';
    ctx.fillRect(0, ROAD_TOP, W, 8);
    ctx.fillStyle = '#4A9428';
    ctx.fillRect(0, H - 6, W, 6);
  }

  function drawRoad() {
    // Asphalt
    ctx.fillStyle = '#444';
    ctx.fillRect(0, ROAD_TOP + 8, W, ROAD_HEIGHT - 14);

    // Yellow border lines
    ctx.fillStyle = '#FFD60A';
    ctx.fillRect(0, ROAD_TOP + 8, W, 5);
    ctx.fillRect(0, H - 14, W, 5);

    // White centre dashes
    dashOffset = (dashOffset + 4) % DASH_TOTAL;
    const midY = ROAD_TOP + 8 + (ROAD_HEIGHT - 22) / 2;
    ctx.fillStyle = '#fff';
    for (let x = -DASH_TOTAL + dashOffset; x < W + DASH_W; x += DASH_TOTAL) {
      ctx.fillRect(x, midY - 3, DASH_W, 6);
    }
  }

  function drawTree(t) {
    const groundY = ROAD_TOP + 2;
    ctx.fillStyle = '#6B3A1F';
    ctx.fillRect(t.x - 4, groundY - 28, 8, 28);
    ctx.fillStyle = '#2D6A4F';
    ctx.beginPath();
    ctx.arc(t.x, groundY - 40, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40916C';
    ctx.beginPath();
    ctx.arc(t.x, groundY - 52, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCar(car) {
    const { x, lane, color } = car;
    const laneH = (ROAD_HEIGHT - 22) / 2;
    const y = ROAD_TOP + 8 + (lane === 0 ? laneH * 0.15 : laneH * 1.1);
    const W2 = 80, H2 = 36;
    const dir = car.speed > 0 ? 1 : -1; // 1=right, -1=left

    ctx.save();
    if (dir < 0) { ctx.translate(x + W2, y); ctx.scale(-1, 1); ctx.translate(-W2, 0); }
    else ctx.translate(x, y);

    // Speed lines
    ctx.strokeStyle = 'rgba(255,255,255,.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-8, 8 + i * 10);
      ctx.lineTo(-28 - Math.random() * 18, 8 + i * 10);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(0, 0, W2, H2, 7);
    ctx.fill();

    // Cabin
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(14, -20, W2 - 28, 22, 5);
    ctx.fill();

    // Windows
    ctx.fillStyle = 'rgba(160,225,255,.82)';
    ctx.fillRect(18, -17, 20, 14);
    ctx.fillRect(42, -17, 20, 14);

    // Window glare
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.fillRect(19, -16, 6, 4);
    ctx.fillRect(43, -16, 6, 4);

    // Wheels
    [12, 62].forEach(wx => {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(wx, H2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(wx, H2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(wx, H2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Headlights
    ctx.fillStyle = '#FFE566';
    ctx.fillRect(W2 - 7, 7, 7, 8);
    ctx.fillRect(W2 - 7, 22, 7, 8);

    // Tail lights
    ctx.fillStyle = '#FF2020';
    ctx.fillRect(0, 7, 6, 8);
    ctx.fillRect(0, 22, 6, 8);

    ctx.restore();
  }

  /* ─────────────────────────────── animate ─────────────────────────────── */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    drawSky();
    drawMountains();

    clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.w * .6 < 0) c.x = W + c.w;
      drawCloud(c);
    });

    trees.forEach(t => {
      t.x -= t.speed;
      if (t.x < -30) t.x = W + 30;
      drawTree(t);
    });

    drawGrass();
    drawRoad();

    // Spawn new cars occasionally
    nextCarTimer++;
    if (nextCarTimer > 120) {
      nextCarTimer = 0;
      const going = Math.random() > 0.5 ? 1 : -1;
      cars.push({
        x: going > 0 ? -130 : W + 10,
        lane: Math.round(Math.random()),
        speed: (2.5 + Math.random() * 2) * going,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
      });
    }

    cars.forEach(c => { c.x += c.speed; });
    cars = cars.filter(c => c.x > -200 && c.x < W + 200);
    cars.forEach(c => drawCar(c));

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
})();
