/* 1. parallax effect and Hologram */
(() => {
    const stage = document.getElementById('escaperportrait');
    if (!stage) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tx = 0, ty = 0;
    let cx = 0, cy = 0;

    addEventListener('pointermove', (e) => {
        tx = (e.clientX / innerWidth - 0.5) * 2;
        ty = (e.clientY / innerHeight - 0.5) * 2;
    });
    document.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

    (function tick() {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        document.documentElement.style.setProperty('--mx', cx.toFixed(4));
        document.documentElement.style.setProperty('--my', cy.toFixed(4));
        requestAnimationFrame(tick);
    })();
})();


/* 2. dream sparkle */
document.querySelectorAll('.dreamsparkle').forEach((g) => {
    const n = +g.dataset.count || 28;
    for (let i = 0; i < n; i++) {
        const s = document.createElement('i');
        s.style.cssText =
            `left:${(Math.random() * 100).toFixed(1)}%;` +
            `top:${(Math.random() * 100).toFixed(1)}%;` +
            `--s:${(0.02 + Math.random() * 0.08).toFixed(3)};` +
            `--d:${(5 + Math.random() * 8).toFixed(2)}s;` +
            `--dl:${(-Math.random() * 6).toFixed(2)}s;` +
            `--o:${(0.4 + Math.random() * 0.6).toFixed(2)}`;
        g.appendChild(s);
    }
});

/* 3. Ly: scroll scene */
(() => {
    const wall = document.getElementById('dreamwall');
    const imgs = [...document.querySelectorAll('.dreamimage:not(.lanimage):not(.yaoimage)')];
    if (!wall) return;

    const clamp = (v) => Math.min(1, Math.max(0, v));
    const ease  = (t) => t * t * (3 - 2 * t);
    const seg   = (p, a, b) => ease(clamp((p - a) / (b - a)));
    const set   = (name, value) => wall.style.setProperty(name, value);

    /* Ly's poem preparation */
    const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TYPE_MS = 70;

    function typewriter(el) {
        const chars = [...el.dataset.text].map((ch) => {
            const s = document.createElement('span');
            s.textContent = ch;
            el.appendChild(s);
            return s;
        });
        let on = false, done = false, timer;

        return {
            length: chars.length,
            get done() { return done; },
            show(next) {
                if (next === on) return;
                on = next;
                clearInterval(timer);
                if (!on) {
                    done = false;
                    chars.forEach((c) => c.classList.remove('on'));
                    return;
                }
                if (reduce) {
                    done = true;
                    chars.forEach((c) => c.classList.add('on'));
                    update();                          //
                    return;
                }
                let i = 0;
                timer = setInterval(() => {
                    if (i >= chars.length) {
                        done = true;
                        clearInterval(timer);
                        update();
                        return;
                    }
                    chars[i++].classList.add('on');
                }, TYPE_MS);
            }
        };
    }

    /* element refs and typewriter instances */
    const poem1El = document.getElementById('lypoem');
    const poem2El = document.getElementById('lypoem--billowing');
    const poem3El = document.getElementById('lypoem--eyes');
    const lp1El = document.getElementById('lanpoem--lone');
    const lp2El = document.getElementById('lanpoem--crimson');
    const lp3El = document.getElementById('lanpoem--tide');
    const yp1El = document.getElementById('yaopoem--bright');
    const yp2El = document.getElementById('yaopoem--dear');
    const yp3El = document.getElementById('yaopoem--east');

    const poem1 = poem1El ? typewriter(poem1El) : null;
    const poem2 = poem2El ? typewriter(poem2El) : null;
    const poem3 = poem3El ? typewriter(poem3El) : null;
    const lp1 = lp1El ? typewriter(lp1El) : null;
    const lp2 = lp2El ? typewriter(lp2El) : null;
    const lp3 = lp3El ? typewriter(lp3El) : null;
    const yp1 = yp1El ? typewriter(yp1El) : null;
    const yp2 = yp2El ? typewriter(yp2El) : null;
    const yp3 = yp3El ? typewriter(yp3El) : null;

    if (poem2) set('--rise-dur', ((poem2.length * TYPE_MS) / 3).toFixed(0) + 'ms');
    if (lp2) set('--lan-rise-dur', ((lp2.length * TYPE_MS) / 3).toFixed(0) + 'ms');
    if (yp2) set('--yao-rise-dur', ((yp2.length * TYPE_MS) / 3).toFixed(0) + 'ms');

    let eyesOpen = false;
    let lanEyesOpen = false;
    let yaoEyesOpen = false;
    let b1 = null, b2 = null, b3 = null;
    let c1 = null, c2 = null, c3 = null;

    /* effect panel */
    // 3.1 Scene 1 finished, 4 new images: peach, lily, strawberry, wings //
    function sceneOneExit(sc) {
        const p = clamp(sc / 1.2);
        set('--p-title', seg(p, 0.00, 0.55).toFixed(4));
        set('--p-words', seg(p, 0.08, 0.68).toFixed(4));
        set('--p-yao',   seg(p, 0.15, 0.80).toFixed(4));
        set('--p-lan',   seg(p, 0.25, 0.92).toFixed(4));

        imgs.forEach((img, i) => {
            const q = clamp((p - 0.25 - i * 0.08) / 0.4);
            img.style.setProperty('--q', ease(q).toFixed(4));
        });
    }

    // 3.2 Zoom in ly's window //
    function lyZoom(sc) {
        set('--z', seg(sc, 1.2, 2.2).toFixed(4));
    }

    // 3.3 glitter showed up //
    function lyGlitter(sc) {
        set('--glit', seg(sc, 1.5, 2.2).toFixed(4));
    }

    // 3.4 ly: changed her expression in 1 frame //
    function lyExpression(sc) {
        set('--blink', sc > 2.0 && !eyesOpen ? 1 : 0);
    }

    /* 3.5 ly's poem chain + pin + mini + eyes */
    let a1 = null, a2 = null, a3 = null;

    function lyStory(sc) {
        // ly poem 1
        const on1 = sc >= 2.2;
        if (poem1) poem1.show(on1);
        if (!on1) a1 = null;
        else if (poem1 && poem1.done && a1 === null) a1 = sc;

        // ly pin: dropped down and turned to straight //
        if (poem1El) poem1El.style.setProperty('--poem-out',
            a1 !== null ? seg(sc, a1, a1 + 0.4).toFixed(4) : 0);
        set('--pin',     a1 !== null ? seg(sc, a1 + 0.2, a1 + 0.9).toFixed(4) : 0);
        set('--pin-rot', a1 !== null ? (45 * (1 - seg(sc, a1 + 0.9, a1 + 1.1))).toFixed(2) : 45);

        // ly poem 2 and ly mini //
        const on2 = a1 !== null && sc >= a1 + 1.4;
        if (poem2) poem2.show(on2);
        wall.classList.toggle('poem2-on', on2);
        if (!on2) a2 = null;
        else if (poem2 && poem2.done && a2 === null) a2 = sc;
        if (poem2El) poem2El.style.setProperty('--poem2-out',
            a2 !== null ? seg(sc, a2 + 0.3, a2 + 0.7).toFixed(4) : 0);

        // ly poem 3 and ly eyes opened //
        const on3 = a2 !== null && sc >= a2 + 0.7;
        if (poem3) poem3.show(on3);
        if (!on3) a3 = null;
        else if (poem3 && poem3.done && a3 === null) a3 = sc;
        eyesOpen = a3 !== null && sc >= a3 + 0.4;
    }

    /* 3.6 lan's scene: transtition */
    function lanSwap(sc) {
        const t = a3;
        if (poem3El) poem3El.style.setProperty('--poem3-out',
            t !== null ? seg(sc, t + 0.8, t + 1.2).toFixed(4) : 0);
            set('--lan', t !== null ? seg(sc, t + 1.2, t + 2.2).toFixed(4) : 0);
        const lanOn  = t !== null && sc >= t + 1.7;
        const toYao  = (typeof yaoStart !== 'undefined' && yaoStart !== null && sc >= yaoStart);
        wall.classList.toggle('is-lan', lanOn && !toYao);
        }

    /* 3.7 lan's poem chain + pin + mini + eyes */
    function lanStory(sc) {
        const start = a3 !== null ? a3 + 2.5 : null;
        // lan poem 1 and pin//
        const on1 = start !== null && sc >= start;
        if (lp1) lp1.show(on1);
        if (!on1) b1 = null;
        else if (lp1 && lp1.done && b1 === null) b1 = sc;

        if (lp1El) lp1El.style.setProperty('--poem-out',
            b1 !== null ? seg(sc, b1, b1 + 0.4).toFixed(4) : 0);
        set('--lpin',     b1 !== null ? seg(sc, b1 + 0.2, b1 + 0.9).toFixed(4) : 0);
        set('--lpin-rot', b1 !== null ? (45 * (1 - seg(sc, b1 + 0.9, b1 + 1.1))).toFixed(2) : 45);

         // lan poem 2 and lan mini //
        const on2 = b1 !== null && sc >= b1 + 1.4;
        if (lp2) lp2.show(on2);
        wall.classList.toggle('lan2-on', on2);
        if (!on2) b2 = null;
        else if (lp2 && lp2.done && b2 === null) b2 = sc;
        if (lp2El) lp2El.style.setProperty('--poem2-out',
            b2 !== null ? seg(sc, b2 + 0.3, b2 + 0.7).toFixed(4) : 0);

        // lan poem 3 and eyes opened
        const on3 = b2 !== null && sc >= b2 + 0.7;
        if (lp3) lp3.show(on3);
        if (!on3) b3 = null;
        else if (lp3 && lp3.done && b3 === null) b3 = sc;
        lanEyesOpen = b3 !== null && sc >= b3 + 0.4;
        
        // Lan closed his eyes from poem 1 to poem 3 //
        set('--lanblink', on1 && !lanEyesOpen ? 1 : 0);
    }

    /* 3.8 Yao scene: transition */
    function yaoSwap(sc) {
        const t = b3;
        if (lp3El) lp3El.style.setProperty('--poem3-out',
            t !== null ? seg(sc, t + 0.8, t + 1.2).toFixed(4) : 0);
            set('--yao', t !== null ? seg(sc, t + 1.2, t + 2.2).toFixed(4) : 0);
            // Yao 1 poem //
            const lanOn = a3 !== null && sc >= a3 + 1.7;
            const yaoOn = t  !== null && sc >= t + 1.7;
            wall.classList.toggle('is-lan', lanOn && !yaoOn);
    }
    /* 3.9 Yao cpoem chain, pin, mini */
    function yaoStory(sc) {
        const start = b3 !== null ? b3 + 2.5 : null;
        
        const on1 = start !== null && sc >= start;
        if (yp1) yp1.show(on1);
        if (!on1) c1 = null;
        else if (yp1 && yp1.done && c1 === null) c1 = sc;
        
        if (yp1El) yp1El.style.setProperty('--poem-out',
            c1 !== null ? seg(sc, c1, c1 + 0.4).toFixed(4) : 0);
        set('--ypin',     c1 !== null ? seg(sc, c1 + 0.2, c1 + 0.9).toFixed(4) : 0);
        set('--ypin-rot', c1 !== null ? (45 * (1 - seg(sc, c1 + 0.9, c1 + 1.1))).toFixed(2) : 45);
        
        const on2 = c1 !== null && sc >= c1 + 1.4;
        if (yp2) yp2.show(on2);
        wall.classList.toggle('yao2-on', on2);
        if (!on2) c2 = null;
        else if (yp2 && yp2.done && c2 === null) c2 = sc;
        if (yp2El) yp2El.style.setProperty('--poem2-out',
            c2 !== null ? seg(sc, c2 + 0.3, c2 + 0.7).toFixed(4) : 0);
            
        const on3 = c2 !== null && sc >= c2 + 0.7;
        if (yp3) yp3.show(on3);
        if (!on3) c3 = null;
        else if (yp3 && yp3.done && c3 === null) c3 = sc;
        yaoEyesOpen = c3 !== null && sc >= c3 + 0.4;
        
        set('--yaoblink', on1 && !yaoEyesOpen ? 1 : 0);
    }

    /* 3.10 Ending */
    function yaoEnding(sc) {
        set('--end', c3 !== null ? seg(sc, c3 + 0.8, c3 + 1.4).toFixed(4) : 0);
        if (yp3El) yp3El.style.setProperty('--poem3-out',
            c3 !== null ? seg(sc, c3 + 0.8, c3 + 1.4).toFixed(4) : 0);
}

    /* setting group */

    let scrollRaf = null;

function update() {
    if (scrollRaf) return;

    scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;

        const sc = scrollY / innerHeight;
        sceneOneExit(sc);
        lyZoom(sc);
        lyGlitter(sc);
        lyStory(sc);
        lanSwap(sc);
        lanStory(sc);
        yaoSwap(sc);
        yaoStory(sc);
        yaoEnding (sc);
        lyExpression(sc);
    });
}
addEventListener('scroll', update, { passive: true });
addEventListener('resize', update);
update();

})();

/* 4. title wave */
(() => {
    const title = document.getElementById('escapertitle');
    if (!title) return;

    const text = title.dataset.text || title.textContent;
    title.textContent = '';
    title.setAttribute('aria-label', text);

    const spans = [...text].map((ch, i) => {
        const s = document.createElement('span');
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.dataset.ch = s.textContent;
        s.style.setProperty('--i', i);
        s.setAttribute('aria-hidden', 'true');
        title.appendChild(s);
        return s;
    });

    function measure() {
        const pad = parseFloat(getComputedStyle(title).fontSize) * 0.5;
        title.style.setProperty('--tw', (title.offsetWidth + pad * 2) + 'px');
        spans.forEach((s) => s.style.setProperty('--ox', (s.offsetLeft + pad) + 'px'));
    }

    measure();
    document.fonts.ready.then(measure);
    addEventListener('resize', measure);
})();

/* 5. background sound and draggable button */
(() => {
    const audio = document.getElementById('dreamaudio');
    const btn   = document.getElementById('audioToggle');
    if (!audio || !btn) {
        console.error('Missing #dreamaudio or #audioToggle');
        return;
    }

    audio.volume = 0.5;

    /* diagnostics */
    console.log('audio src:', audio.querySelector('source')?.src);
    console.log('audio readyState:', audio.readyState);

    audio.addEventListener('loadedmetadata', () => {
        console.log('audio metadata loaded — duration:', audio.duration);
    });
    audio.addEventListener('canplay', () => console.log('audio can play'));
    audio.addEventListener('error', () => {
        console.error('audio error — code:', audio.error?.code, '— message:', audio.error?.message);
        console.error('  Kiem tra file "audio/flowergarden.mp3" co ton tai dung duong dan khong');
        console.error('  Neu dang mo file://, chay local server: python3 -m http.server');
    });

    /* sound toggle */
    function setSound(on) {
        if (on) {
            console.log('play() called');
            const p = audio.play();
            if (p) {
                p.then(() => {
                    console.log('playing');
                    btn.classList.remove('muted');
                }).catch((err) => {
                    console.error('play() rejected:', err.name, '—', err.message);
                    btn.classList.add('muted');
                });
            }
        } else {
            audio.pause();
            btn.classList.add('muted');
            console.log('paused');
        }
    }
    btn.classList.add('muted');

    /* autoplay */
    let autoPlayed = false;
    function maybeAutoPlay(e) {
        if (autoPlayed) return;
        if (btn.contains(e.target)) return;
        audio.play().then(() => {
            autoPlayed = true;
            btn.classList.remove('muted');
            removeEventListener('pointerdown', maybeAutoPlay);
        }).catch((err) => console.warn('auto-play failed:', err.name));
    }
    addEventListener('pointerdown', maybeAutoPlay, { passive: true });

    /* drag and click or flick */
    const THRESHOLD = 5;
    const FRICTION  = 0.95;

    let startX = 0, startY = 0;
    let originLeft = 0, originTop = 0;
    let lastX = 0, lastY = 0, lastT = 0;
    let vx = 0, vy = 0;
    let pointerDown = false;
    let dragging = false;
    let raf = null;

    const clampPos = (x, y) => {
        const w = btn.offsetWidth, h = btn.offsetHeight;
        return [
            Math.max(0, Math.min(window.innerWidth  - w, x)),
            Math.max(0, Math.min(window.innerHeight - h, y)),
        ];
    };

    function moveTo(x, y) {
        const [nx, ny] = clampPos(x, y);
        btn.style.left  = nx + 'px';
        btn.style.top   = ny + 'px';
        btn.style.right = 'auto';
    }

    function stopFlick() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
    }

    function flick() {
        const x = parseFloat(btn.style.left) || btn.getBoundingClientRect().left;
        const y = parseFloat(btn.style.top)  || btn.getBoundingClientRect().top;
        vx *= FRICTION;
        vy *= FRICTION;
        if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) { raf = null; return; }
        moveTo(x + vx, y + vy);
        raf = requestAnimationFrame(flick);
    }

    btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        stopFlick();
        const rect = btn.getBoundingClientRect();
        startX = e.clientX;  startY = e.clientY;
        originLeft = rect.left; originTop = rect.top;
        lastX = e.clientX;   lastY = e.clientY;
        lastT = performance.now();
        vx = vy = 0;
        dragging = false;
        pointerDown = true;
    });

    document.addEventListener('pointermove', (e) => {
        if (!pointerDown) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!dragging) {
            if (Math.hypot(dx, dy) < THRESHOLD) return;
            dragging = true;
            btn.classList.add('dragging');
            btn.style.left  = originLeft + 'px';
            btn.style.top   = originTop  + 'px';
            btn.style.right = 'auto';
            document.body.style.userSelect = 'none';
        }

        e.preventDefault();
        moveTo(originLeft + dx, originTop + dy);

        const now = performance.now();
        const dt  = now - lastT;
        if (dt > 0) {
            vx = (e.clientX - lastX) / dt * 16.67;
            vy = (e.clientY - lastY) / dt * 16.67;
        }
        lastX = e.clientX; lastY = e.clientY; lastT = now;
    });

    document.addEventListener('pointerup', () => {
        if (!pointerDown) return;
        pointerDown = false;
        document.body.style.userSelect = '';

        if (dragging) {
            dragging = false;
            btn.classList.remove('dragging');
            if (performance.now() - lastT > 100) { vx = vy = 0; }
            flick();
        } else {
            setSound(audio.paused);
        }
    });

    document.addEventListener('pointercancel', () => {
        pointerDown = false;
        dragging = false;
        btn.classList.remove('dragging');
        document.body.style.userSelect = '';
        stopFlick();
    });
})();