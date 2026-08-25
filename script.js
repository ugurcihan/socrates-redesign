/* ============================================
   Socrates Creative Events — Redesign Concept
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- helpers ---------- */
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
  const isTouch = matchMedia('(hover:none)').matches;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav scroll state ---------- */
  const nav = $('#nav');
  const progressBar = $('#progressBar');

  function onScroll(){
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);

    const h = document.documentElement;
    const scrollPct = (h.scrollTop || document.body.scrollTop) /
      ((h.scrollHeight || document.body.scrollHeight) - h.clientHeight) * 100;
    progressBar.style.width = scrollPct + '%';

    // active nav link
    let current = 'top';
    $$('main section[id]').forEach(sec => {
      if (y >= sec.offsetTop - 200) current = sec.id;
    });
    $$('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#navBurger');
  const navLinks = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  }));

  /* ---------- custom cursor ---------- */
  if (!isTouch){
    document.body.classList.add('has-cursor');
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    let mx=0,my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop(){
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    $$('a, button, .tilt-card, .logo-chip').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ---------- reveal on scroll ---------- */
  // IntersectionObserver is the primary mechanism, but its periodic
  // re-checks aren't guaranteed to fire promptly in every environment
  // (backgrounded/throttled tabs, some headless setups). Content must
  // never stay permanently invisible waiting on that, so a lightweight
  // scroll-driven fallback double-checks anything still unrevealed.
  const revealTargets = $$('.reveal-up, .reveal-clip, .reveal-side');
  revealTargets.forEach((el, i) => {
    if (!el.style.transitionDelay) el.style.transitionDelay = (i % 6) * 0.06 + 's';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  function checkRevealFallback(){
    const vh = window.innerHeight;
    revealTargets.forEach(el => {
      if (el.classList.contains('in-view')) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh - 60 && r.bottom > 0){
        el.classList.add('in-view');
        revealObserver.unobserve(el);
      }
    });
  }
  document.addEventListener('scroll', checkRevealFallback, { passive:true });
  window.addEventListener('load', checkRevealFallback);
  checkRevealFallback();

  /* hero word-by-word reveal */
  setTimeout(() => {
    $$('.hero-title .word').forEach((w, i) => {
      setTimeout(() => w.classList.add('in-view'), i * 90);
    });
  }, 250);

  /* ---------- process line fill ---------- */
  const processTrack = $('.process-track');
  if (processTrack){
    const fillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          $('.process-line-fill').style.width = '100%';
          fillObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    fillObserver.observe(processTrack);
  }

  /* ---------- animated counters ---------- */
  const counters = $$('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('tr-TR');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- 3D tilt cards ---------- */
  if (!isTouch){
    $$('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

  /* ---------- scroll-scrubbed sprite canvas (about + online) ---------- */
  // Same technique as the ugurcihancekic.com hero (see .hero-video in that
  // project): a tall wrapper supplies scroll room, a sticky inner block
  // holds position while that room is consumed, and a canvas draws
  // whichever sprite-sheet frame matches how far through the wrapper the
  // user has scrolled — so the section doesn't release to the next one
  // until the clip has played through.
  //
  // Disabled on mobile (see the max-width:900px block in style.css): a
  // sticky block taller than a short mobile viewport just gets cut off
  // rather than scrolled, which would trap the text column off-screen.
  // Mobile instead autoplays through the same sprite on a simple timer,
  // like a normal looping video.
  function initSpriteScrub(wrapperSel, canvasSel){
    const wrapper = $(wrapperSel);
    const canvas = $(canvasSel);
    if (!wrapper || !canvas) return;

    const cols = parseInt(canvas.dataset.cols, 10);
    const rows = parseInt(canvas.dataset.rows, 10);
    const totalFrames = parseInt(canvas.dataset.frames, 10);
    const ctx = canvas.getContext('2d');
    const sprite = new Image();
    sprite.decoding = 'async';
    let spriteReady = false;
    let frameW = 0, frameH = 0;
    let currentFrame = 0, targetFrame = 0;

    function resizeCanvas(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const frameEl = canvas.parentElement;
      canvas.width = Math.round(frameEl.clientWidth * dpr);
      canvas.height = Math.round(frameEl.clientHeight * dpr);
    }

    function drawFrame(index){
      if (!spriteReady) return;
      index = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
      const col = index % cols;
      const row = Math.floor(index / cols);
      const scale = Math.max(canvas.width / frameW, canvas.height / frameH);
      const drawW = frameW * scale, drawH = frameH * scale;
      const dx = (canvas.width - drawW) / 2, dy = (canvas.height - drawH) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sprite, col * frameW, row * frameH, frameW, frameH, dx, dy, drawW, drawH);
    }

    sprite.onload = () => {
      frameW = sprite.naturalWidth / cols;
      frameH = sprite.naturalHeight / rows;
      spriteReady = true;
      resizeCanvas();
      targetFrame = prefersReduced ? totalFrames - 1 : 0; // reduced motion: land on the logo, static
      currentFrame = targetFrame;
      drawFrame(currentFrame);
    };
    sprite.src = canvas.dataset.sprite;

    const isDesktopPin = window.matchMedia('(min-width: 901px)').matches;

    if (prefersReduced){
      // Static hold on the final frame, set once above — no listeners.
    } else if (isDesktopPin){
      let ticking = false;
      function computeTarget(){
        ticking = false;
        const scrollable = wrapper.offsetHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const rect = wrapper.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
        targetFrame = progress * (totalFrames - 1);
      }
      function onScroll(){
        if (!ticking){ ticking = true; requestAnimationFrame(computeTarget); }
      }
      function tick(){
        currentFrame += (targetFrame - currentFrame) * 0.25;
        if (Math.abs(targetFrame - currentFrame) < 0.05) currentFrame = targetFrame;
        drawFrame(currentFrame);
        requestAnimationFrame(tick);
      }
      document.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', () => { resizeCanvas(); onScroll(); });
      requestAnimationFrame(tick);
    } else {
      // Mobile: no pin, just loop through the sprite like a normal video.
      const FPS = 6; // matches the sprite sheet's own capture rate
      let lastAdvance = performance.now();
      function tickMobile(now){
        if (now - lastAdvance >= 1000 / FPS){
          lastAdvance = now;
          currentFrame = (currentFrame + 1) % totalFrames;
          drawFrame(currentFrame);
        }
        requestAnimationFrame(tickMobile);
      }
      window.addEventListener('resize', resizeCanvas);
      requestAnimationFrame(tickMobile);
    }
  }

  initSpriteScrub('.about', '.about-media-canvas');
  initSpriteScrub('.online', '.online-media-canvas');

  /* ---------- references marquee ---------- */
  // Real logos, cropped from the client's own reference wall (their site
  // only ever had these as one flattened collage image — no individual
  // files existed — so each was cut out, aligned and cleaned locally).
  const brands = [
    ["L'Oréal","loreal"], ["Divan","divan"], ["Koç","koc"], ["Inveo","inveo"],
    ["Colgate","colgate"], ["Prada","prada"], ["TEB Arval","teb-arval"], ["Vichy","vichy"],
    ["Gedik Yatırım","gedik-yatirim"], ["Sompo","sompo"], ["Avixa","avixa"], ["MRC","mrc"],
    ["Kérastase","kerastase"], ["Hacı Şakir","haci-sakir"], ["Kiehl's","kiehls"], ["Lancôme","lancome"],
    ["Y.T.Ü.","ytu"], ["Meridol","meridol"], ["Aveda","aveda"], ["L'Oréal Professionnel","loreal-professionnel"],
    ["Garnier","garnier"], ["Ray Sigorta","ray-sigorta"], ["Tupperware","tupperware"], ["Healy","healy"],
    ["Ceva","ceva"], ["Sanovel","sanovel"], ["Hill's","hills"], ["SkinCeuticals","skinceuticals"],
    ["Convatec","convatec"], ["Palmolive","palmolive"], ["Yves Saint Laurent","ysl"], ["Giorgio Armani","giorgio-armani"],
    ["Okadoil","okadoil"], ["Hotiç","hotic"], ["CeraVe","cerave-1"], ["Valentino","valentino"],
    ["TEB Cetelem","teb-cetelem"], ["Centurion","centurion"], ["Montero","montero"], ["CeraVe","cerave-2"],
    ["Maybelline","maybelline"], ["Demant","demant"], ["ACTherm","actherm"], ["Royal Roads University","royal-roads"],
    ["HDI Sigorta","hdi-sigorta"], ["La Roche-Posay","la-roche-posay"], ["Arven","arven"], ["Bausch + Lomb","bausch-lomb"]
  ];
  const half = Math.ceil(brands.length / 2);
  const row1 = brands.slice(0, half);
  const row2 = brands.slice(half);

  function fillTrack(id, list){
    const track = $('#' + id);
    if (!track) return;
    const loopList = list.concat(list); // duplicate for seamless loop
    track.innerHTML = loopList.map(([name, slug]) =>
      `<span class="logo-chip"><img src="assets/logos/${slug}.png" alt="${name}" loading="lazy" width="184" height="125"></span>`
    ).join('');
  }
  fillTrack('track1', row1);
  fillTrack('track2', row2);

  /* re-bind cursor hover for freshly injected chips */
  if (!isTouch){
    const ring = $('#cursorRing');
    $$('.logo-chip').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ---------- ambient constellation background (below hero) ---------- */
  // Same node-grid / mouse-repulsion idea as the ConstellationGrid demo,
  // ported to plain canvas so it can sit behind the (non-React) rest of
  // this page. Grid-neighbor-limited connection search (not a full O(n^2)
  // scan) since this canvas can be several thousand px tall; an
  // IntersectionObserver also stops the rAF loop while it's fully
  // scrolled out of view.
  const ambientCanvas = $('#ambientCanvas');
  if (ambientCanvas && !prefersReduced){
    const actx = ambientCanvas.getContext('2d', { alpha: true });
    let aWidth = 0, aHeight = 0, aNodes = [], aCols = 0, aRows = 0;
    const spacing = isTouch ? 130 : 100;
    const MAX_CONN_DIST = spacing * 1.5;
    const MAX_CONN_DIST_SQ = MAX_CONN_DIST * MAX_CONN_DIST;
    const mouse = { x: -1000, y: -1000, radius: 170 };
    // Starts optimistically true (IntersectionObserver's first callback
    // isn't guaranteed to land promptly in every environment — same class
    // of issue as the scroll-reveal fallback above). Getting this wrong by
    // starting true just means one extra rAF loop briefly runs off-screen;
    // starting false risked the background never appearing at all.
    let isVisible = true, rafId = null, lastTime = performance.now();

    function buildGrid(){
      aNodes = [];
      aCols = Math.ceil(aWidth / spacing) + 1;
      aRows = Math.ceil(aHeight / spacing) + 1;
      for (let i = 0; i < aCols; i++){
        for (let j = 0; j < aRows; j++){
          const x = i * spacing, y = j * spacing;
          aNodes.push({ x, y, vx:0, vy:0, baseX:x, baseY:y, radius: Math.random() * 1.3 + 1.2 });
        }
      }
    }

    function resizeAmbient(){
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      aWidth = ambientCanvas.clientWidth;
      aHeight = ambientCanvas.clientHeight;
      if (aWidth === 0 || aHeight === 0) return;
      ambientCanvas.width = aWidth * dpr;
      ambientCanvas.height = aHeight * dpr;
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    if (!isTouch){
      window.addEventListener('mousemove', (e) => {
        const r = ambientCanvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
    }

    function renderAmbient(now){
      if (!isVisible){ rafId = null; return; }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      actx.clearRect(0, 0, aWidth, aHeight);

      const SPRING_K = 16, DAMPING = 0.85;
      for (let k = 0; k < aNodes.length; k++){
        const n = aNodes[k];
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0){
          const power = 1 - dist / mouse.radius;
          const force = power * 900;
          const angle = Math.atan2(dy, dx);
          n.vx -= Math.cos(angle) * force * dt;
          n.vy -= Math.sin(angle) * force * dt;
        }
        n.vx += (n.baseX - n.x) * SPRING_K * dt;
        n.vy += (n.baseY - n.y) * SPRING_K * dt;
        n.vx *= DAMPING; n.vy *= DAMPING;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }

      actx.lineWidth = 1;
      for (let i = 0; i < aCols; i++){
        for (let j = 0; j < aRows; j++){
          const n = aNodes[i * aRows + j];
          if (!n) continue;
          for (let di = -1; di <= 1; di++){
            for (let dj = -1; dj <= 1; dj++){
              if (di === 0 && dj === 0) continue;
              const ni = i + di, nj = j + dj;
              if (ni < i || (ni === i && nj <= j)) continue; // visit each pair once
              if (ni >= aCols || nj < 0 || nj >= aRows) continue;
              const n2 = aNodes[ni * aRows + nj];
              if (!n2) continue;
              const ndx = n.x - n2.x, ndy = n.y - n2.y;
              const distSq = ndx * ndx + ndy * ndy;
              if (distSq < MAX_CONN_DIST_SQ){
                const nDist = Math.sqrt(distSq);
                const alpha = (1 - nDist / MAX_CONN_DIST) * 0.5;
                actx.strokeStyle = `rgba(201,164,99,${alpha})`;
                actx.beginPath();
                actx.moveTo(n.x, n.y);
                actx.lineTo(n2.x, n2.y);
                actx.stroke();
              }
            }
          }
        }
      }

      for (let k = 0; k < aNodes.length; k++){
        const n = aNodes[k];
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const isNear = Math.sqrt(dx * dx + dy * dy) < mouse.radius;
        actx.fillStyle = isNear ? 'rgba(227,195,132,.95)' : 'rgba(201,164,99,.55)';
        const r = isNear ? n.radius * 2 : n.radius;
        actx.beginPath();
        actx.arc(n.x, n.y, Math.max(0.4, r), 0, Math.PI * 2);
        actx.fill();
      }

      rafId = requestAnimationFrame(renderAmbient);
    }

    const ambientVisObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && rafId === null){
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderAmbient);
      }
    }, { threshold: 0 });
    ambientVisObserver.observe(ambientCanvas);

    new ResizeObserver(resizeAmbient).observe(ambientCanvas);
    resizeAmbient();
    rafId = requestAnimationFrame(renderAmbient);
  }

  /* ---------- Three.js hero background ---------- */
  const canvas = $('#heroCanvas');
  if (canvas && window.THREE && !prefersReduced){
    const THREE_ = window.THREE;
    const scene = new THREE_.Scene();
    const camera = new THREE_.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE_.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize(){
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* particle field */
    const particleCount = isTouch ? 260 : 650;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++){
      positions[i*3]   = (Math.random() - 0.5) * 26;
      positions[i*3+1] = (Math.random() - 0.5) * 16;
      positions[i*3+2] = (Math.random() - 0.5) * 14;
    }
    const geo = new THREE_.BufferGeometry();
    geo.setAttribute('position', new THREE_.BufferAttribute(positions, 3));
    const mat = new THREE_.PointsMaterial({
      color: 0xc9a463, size: 0.04, transparent: true, opacity: 0.55,
      blending: THREE_.AdditiveBlending, depthWrite:false
    });
    const points = new THREE_.Points(geo, mat);
    scene.add(points);

    /* wireframe icosahedron centerpiece */
    const icoGeo = new THREE_.IcosahedronGeometry(3.1, 1);
    const icoMat = new THREE_.MeshBasicMaterial({ color: 0xc9a463, wireframe:true, transparent:true, opacity:0.16 });
    const ico = new THREE_.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const icoGeo2 = new THREE_.IcosahedronGeometry(4.4, 1);
    const icoMat2 = new THREE_.MeshBasicMaterial({ color: 0xf2ede2, wireframe:true, transparent:true, opacity:0.045 });
    const ico2 = new THREE_.Mesh(icoGeo2, icoMat2);
    scene.add(ico2);

    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE_.Clock();
    function animate(){
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      ico.rotation.x = t * 0.08;
      ico.rotation.y = t * 0.12;
      ico2.rotation.x = -t * 0.05;
      ico2.rotation.y = -t * 0.07;
      points.rotation.y = t * 0.02;

      camera.position.x += (targetX * 1.4 - camera.position.x) * 0.03;
      camera.position.y += (-targetY * 1.0 - camera.position.y) * 0.03;
      camera.lookAt(0,0,0);

      renderer.render(scene, camera);
    }
    animate();
  }

  /* smooth in-page anchor scrolling accounts for fixed nav */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

});
