// ================================================================
//  AESTHETIC 95 — Background canvas pixel art
//  Só executa quando data-theme="aesthetic95"
// ================================================================

// ================================================================
//  AESTHETIC 95 — BACKGROUND CANVAS PIXEL ART
// ================================================================
(function() {
    let _raf = null;
    let _w = 0, _h = 0;
    let _ts = 0;

    // ── Paleta vaporwave escuro ──────────────────────────────────
    const SKY_BANDS = [
        '#1a0d3d','#1f1050','#2a1060','#321468','#3a1870',
        '#4a1e80','#5a2490','#6a2a9a','#7c32a8','#9040b8',
        '#a84ec0','#be62cc','#d070d0','#e080cc','#ee90cc'
    ];

    // ── Estrelas pixel ✦ ─────────────────────────────────────────
    let stars = [];
    function initStars(w, h) {
        stars = [];
        const count = Math.floor(w * h / 4000);
        for (let i = 0; i < count; i++) {
            const type = Math.random();
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h * 0.72,
                size: type < 0.55 ? 1 : (type < 0.82 ? 2 : 3),
                bright: type > 0.82,
                twinkleSpeed: 0.02 + Math.random() * 0.06,
                twinklePhase: Math.random() * Math.PI * 2,
                color: Math.random() < 0.15 ? '#ffccee' : (Math.random() < 0.2 ? '#cceeff' : '#ffffff')
            });
        }
    }

    function drawStar(ctx, s, ts) {
        const t = Math.abs(Math.sin(ts * s.twinkleSpeed + s.twinklePhase));
        const alpha = s.bright ? (0.55 + t * 0.45) : (0.3 + t * 0.5);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        const x = Math.round(s.x), y = Math.round(s.y);

        if (s.size === 1) {
            ctx.fillRect(x, y, 1, 1);
        } else if (s.size === 2) {
            // ✦ mini pixel cross
            ctx.fillRect(x, y, 2, 2);
        } else {
            // ✦ pixel cross grande
            ctx.fillRect(x + 1, y,     1, 4);
            ctx.fillRect(x,     y + 1, 4, 1);
            // centro brilhante
            ctx.globalAlpha = alpha * 1.3;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 1, y + 1, 2, 2);
        }
        ctx.globalAlpha = 1;
    }

    // ── Nuvens pixel art ─────────────────────────────────────────
    let clouds = [];
    function initClouds(w, h) {
        clouds = [];
        const count = 5 + Math.floor(w / 320);
        for (let i = 0; i < count; i++) {
            clouds.push(spawnCloud(w, h, true));
        }
    }
    function spawnCloud(w, h, randomX) {
        const tier = Math.random();
        // nuvens mais escuras no topo, mais claras/rosa em baixo
        const yFrac = tier < 0.35 ? 0.08 + Math.random() * 0.2
                    : tier < 0.7  ? 0.28 + Math.random() * 0.2
                    :               0.52 + Math.random() * 0.15;
        const colors = yFrac < 0.3
            ? ['#4a3a88','#5a4a9a','#6a5aaa']
            : yFrac < 0.5
            ? ['#8a6ab8','#9a7ac8','#aa88d8']
            : ['#c898d8','#d8a8e8','#e8baf4'];
        const w2 = 60 + Math.floor(Math.random() * 120);
        return {
            x: randomX ? Math.random() * (w + w2) - w2 : w + 10,
            y: Math.floor(yFrac * h),
            w: w2,
            h: Math.floor(w2 * 0.4),
            speed: 0.12 + Math.random() * 0.22,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.55 + Math.random() * 0.3,
            // pixel art: array de blocos 4x4
        };
    }

    function drawCloud(ctx, c) {
        const px = 4; // tamanho do "pixel"
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        // forma de nuvem pixel: elipses sobrepostas em blocos
        const bw = Math.floor(c.w / px);
        const bh = Math.floor(c.h / px);
        for (let bx = 0; bx < bw; bx++) {
            for (let by = 0; by < bh; by++) {
                // função de elipse simples
                const nx = (bx / bw) * 2 - 1;
                const ny = (by / bh) * 2 - 1;
                // duas elipses: base larga + topo
                const inBase = nx*nx*0.8 + ny*ny < 1.05;
                const inTop  = (nx-0.2)*(nx-0.2)*1.5 + (ny+0.6)*(ny+0.6)*1.2 < 1.0;
                const inTop2 = (nx+0.3)*(nx+0.3)*1.8 + (ny+0.7)*(ny+0.7)*1.1 < 0.85;
                if (inBase || inTop || inTop2) {
                    // leve variação de cor por linha
                    if (by < 1) { ctx.fillStyle = lightenColor(c.color, 20); }
                    else        { ctx.fillStyle = c.color; }
                    ctx.fillRect(
                        Math.round(c.x + bx * px),
                        Math.round(c.y + by * px),
                        px, px
                    );
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    function lightenColor(hex, amt) {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.min(255, (n >> 16) + amt);
        const g = Math.min(255, ((n >> 8) & 0xff) + amt);
        const b = Math.min(255, (n & 0xff) + amt);
        return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
    }

    // ── Meteoros / shooting stars ────────────────────────────────
    let meteors = [];
    function spawnMeteor(w, h) {
        return {
            x: Math.random() * w * 0.8,
            y: Math.random() * h * 0.4,
            len: 12 + Math.floor(Math.random() * 20),
            speed: 1.8 + Math.random() * 2.5,
            alpha: 0,
            phase: 'in', // in → hold → out
            holdTimer: 0,
            color: Math.random() < 0.5 ? '#ffffff' : '#ffccee'
        };
    }
    let meteorTimer = 0;
    const METEOR_INTERVAL = 220; // frames entre meteoros

    function updateMeteors(w, h) {
        meteorTimer++;
        if (meteorTimer >= METEOR_INTERVAL && meteors.length < 3) {
            meteors.push(spawnMeteor(w, h));
            meteorTimer = 0;
        }
        meteors = meteors.filter(m => {
            if (m.phase === 'in') {
                m.alpha += 0.08;
                if (m.alpha >= 1) { m.alpha = 1; m.phase = 'hold'; }
            } else if (m.phase === 'hold') {
                m.x += m.speed;
                m.y += m.speed * 0.6;
                m.holdTimer++;
                if (m.holdTimer > 18) m.phase = 'out';
            } else {
                m.x += m.speed;
                m.y += m.speed * 0.6;
                m.alpha -= 0.07;
            }
            return m.alpha > 0;
        });
    }

    function drawMeteors(ctx) {
        meteors.forEach(m => {
            const px = 2;
            const steps = Math.floor(m.len / px);
            for (let i = 0; i < steps; i++) {
                const frac = i / steps;
                ctx.globalAlpha = m.alpha * (1 - frac) * 0.9;
                ctx.fillStyle = m.color;
                ctx.fillRect(
                    Math.round(m.x - i * px * 1.1),
                    Math.round(m.y - i * px * 0.65),
                    px, px
                );
            }
        });
        ctx.globalAlpha = 1;
    }

    // ── Partículas pixel soltas (tipo poeira) ────────────────────
    let dust = [];
    function initDust(w, h) {
        dust = [];
        for (let i = 0; i < 22; i++) dust.push(spawnDust(w, h, true));
    }
    function spawnDust(w, h, randomY) {
        return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : -4,
            vy: 0.15 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * 0.2,
            size: 1,
            color: ['#ff88ee','#cc99ff','#88bbff','#ffaadd'][Math.floor(Math.random()*4)],
            alpha: 0.2 + Math.random() * 0.4,
            twinkleSpeed: 0.03 + Math.random() * 0.05,
            twinklePhase: Math.random() * Math.PI * 2
        };
    }

    // ── Desenho do céu em gradiente de bandas pixel ───────────────
    function drawSky(ctx, w, h) {
        const bandH = Math.ceil(h / SKY_BANDS.length);
        SKY_BANDS.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(0, i * bandH, w, bandH + 1);
        });
    }

    // ── Frame completo ────────────────────────────────────────────
    function drawFrame(ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        drawSky(ctx, w, h);

        // Estrelas
        stars.forEach(s => drawStar(ctx, s, _ts));

        // Meteoros
        updateMeteors(w, h);
        drawMeteors(ctx);

        // Nuvens (movem lentamente para esquerda→direita)
        clouds.forEach((c, i) => {
            c.x += c.speed;
            if (c.x > w + 200) {
                clouds[i] = spawnCloud(w, h, false);
                clouds[i].x = -200;
            }
            drawCloud(ctx, c);
        });

        // Poeira pixel
        dust.forEach((d, i) => {
            const tw = Math.abs(Math.sin(_ts * d.twinkleSpeed + d.twinklePhase));
            ctx.globalAlpha = d.alpha * (0.5 + tw * 0.5);
            ctx.fillStyle = d.color;
            ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
            d.x += d.vx; d.y += d.vy;
            if (d.y > h + 4) dust[i] = spawnDust(w, h, false);
        });
        ctx.globalAlpha = 1;

        _ts += 0.016;
    }

    // ── Engine ────────────────────────────────────────────────────
    function startA95Canvas() {
        const canvas = document.getElementById('a95-pixels');
        if (!canvas) return;
        if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

        const resize = () => {
            _w = window.innerWidth;
            _h = window.innerHeight;
            canvas.width  = _w;
            canvas.height = _h;
            initStars(_w, _h);
            initClouds(_w, _h);
            initDust(_w, _h);
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d');
        function loop() {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme !== 'aesthetic95') { _raf = null; return; }
            drawFrame(ctx, _w, _h);
            _raf = requestAnimationFrame(loop);
        }
        loop();
    }

    function checkAndStart() {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'aesthetic95') {
            if (!_raf) startA95Canvas();
        } else {
            if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
        }
    }

    const _obs = new MutationObserver(checkAndStart);
    _obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndStart);
    } else {
        checkAndStart();
    }
})();
