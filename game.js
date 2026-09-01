/* KINDLED — grounded keeper web slice. TAP pulse / DRAG strafe. */
(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const bootEl = document.getElementById("boot");

  const TAU = Math.PI * 2;
  const SAVE_KEY = "kindled-webhost-v2";
  const FIB = [1, 2, 3, 5, 8, 12, 18, 24, 36];
  const TAP_MS = 180;
  const MOVE_PX = 12;


  const PLAY = {
    "pale-wickmoth": { sheet: "moths", i: 0, hue: 38, r: 14, mag: 1, spawn: 1.15 },
    "ash-vein-underwing": { sheet: "moths", i: 2, hue: 210, r: 13, mag: 0.82, spawn: 0.34, pale: true },
    "velvet-snout": { sheet: "moths", i: 3, hue: 22, r: 12, mag: 0.95, spawn: 0.72 },
    "ember-hawkmoth": { sheet: "moths", i: 1, hue: 12, r: 16, mag: 0.88, spawn: 0.16 },
    "marsh-lampfly": { sheet: "moths", i: 5, hue: 95, r: 9, mag: 1.05, spawn: 0.55, blink: true },
    "dusk-carabid": { sheet: "ground", i: 0, hue: 250, r: 13, mag: 0.7, spawn: 0.58 },
    "hollow-cave-cricket": { sheet: "ground", i: 1, hue: 35, r: 12, mag: 0.65, spawn: 0.3, hop: true },
    "salt-stripe-tiger": { sheet: "ground", i: 2, hue: 45, r: 12, mag: 0.6, spawn: 0.12 },
    "bank-glowworm": { sheet: "ground", i: 3, hue: 95, r: 10, mag: 1.1, spawn: 0.22 },
    "fen-mosquito": { sheet: "pests", i: 0, hue: 200, r: 10, mag: 0.35, spawn: 0.55 },
    "paper-nest-wasp": { sheet: "pests", i: 1, hue: 42, r: 14, mag: 0.45, spawn: 0.28 },
    "gate-orb-weaver": { sheet: "pests", i: 2, hue: 25, r: 16, mag: 0.9, spawn: 0.22 }
  };

  const DEX_RAW = [{"id": "pale-wickmoth", "commonName": "Pale Wickmoth", "latin": "Lucerna pallida", "rarity": "common", "habitat": "aerial", "nectar": 4, "speed": 165, "catchWindow": 2.4, "weakness": "Hold a still beam; they lock on the glass and sit.", "notes": "Treats the chimney like a second moon.", "threat": false}, {"id": "ash-vein-underwing", "commonName": "Ash-vein Underwing", "latin": "Catocala cinerea", "rarity": "uncommon", "habitat": "aerial", "nectar": 9, "speed": 190, "catchWindow": 2.0, "weakness": "Cover the lantern; they stall when the lure dies.", "notes": "Hindwings flash soot-gray, then vanish on bark.", "threat": false}, {"id": "velvet-snout", "commonName": "Velvet Snout", "latin": "Hypena velutina", "rarity": "common", "habitat": "aerial", "nectar": 5, "speed": 175, "catchWindow": 2.2, "weakness": "Smoke from a snuffed wick.", "notes": "Drinks dew off grass; nets easy if you kneel.", "threat": false}, {"id": "ember-hawkmoth", "commonName": "Ember Hawkmoth", "latin": "Sphinx favilla", "rarity": "rare", "habitat": "aerial", "nectar": 18, "speed": 210, "catchWindow": 1.6, "weakness": "Drop the shutter; they overshoot a dying light.", "notes": "Hovers at the lantern lip; wait for the sip.", "threat": false}, {"id": "marsh-lampfly", "commonName": "Marsh Lampfly", "latin": "Photinus palustris", "rarity": "uncommon", "habitat": "aerial", "nectar": 8, "speed": 140, "catchWindow": 2.5, "weakness": "Outshine their flash; your lantern wins the courtship.", "notes": "Males blink a slow two-count over wet ground; the steady green beads are females, leave them.", "threat": false}, {"id": "dusk-carabid", "commonName": "Dusk Carabid", "latin": "Carabus crepuscularis", "rarity": "common", "habitat": "ground", "nectar": 6, "speed": 90, "catchWindow": 2.8, "weakness": "Chimney heat; they bolt from warm soil.", "notes": "Patrols the path after rain; clicks if you pinch too hard.", "threat": false}, {"id": "hollow-cave-cricket", "commonName": "Hollow Cave Cricket", "latin": "Ceuthophilus cavus", "rarity": "uncommon", "habitat": "ground", "nectar": 7, "speed": 160, "catchWindow": 1.8, "weakness": "Sudden full beam; they freeze, then ricochet.", "notes": "Antennae longer than the body; follows the cool of stone.", "threat": false}, {"id": "salt-stripe-tiger", "commonName": "Salt-stripe Tiger", "latin": "Cicindela salina", "rarity": "rare", "habitat": "ground", "nectar": 16, "speed": 260, "catchWindow": 1.2, "weakness": "Sidestep, then pin; they charge the light in a straight line.", "notes": "Too fast to net from the front; wait for the halt.", "threat": false}, {"id": "bank-glowworm", "commonName": "Bank Glowworm", "latin": "Lampyris riparia", "rarity": "rare", "habitat": "cliff", "nectar": 14, "speed": 20, "catchWindow": 3.0, "weakness": "Shade the lantern; your glow steals their lure.", "notes": "Wingless female, a green bead in the grass; not a spark, don't pocket it dry.", "threat": false}, {"id": "fen-mosquito", "commonName": "Fen Mosquito", "latin": "Culex paludis", "rarity": "common", "habitat": "pest", "nectar": 0, "speed": 220, "catchWindow": 1.5, "weakness": "Heat and smoke of the lantern; they peel off the plume.", "notes": "Hunts ears and wrists; one will call ten.", "threat": true}, {"id": "paper-nest-wasp", "commonName": "Paper-nest Wasp", "latin": "Polistes chartacea", "rarity": "uncommon", "habitat": "pest", "nectar": 0, "speed": 240, "catchWindow": 1.4, "weakness": "Smoke and back off; never swing.", "notes": "Paper nest under eaves; a strike makes the whole porch yours to lose.", "threat": true}, {"id": "gate-orb-weaver", "commonName": "Gate Orb-weaver", "latin": "Araneus portarum", "rarity": "common", "habitat": "pest", "nectar": 0, "speed": 40, "catchWindow": 2.6, "weakness": "Pluck a radial thread, lantern behind you.", "notes": "Rebuilds the same gate every dusk; walk through and you'll wear her.", "threat": true}];

  const SPEC = DEX_RAW.map((d) => {
    const p = PLAY[d.id] || { sheet: "moths", i: 0, hue: 40, r: 12, mag: 1, spawn: 0.4 };
    return Object.assign({}, d, p, {
      kind: d.habitat,
      window: d.catchWindow,
      speedMul: d.speed / 400,
      name: d.commonName
    });
  });
  const SPEC_BY = Object.fromEntries(SPEC.map((s) => [s.id, s]));

  const ABILITIES = [
    { id: "wide", name: "Wide Pulse", sub: "Magnet radius +38%", chip: "pulse radius" },
    { id: "step", name: "Quick Step", sub: "Pulse grants i-frames", chip: "invuln window" },
    { id: "veil", name: "Smoke Veil", sub: "Pests ignore you 1.6s", chip: "veil duration" }
  ];

  const DIFFS = {
    watch: { id: "watch", name: "Watch", wick: 4, pest: 0.52, speed: 0.86, win: 0.28, nectar: 1 },
    keep: { id: "keep", name: "Keep", wick: 3, pest: 1, speed: 1, win: 0, nectar: 1 },
    ember: { id: "ember", name: "Ember", wick: 2, pest: 1.48, speed: 1.22, win: -0.18, nectar: 1.15 }
  };

  const LANDS = [
    { id: "canyon", name: "Night Canyon", locked: false, note: "playable ribbon" },
    { id: "marsh", name: "Reed Marsh", locked: true, note: "roost heartwood III" },
    { id: "garden", name: "Cliff Garden", locked: true, note: "roost heartwood V" },
    { id: "ruins", name: "Sky-Ruins", locked: true, note: "roost heartwood VII" }
  ];

  function defaultSave() {
    return {
      nights: 0, nectar: 0, xp: 0, bestCombo: 0,
      difficulty: "keep",
      equipped: { wide: true, step: false, veil: false },
      chips: { wide: 0, step: 0, veil: 0 },
      dex: {}
    };
  }
  let save = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      save = Object.assign(defaultSave(), p);
      save.equipped = Object.assign(defaultSave().equipped, p.equipped || {});
      save.chips = Object.assign(defaultSave().chips, p.chips || {});
      save.dex = p.dex || {};
    }
  } catch (_) {}
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) {}
  }
  function heroLevel() { return 1 + Math.floor((save.xp || 0) / 70); }
  function xpInto() { return (save.xp || 0) % 70; }
  function dexCount(id) { return (save.dex[id] && save.dex[id].n) || 0; }
  function seenDex(id) { return dexCount(id) > 0; }

  const SFX = {
    ac: null, master: null, musicG: null, sfxG: null, music: null, unlocked: false, buf: {},
    ensure() {
      if (this.ac) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.master = this.ac.createGain(); this.master.gain.value = 1;
      this.musicG = this.ac.createGain(); this.musicG.gain.value = 0.38;
      this.sfxG = this.ac.createGain(); this.sfxG.gain.value = 0.72;
      this.musicG.connect(this.master); this.sfxG.connect(this.master);
      this.master.connect(this.ac.destination);
    },
    resume() {
      this.ensure();
      if (!this.ac) return;
      if (this.ac.state === "suspended") this.ac.resume();
      if (!this.unlocked) { this.unlocked = true; this.startMusic(); this.startPad(); }
    },
    now() { return this.ac ? this.ac.currentTime : 0; },
    env(g, a, d, v, t0) {
      g.gain.cancelScheduledValues(t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    },
    osc(type, freq, a, d, v, detune) {
      if (!this.ac) return;
      const t0 = this.now();
      const o = this.ac.createOscillator();
      const g = this.ac.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (detune) o.detune.setValueAtTime(detune, t0);
      this.env(g, a, d, v, t0);
      o.connect(g); g.connect(this.sfxG);
      o.start(t0); o.stop(t0 + a + d + 0.03);
      return o;
    },
    noise(a, d, v, hp, lp) {
      if (!this.ac) return;
      const t0 = this.now();
      const n = this.ac.createBufferSource();
      const len = Math.max(1, Math.floor(this.ac.sampleRate * (a + d + 0.05)));
      const buf = this.ac.createBuffer(1, len, this.ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      n.buffer = buf;
      const g = this.ac.createGain();
      this.env(g, a, d, v, t0);
      let node = n;
      if (hp) { const f = this.ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; node.connect(f); node = f; }
      if (lp) { const f = this.ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; node.connect(f); node = f; }
      node.connect(g); g.connect(this.sfxG);
      n.start(t0); n.stop(t0 + a + d + 0.03);
    },
    playTag(tag) {
      const el = this.buf[tag];
      if (el) { try { const c = el.cloneNode(); c.volume = 0.65; c.play().catch(() => {}); } catch (_) {} }
    },
    pulse() { this.playTag("pulse"); this.noise(0.02, 0.2, 0.32, 180, 1400); this.osc("sine", 90, 0.01, 0.26, 0.4); this.duck(); },
    catch() { this.playTag("catch"); this.osc("sine", 620, 0.005, 0.12, 0.26); this.osc("triangle", 930, 0.008, 0.14, 0.14); },
    combo() { this.playTag("combo"); this.osc("triangle", 659, 0.01, 0.22, 0.2); this.osc("sine", 330, 0.01, 0.28, 0.1); },
    hit() { this.playTag("hit"); this.noise(0.01, 0.28, 0.48, 80, 700); this.osc("sawtooth", 70, 0.008, 0.3, 0.26); },
    land() {
      this.playTag("land");
      [196, 247, 311, 392].forEach((f, i) => {
        if (!this.ac) return;
        const t0 = this.now() + i * 0.07;
        const o = this.ac.createOscillator(); const g = this.ac.createGain();
        o.type = "sine"; o.frequency.value = f; this.env(g, 0.02, 0.65, 0.14, t0);
        o.connect(g); g.connect(this.sfxG); o.start(t0); o.stop(t0 + 0.8);
      });
    },
    pickup() { this.playTag("pickup"); this.osc("sine", 784, 0.01, 0.18, 0.2); this.osc("triangle", 1176, 0.02, 0.22, 0.1); },
    ui() { this.osc("sine", 440, 0.005, 0.08, 0.09); },
    duck() {
      if (!this.musicG || !this.ac) return;
      const t = this.now();
      this.musicG.gain.cancelScheduledValues(t);
      this.musicG.gain.setValueAtTime(this.musicG.gain.value, t);
      this.musicG.gain.linearRampToValueAtTime(0.12, t + 0.05);
      this.musicG.gain.linearRampToValueAtTime(0.38, t + 0.5);
    },
    startMusic() {
      if (this.musicEl) return;
      const el = new Audio("audio/night-score.ogg");
      el.loop = true; el.preload = "auto";
      ["pulse","catch","hit","land","pickup"].forEach((k) => { this.buf[k] = new Audio("audio/sfx-" + k + ".ogg"); });
      try { this.music = this.ac.createMediaElementSource(el); this.music.connect(this.musicG); } catch (_) { el.volume = 0.35; }
      el.play().catch(() => {});
      this.musicEl = el;
    },
    startPad() {
      if (!this.ac || this.pad) return;
      const make = (freq, type, g, detune) => {
        const o = this.ac.createOscillator();
        const gain = this.ac.createGain();
        const lfo = this.ac.createOscillator();
        const lfoG = this.ac.createGain();
        o.type = type; o.frequency.value = freq; if (detune) o.detune.value = detune;
        gain.gain.value = g; lfo.frequency.value = 0.07; lfoG.gain.value = freq * 0.01;
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        o.connect(gain); gain.connect(this.musicG);
        o.start(); lfo.start();
        return { o, gain, lfo };
      };
      this.pad = [make(55, "sine", 0.035, 0), make(82.4, "triangle", 0.018, -4), make(110, "sine", 0.01, 3)];
    }
  };

  function vibe(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} }

  let W = 405, H = 720, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const vw = window.innerWidth, vh = window.innerHeight, aspect = 9 / 16;
    let cssW, cssH;
    if (vw / vh > aspect) { cssH = vh; cssW = vh * aspect; }
    else { cssW = vw; cssH = vw / aspect; }
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 80));
  resize();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function hsl(h, s, l, a) { return a == null ? `hsl(${h},${s}%,${l}%)` : `hsla(${h},${s}%,${l}%,${a})`; }
  function toLocal(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * W, y: ((clientY - rect.top) / rect.height) * H };
  }
  function fibStep(c) { return c <= 0 ? 0 : FIB[Math.min(FIB.length - 1, c - 1)]; }

  function keyImage(img, thresh) {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, c.width, c.height);
    const d = id.data;
    const th = thresh == null ? 22 : thresh;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r < th && g < th && b < th + 16) d[i + 3] = 0;
      else if (b > 42 && b > r * 1.35 && b > g * 1.2 && r < 55 && g < 55) d[i + 3] = 0;
    }
    x.putImageData(id, 0, 0);
    return c;
  }

  const assets = { ready: false };
  function loadImg(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }
  Promise.all([
    loadImg("img/canyon.jpg"), loadImg("img/keeper-sm.png"), loadImg("img/lantern-sm.png"),
    loadImg("img/moths-sm.png"), loadImg("img/pickups-sm.png"), loadImg("img/pests-sm.png"), loadImg("img/ground-sm.png")
  ]).then(([canyon, keeper, lantern, moths, pickups, pests, ground]) => {
    assets.canyon = canyon;
    assets.keeper = keyImage(keeper, 22);
    assets.lantern = keyImage(lantern, 18);
    assets.moths = keyImage(moths, 14);
    assets.pickups = keyImage(pickups, 14);
    assets.pests = keyImage(pests, 14);
    assets.ground = keyImage(ground, 14);
    assets.ready = true;
    if (bootEl) bootEl.remove();
  }).catch(() => { if (bootEl) bootEl.textContent = "art missing"; });

  const parts = [];
  function burst(x, y, n, opt) {
    opt = opt || {};
    for (let i = 0; i < n; i++) {
      const ang = opt.ang != null ? opt.ang + rand(-0.4, 0.4) : rand(0, TAU);
      const sp = (opt.speed || 90) * rand(0.3, 1.15);
      parts.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        life: opt.life || 0.55, max: opt.life || 0.55, r: (opt.size || 2.4) * rand(0.5, 1.4),
        hue: (opt.hue == null ? 40 : opt.hue) + rand(-12, 12),
        sat: opt.sat == null ? 90 : opt.sat, light: opt.light == null ? 62 : opt.light,
        drag: opt.drag == null ? 0.92 : opt.drag, g: opt.g || 0, into: opt.into || null,
        streak: !!opt.streak, ember: !!opt.ember, smoke: !!opt.smoke
      });
    }
  }
  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.into) { p.vx += (p.into.x - p.x) * 6 * dt; p.vy += (p.into.y - p.y) * 6 * dt; }
      p.vx *= Math.pow(p.drag, dt * 60); p.vy *= Math.pow(p.drag, dt * 60);
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
  }
  function drawParts() {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (const p of parts) {
      const a = Math.max(0, p.life / p.max);
      if (p.smoke) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(28,22,32,${a * 0.35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.2 + (1 - a) * 2.2), 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = "lighter"; continue;
      }
      ctx.fillStyle = hsl(p.hue, p.sat, p.light, a);
      if (p.streak) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
        ctx.lineWidth = p.r; ctx.strokeStyle = hsl(p.hue, p.sat, p.light, a * 0.85); ctx.stroke();
      }
      ctx.beginPath();
      if (p.ember) ctx.ellipse(p.x, p.y, p.r * 0.45, p.r * (0.9 + a * 0.8), 0, 0, TAU);
      else ctx.arc(p.x, p.y, p.r * (0.6 + a * 0.6), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  const floats = [];
  function floatText(x, y, text, opt) {
    opt = opt || {};
    floats.push({ x, y, text, life: opt.life || 0.9, max: opt.life || 0.9, hue: opt.hue || 42, size: opt.size || 16, vy: opt.vy == null ? -48 : opt.vy });
  }
  function updateFloats(dt) {
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i]; f.life -= dt; f.y += f.vy * dt; f.vy *= 0.96;
      if (f.life <= 0) floats.splice(i, 1);
    }
  }
  function drawFloats() {
    for (const f of floats) {
      const a = clamp(f.life / f.max, 0, 1);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = hsl(f.hue, 80, 72);
      ctx.font = `600 ${f.size}px Palatino Linotype, Georgia, serif`;
      ctx.textAlign = "center"; ctx.shadowColor = hsl(f.hue, 90, 50, 0.6); ctx.shadowBlur = 12;
      ctx.fillText(f.text, f.x, f.y); ctx.restore();
    }
  }

  const STATE = { TITLE: "title", ROOST: "roost", FLY: "fly", LAND: "land" };
  let state = STATE.TITLE, time = 0, titleT = 0, titlePulse = 0;
  let roostView = "hub", trophyFilter = "all", cardId = null, landT = 0, roostT = 0;
  const hits = [];
  const DIFF = () => DIFFS[save.difficulty] || DIFFS.keep;

  const run = {
    t: 0, dur: 54, nectar: 0, combo: 0, comboT: 0, bestCombo: 0, kindledT: 0,
    catches: 0, wick: 3, wickMax: 3, invuln: 0, crashed: false, shake: 0, hitFlash: 0,
    magnetT: 0, aegisT: 0, veilT: 0, bitten: false
  };
  const keeper = { x: 0.5, y: 0.76, bank: 0, vis: 0, roll: 0, pulseT: 99, pulseCd: 0, facing: 1, bob: 0, glow: 1 };
  const ents = [];
  const pulseRings = [];
  const speedLines = [];
  let spawnAcc = 0, pestAcc = 0, pickAcc = 0, worldZ = 0;
  let comboPop = 0, lastCatchName = "", lastCatchT = 0;
  let teachTap = true, teachHold = true;

  function laneX() { return W * 0.5 + clamp(keeper.vis, -1, 1) * W * 0.34; }
  function keeperPx() { return { x: laneX(), y: H * keeper.y }; }
  function lanternPx() {
    const k = keeperPx();
    return { x: k.x + keeper.facing * 26, y: k.y - 46 };
  }
  function xToBank(px) { return clamp((px - W * 0.5) / (W * 0.34), -1, 1); }
  function equipped(id) { return !!save.equipped[id]; }
  function pulseRadiusPx() {
    let r = 0.155 * Math.min(W, H);
    if (equipped("wide")) r *= 1.38;
    r *= 1 + (save.chips.wide || 0) * 0.018;
    if (run.kindledT > 0) r *= 1.16;
    return r;
  }
  function pulseCdMax() { return 0.52; }
  function scrollSpeed() { return 210 * DIFF().speed; }

  function resetRun() {
    const d = DIFF();
    run.t = 0; run.dur = rand(48, 62); run.nectar = 0; run.combo = 0; run.comboT = 0;
    run.bestCombo = 0; run.kindledT = 0; run.catches = 0;
    run.wickMax = d.wick; run.wick = d.wick; run.invuln = 0.45; run.crashed = false;
    run.shake = 0; run.hitFlash = 0; run.magnetT = 0; run.aegisT = 0; run.veilT = 0; run.bitten = false;
    ents.length = 0; pulseRings.length = 0; speedLines.length = 0;
    keeper.bank = 0; keeper.vis = 0; keeper.roll = 0; keeper.facing = 1;
    keeper.pulseT = 99; keeper.pulseCd = 0; keeper.glow = 1;
    spawnAcc = 0.12; pestAcc = 2.4; pickAcc = 7; worldZ = 0; comboPop = 0;
    lastCatchName = ""; lastCatchT = 0;
    teachTap = save.nights < 2; teachHold = save.nights < 2;
    const lp = lanternPx();
    spawnSpec(SPEC_BY["pale-wickmoth"], lp.x + rand(-28, 28), H * 0.42);
    spawnSpec(SPEC_BY["marsh-lampfly"], lp.x + 48, H * 0.32);
    spawnSpec(SPEC_BY["dusk-carabid"], W * 0.55, H * 0.18);
    spawnSpec(SPEC_BY["fen-mosquito"], W * 0.38, H * 0.08);
  }

  function spawnSpec(def, x, y, delay) {
    const e = {
      def, id: def.id, kind: def.kind, x, y,
      vx: rand(-18, 18), vy: scrollSpeed() * (0.55 + (def.speedMul || 0.4)) * rand(0.85, 1.12),
      age: -(delay || 0), life: def.window + DIFF().win, phase: rand(0, TAU),
      magnet: false, magSp: 0, alive: true, hopT: 0, dodgeT: 0,
      gap: 0, gapW: 0, side: x < W * 0.5 ? -1 : 1, burned: false
    };
    if (def.id === "gate-orb-weaver") { e.gap = rand(W * 0.22, W * 0.78); e.gapW = rand(54, 82); e.y = -20; }
    if (def.kind === "cliff") { e.x = e.side < 0 ? W * 0.1 : W * 0.9; e.vy = scrollSpeed() * 0.22; }
    ents.push(e);
    return e;
  }

  function spawnWeighted(kindPool, x, y) {
    const t = clamp(run.t / run.dur, 0, 1);
    const pool = kindPool.map((d) => {
      let w = d.spawn;
      if (d.id === "pale-wickmoth") w *= lerp(1.4, 0.5, t);
      if (d.id === "salt-stripe-tiger") w *= t < 0.22 ? 0.2 : 1;
      if (d.id === "ember-hawkmoth") w *= t < 0.12 ? 0.3 : 1;
      if (d.kind === "pest") w *= DIFF().pest;
      return { d, w };
    });
    let sum = 0; for (const p of pool) sum += p.w;
    let r = Math.random() * sum, def = pool[0].d;
    for (const p of pool) { r -= p.w; if (r <= 0) { def = p.d; break; } }
    if (def.trio) {
      spawnSpec(def, x, y, 0);
      spawnSpec(def, x - 26, y - 20, 0.05);
      spawnSpec(def, x + 26, y - 16, 0.1);
    } else spawnSpec(def, x, y, 0);
  }

  function doPulse() {
    if (keeper.pulseCd > 0) return;
    keeper.pulseCd = pulseCdMax();
    keeper.pulseT = 0; keeper.glow = 1.9;
    const lp = lanternPx(), R = pulseRadiusPx();
    pulseRings.push({ x: lp.x, y: lp.y, r: 8, max: R * 1.12, life: 0.34, a: 1 });
    SFX.pulse(); vibe(14);
    burst(lp.x, lp.y, 20, { hue: 38, speed: 150, life: 0.36, size: 2.2, streak: true, ember: true });
    if (equipped("step")) run.invuln = Math.max(run.invuln, 0.55 + (save.chips.step || 0) * 0.04);
    if (equipped("veil")) run.veilT = Math.max(run.veilT, 1.6 + (save.chips.veil || 0) * 0.12);
    for (const e of ents) {
      if (!e.alive || e.age < 0 || e.pickup) continue;
      const dist = Math.hypot(e.x - lp.x, e.y - lp.y);
      if (e.kind === "aerial" || e.kind === "cliff") {
        if (dist < R * (e.def.mag || 1) + e.def.r) { e.magnet = true; e.magSp = 230 + (R - dist) * 2; }
      } else if (e.kind === "ground") {
        const kp = keeperPx();
        if (Math.abs(e.x - kp.x) < 50 && Math.abs(e.y - kp.y) < 54) catchEnt(e);
        else if (dist < R * 0.72) { e.magnet = true; e.magSp = 180; }
      } else if (e.def.id === "fen-mosquito") {
        if (dist < R * 0.7) { e.vx += (e.x - lp.x) * 6; e.vy *= 0.35; e.y -= 16; }
      } else if (e.def.id === "paper-nest-wasp") {
        if (dist < R * 1.05) { e.dodgeT = 0.35; e.vx = (e.x < lp.x ? -1 : 1) * 280; }
      } else if (e.def.id === "gate-orb-weaver") {
        if (Math.abs(e.y - lp.y) < 30 || dist < R) burnThread(e);
      }
    }
  }

  function burnThread(e) {
    if (!e.alive) return;
    e.alive = false; e.burned = true;
    logDex(e.def.id);
    burst(e.x, e.y, 16, { hue: 38, speed: 110, life: 0.4, size: 2, streak: true, ember: true });
    floatText(e.gap || e.x, e.y - 8, "strand burns", { hue: 38, size: 12, life: 0.6 });
    run.nectar += 3;
  }

  function catchEnt(e) {
    if (!e.alive) return;
    e.alive = false;
    const fading = e.age > e.life;
    const lp = lanternPx();
    run.combo = (run.comboT > 0 && run.combo > 0) ? run.combo + 1 : 1;
    run.comboT = 1.15; run.bestCombo = Math.max(run.bestCombo, run.combo);
    comboPop = 1;
    if (run.combo >= 8) run.kindledT = 3;
    let n = e.def.nectar;
    if (fading) n = Math.max(1, Math.round(n * 0.5));
    n += Math.min(12, fibStep(run.combo));
    n = Math.round(n * DIFF().nectar);
    run.nectar += n; run.catches++;
    logDex(e.def.id);
    keeper.glow = Math.min(3, keeper.glow + 0.4);
    lastCatchName = e.def.commonName; lastCatchT = 1.2;
    SFX.catch();
    if (run.combo >= 2) SFX.combo();
    vibe(run.combo >= 5 ? [6, 20, 10] : 10);
    burst(e.x, e.y, 16, { hue: e.def.hue, speed: 160, life: 0.45, size: 2.5, streak: true, ember: true });
    floatText(lp.x + rand(-16, 16), lp.y - 40, `+${n}`, { hue: e.def.hue, size: 14 + Math.min(8, run.combo) });
  }

  function logDex(id) {
    if (!save.dex[id]) save.dex[id] = { n: 0 };
    save.dex[id].n++;
  }

  function hitKeeper(e, label) {
    if (run.invuln > 0 || run.aegisT > 0 || run.veilT > 0) return;
    if (e) e.alive = false;
    run.wick = Math.max(0, run.wick - 1);
    run.invuln = 0.9; run.shake = 1; run.hitFlash = 1;
    if (label === "bite") run.bitten = true;
    run.combo = 0; run.comboT = 0;
    SFX.hit(); vibe([18, 30, 40]);
    const kp = keeperPx();
    burst(kp.x, kp.y, 18, { hue: 8, speed: 150, life: 0.45, size: 2.4, sat: 40 });
    floatText(kp.x, kp.y - 36, label || "wick", { hue: 12, size: 14, life: 0.7 });
    if (e && e.def && e.def.threat) logDex(e.def.id);
    if (run.wick <= 0) { run.crashed = true; beginLand(); }
  }

  function grabPickup(e) {
    e.alive = false;
    SFX.pickup(); vibe(10);
    const kp = keeperPx();
    if (e.pid === "wick") {
      run.wick = Math.min(run.wickMax, run.wick + 1);
      floatText(kp.x, kp.y - 40, "wickheart", { hue: 110, size: 14 });
    } else if (e.pid === "magnet") {
      run.magnetT = 4;
      floatText(kp.x, kp.y - 40, "magnet 4s", { hue: 200, size: 14 });
    } else {
      run.aegisT = 5;
      floatText(kp.x, kp.y - 40, "aegis 5s", { hue: 210, size: 14 });
    }
    burst(e.x, e.y, 14, { hue: e.pid === "wick" ? 110 : e.pid === "magnet" ? 200 : 0, speed: 90, life: 0.4, size: 2.2, ember: true });
  }

  function spawnPickup() {
    const kinds = ["wick", "magnet", "aegis"];
    const pid = kinds[(Math.random() * 3) | 0];
    ents.push({ pickup: true, pid, x: W * 0.5 + rand(-W * 0.3, W * 0.3), y: -20, vy: scrollSpeed() * 0.7, alive: true, age: 0, kind: "pickup", phase: 0 });
  }

  const input = { pointers: new Map(), keys: Object.create(null) };

  function onPointerDown(e) {
    e.preventDefault(); SFX.resume();
    const loc = toLocal(e.clientX, e.clientY);
    input.pointers.set(e.pointerId, {
      t: performance.now(), x: loc.x, y: loc.y, startX: loc.x, startY: loc.y,
      maxMove: 0, dragging: false, lastX: loc.x, lastT: performance.now(), vx: 0
    });
    if (state === STATE.TITLE) { openRoost(); return; }
    if (state === STATE.ROOST) { handleUi(loc, true); return; }
  }
  function onPointerMove(e) {
    const p = input.pointers.get(e.pointerId);
    const loc = toLocal(e.clientX, e.clientY);
    if (p) {
      const now = performance.now();
      const dtm = Math.max(1, now - p.lastT) / 1000;
      p.vx = (loc.x - p.lastX) / dtm;
      p.lastX = loc.x; p.lastT = now; p.x = loc.x; p.y = loc.y;
      const move = Math.hypot(loc.x - p.startX, loc.y - p.startY);
      p.maxMove = Math.max(p.maxMove, move);
      if (Math.abs(loc.x - p.startX) > MOVE_PX || move > MOVE_PX * 1.25) p.dragging = true;
    }
  }
  function onPointerUp(e) {
    e.preventDefault();
    const p = input.pointers.get(e.pointerId);
    const heldMs = p ? performance.now() - p.t : 999;
    const wasTap = p && heldMs < TAP_MS && p.maxMove < MOVE_PX && !p.dragging;
    input.pointers.delete(e.pointerId);
    if (state === STATE.FLY && wasTap) doPulse();
    if (state === STATE.LAND && landT > 0.7) openRoost(true);
  }

  canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  window.addEventListener("keydown", (e) => {
    SFX.resume(); input.keys[e.code] = true;
    if (e.code === "Space") {
      e.preventDefault();
      if (state === STATE.TITLE) openRoost();
      else if (state === STATE.FLY) doPulse();
      else if (state === STATE.ROOST && roostView === "hub") startFlight();
    }
    if (e.code === "Enter" && state === STATE.ROOST && roostView === "hub") startFlight();
    if (e.code === "Escape" && state === STATE.ROOST) { roostView = "hub"; cardId = null; }
  });
  window.addEventListener("keyup", (e) => { input.keys[e.code] = false; });

  function hitAt(x, y) {
    for (let i = hits.length - 1; i >= 0; i--) {
      const b = hits[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  }
  function handleUi(loc, click) {
    if (!click) return;
    const h = hitAt(loc.x, loc.y);
    if (!h) return;
    SFX.ui(); vibe(8);
    if (h.id === "play") startFlight();
    else if (h.id === "map") roostView = "map";
    else if (h.id === "trophy") { roostView = "trophy"; trophyFilter = "all"; }
    else if (h.id === "back") { roostView = "hub"; cardId = null; }
    else if (h.id.indexOf("diff:") === 0) { save.difficulty = h.id.slice(5); persist(); }
    else if (h.id.indexOf("ab:") === 0) { const a = h.id.slice(3); save.equipped[a] = !save.equipped[a]; persist(); }
    else if (h.id.indexOf("filt:") === 0) trophyFilter = h.id.slice(5);
    else if (h.id.indexOf("card:") === 0) { cardId = h.id.slice(5); roostView = "card"; }
    else if (h.id === "locked") floatText(W / 2, H * 0.42, "locked", { hue: 30, size: 16, life: 0.7 });
  }

  function openRoost(fromLand) {
    state = STATE.ROOST; roostView = "hub"; roostT = fromLand ? 0 : 0.35; cardId = null;
  }
  function startFlight() {
    state = STATE.FLY; resetRun(); SFX.resume(); SFX.ui();
  }
  function beginLand() {
    if (state === STATE.LAND || state === STATE.ROOST) return;
    state = STATE.LAND; landT = 0;
    save.nights++; save.nectar += run.nectar;
    save.xp += Math.max(8, run.nectar + run.catches * 2);
    save.bestCombo = Math.max(save.bestCombo || 0, run.bestCombo);
    ["wide", "step", "veil"].forEach((a) => { if (save.equipped[a]) save.chips[a] = Math.min(12, (save.chips[a] || 0) + 1); });
    persist();
    SFX.land(); vibe(run.crashed ? [30, 40, 50] : [20, 40, 20]);
  }

  function steering(dt) {
    let dragging = false, followX = laneX();
    for (const p of input.pointers.values()) {
      if (p.dragging || p.maxMove > MOVE_PX || performance.now() - p.t > TAP_MS) {
        dragging = true; followX = p.x; p.dragging = true;
      }
    }
    const keyL = !!input.keys.KeyA || !!input.keys.ArrowLeft;
    const keyR = !!input.keys.KeyD || !!input.keys.ArrowRight;
    if (dragging) keeper.bank = lerp(keeper.bank, xToBank(followX), 1 - Math.pow(0.00008, dt));
    else if (keyL !== keyR) keeper.bank = lerp(keeper.bank, keyL ? -1 : 1, 1 - Math.pow(0.012, dt));
    else keeper.bank *= Math.pow(0.18, dt);
    keeper.bank = clamp(keeper.bank, -1, 1);
    keeper.vis = lerp(keeper.vis, keeper.bank, 1 - Math.pow(0.0009, dt));
    if (Math.abs(keeper.bank) > 0.08) keeper.facing = keeper.bank < 0 ? -1 : 1;
    keeper.roll = lerp(keeper.roll, keeper.vis * 0.12, 1 - Math.pow(0.05, dt));
    keeper.bob += dt * (8 + Math.abs(keeper.bank) * 4);
  }

  function updateTitle(dt) {
    titleT += dt; titlePulse += dt; worldZ += dt * 2.2;
    keeper.vis = Math.sin(titleT * 0.6) * 0.12;
    keeper.glow = 1.1 + Math.sin(titleT * 2.1) * 0.12;
    const lp = lanternPx();
    if (Math.random() < dt * 1.4) burst(lp.x, lp.y, 1, { hue: 38, speed: 16, life: 1.2, size: 1.6, g: -30, drag: 0.98, ember: true });
  }

  function updateFly(dt) {
    run.t += dt; worldZ += dt * 11 * DIFF().speed;
    run.invuln = Math.max(0, run.invuln - dt);
    run.shake = Math.max(0, run.shake - dt * 3.2);
    run.hitFlash = Math.max(0, run.hitFlash - dt * 2.4);
    run.magnetT = Math.max(0, run.magnetT - dt);
    run.aegisT = Math.max(0, run.aegisT - dt);
    run.veilT = Math.max(0, run.veilT - dt);
    run.kindledT = Math.max(0, run.kindledT - dt);
    steering(dt);
    keeper.pulseT += dt; keeper.pulseCd = Math.max(0, keeper.pulseCd - dt);
    keeper.glow = lerp(keeper.glow, 0.55 + run.wick * 0.16, 1 - Math.pow(0.08, dt));
    run.comboT = Math.max(0, run.comboT - dt);
    if (run.comboT <= 0) run.combo = 0;
    comboPop = Math.max(0, comboPop - dt * 2.2);
    lastCatchT = Math.max(0, lastCatchT - dt);

    const kp = keeperPx(), lp = lanternPx();
    if (Math.random() < dt * 10) burst(kp.x + rand(-8, 8), kp.y + 18, 1, { hue: 32, speed: 10, life: 0.5, size: 1.4, g: 30, drag: 0.95, ember: true });

    const heat = clamp(run.t / run.dur, 0, 1);
    spawnAcc += dt * lerp(1.05, 1.9, heat);
    const interval = lerp(0.68, 0.36, heat);
    const aerials = SPEC.filter((s) => s.kind === "aerial");
    const grounds = SPEC.filter((s) => s.kind === "ground" || s.kind === "cliff");
    const pests = SPEC.filter((s) => s.kind === "pest");
    while (spawnAcc >= interval) {
      spawnAcc -= interval;
      const x = W * 0.5 + rand(-W * 0.32, W * 0.32);
      if (Math.random() < 0.6) spawnWeighted(aerials, x, rand(-40, H * 0.06));
      else spawnWeighted(grounds, x, -30);
    }
    if (run.t > 5) {
      pestAcc += dt * lerp(0.4, 1.6, heat) * DIFF().pest;
      const pInt = lerp(2.2, 0.9, heat) / Math.max(0.35, DIFF().pest);
      while (pestAcc >= pInt) {
        pestAcc -= pInt;
        spawnWeighted(pests, W * 0.5 + rand(-W * 0.3, W * 0.3), -24);
      }
    }
    pickAcc += dt;
    if (pickAcc > 9.5) { pickAcc = 0; spawnPickup(); }

    for (let i = ents.length - 1; i >= 0; i--) {
      const e = ents[i];
      if (!e.alive) { ents.splice(i, 1); continue; }
      e.age += dt; e.phase += dt * 5;
      if (e.pickup) {
        e.y += e.vy * dt; e.x += Math.sin(e.phase) * 12 * dt;
        if (Math.hypot(e.x - kp.x, e.y - kp.y) < 42) grabPickup(e);
        if (e.y > H + 40) e.alive = false;
        continue;
      }
      if (e.age < 0) continue;
      if (e.def.id === "gate-orb-weaver") {
        e.y += scrollSpeed() * 0.55 * dt;
        const onLine = Math.abs(e.y - kp.y) < 16;
        const inGap = Math.abs(kp.x - e.gap) < e.gapW * 0.5;
        if (onLine && !inGap) hitKeeper(e, "web");
        if (e.y > H + 40) e.alive = false;
        continue;
      }
      if (e.magnet || (run.magnetT > 0 && (e.kind === "aerial" || e.kind === "cliff"))) {
        const dx = lp.x - e.x, dy = lp.y - e.y, dist = Math.hypot(dx, dy) || 1;
        e.magSp = (e.magSp || 180) + 900 * dt;
        e.vx = (dx / dist) * e.magSp; e.vy = (dy / dist) * e.magSp;
        e.x += e.vx * dt; e.y += e.vy * dt;
        if (dist < 18) catchEnt(e);
        continue;
      }
      if (e.kind === "aerial" || e.kind === "cliff") {
        const wx = Math.sin(e.phase * (e.def.blink ? 2.2 : 1.2)) * 26 * ((e.def.speedMul || 0.4) + 0.4);
        e.x += wx * dt * 3;
        e.y += e.vy * dt * 0.55;
        if (e.kind === "cliff") e.x = lerp(e.x, e.side < 0 ? W * 0.11 : W * 0.89, 0.08);
        if (e.age >= e.life + 0.7 || e.y > H + 50) e.alive = false;
      } else if (e.kind === "ground") {
        if (e.def.hop) {
          e.hopT += dt;
          e.y += e.vy * dt * 0.42;
          e.x += Math.sin(e.hopT * 3) * 55 * dt;
          e.y -= Math.abs(Math.sin(e.hopT * 6)) * 90 * dt;
        } else {
          e.y += e.vy * dt * 0.5;
          e.x += Math.sin(e.phase) * 18 * dt;
        }
        const over = Math.abs(e.x - kp.x) < 38 && Math.abs(e.y - kp.y) < 36;
        if (over && (keeper.pulseT < 0.28 || Math.abs(e.x - kp.x) < 22)) catchEnt(e);
        if (e.y > H + 40 || e.age > e.life + 1.2) e.alive = false;
      } else if (e.def.id === "fen-mosquito") {
        e.vx += (kp.x - e.x) * 1.65 * dt;
        e.vy += (kp.y - 22 - e.y) * 0.85 * dt;
        e.vx *= 0.96;
        e.x += e.vx * dt + Math.sin(e.phase * 3) * 40 * dt;
        e.y += (scrollSpeed() * 0.35 + e.vy * 0.15) * dt;
        if (Math.hypot(e.x - kp.x, e.y - (kp.y - 24)) < 26) hitKeeper(e, "bite");
        if (e.y > H + 40) e.alive = false;
      } else if (e.def.id === "paper-nest-wasp") {
        if (e.dodgeT > 0) e.dodgeT -= dt;
        e.x += (e.vx + Math.sin(e.phase * 2) * 90) * dt;
        e.y += scrollSpeed() * 0.48 * dt;
        e.vx *= 0.9;
        if (Math.hypot(e.x - kp.x, e.y - kp.y) < 28) hitKeeper(e, "sting");
        if (e.y > H + 40 || e.x < -40 || e.x > W + 40) e.alive = false;
      }
    }

    if (run.combo >= 5 && Math.random() < dt * 18) {
      speedLines.push({ x: rand(0, W), y: rand(0, H * 0.6), len: rand(16, 40), a: 0.3, v: 380 });
    }
    for (let i = speedLines.length - 1; i >= 0; i--) {
      const s = speedLines[i]; s.y += s.v * dt; s.a -= dt * 0.8;
      if (s.a <= 0 || s.y > H) speedLines.splice(i, 1);
    }
    if (run.t >= run.dur && !run.crashed) beginLand();
  }

  function updateLand(dt) {
    landT += dt;
    keeper.bank = lerp(keeper.bank, 0, dt * 3);
    keeper.vis = lerp(keeper.vis, 0, dt * 3);
    worldZ += dt * 4;
    if (landT > 1.5) openRoost(true);
  }
  function updateRoost(dt) {
    roostT += dt; worldZ += dt * 1.4;
    keeper.vis = Math.sin(roostT * 0.5) * 0.08;
    keeper.glow = 1.15 + Math.sin(roostT * 2) * 0.1;
    if (Math.random() < dt * 1.6) burst(W * 0.5 + rand(-30, 30), H * 0.38, 1, { hue: 38, speed: 12, life: 1.3, size: 1.6, g: -18, drag: 0.98, ember: true });
  }

  function drawCanyon() {
    const img = assets.canyon;
    if (img) {
      const scale = Math.max(W / img.width, H / img.height) * 1.18;
      const dw = img.width * scale, dh = img.height * scale;
      const ox = (W - dw) / 2;
      const off = ((worldZ * 26) % dh + dh) % dh;
      ctx.drawImage(img, ox, -off, dw, dh);
      ctx.drawImage(img, ox, dh - off, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#060414"); g.addColorStop(1, "#0a0816");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = "rgba(4,3,12,0.22)"; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const yt = i / 24, y = yt * H;
      const n = Math.sin(yt * 6 + worldZ * 0.15) * W * 0.04;
      if (i) ctx.lineTo(W * 0.5 + n, y); else ctx.moveTo(W * 0.5 + n, y);
    }
    ctx.strokeStyle = "rgba(255,186,90,0.14)"; ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.stroke();
    ctx.strokeStyle = "rgba(255,230,170,0.18)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    const vg = ctx.createLinearGradient(0, H * 0.55, 0, H);
    vg.addColorStop(0, "rgba(8,6,16,0)"); vg.addColorStop(1, "rgba(6,4,12,0.55)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  function sheetCell(img, cols, rows, index) {
    if (!img) return null;
    const cw = img.width / cols, ch = img.height / rows;
    const c = index % cols, r = (index / cols) | 0;
    return { img, sx: c * cw, sy: r * ch, cw, ch };
  }

  function drawSheet(cell, x, y, w, h) {
    if (!cell) return false;
    ctx.drawImage(cell.img, cell.sx, cell.sy, cell.cw, cell.ch, x, y, w, h);
    return true;
  }

  function drawEnt(e) {
    if (e.age < 0 || !e.alive) return;
    if (e.pickup) { drawPickup(e); return; }
    if (e.def.id === "gate-orb-weaver") {
      ctx.save();
      ctx.strokeStyle = "rgba(220,200,170,0.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, e.y); ctx.lineTo(e.gap - e.gapW * 0.5, e.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.gap + e.gapW * 0.5, e.y); ctx.lineTo(W, e.y); ctx.stroke();
      const cell = sheetCell(assets.pests, 3, 1, 2);
      const sx = 22;
      drawSheet(cell, e.gap - e.gapW * 0.5 - sx, e.y - sx, sx * 2, sx * 2);
      ctx.restore();
      return;
    }
    const fade = e.age > e.life ? 1 - (e.age - e.life) / 0.7 : 1;
    ctx.save(); ctx.translate(e.x, e.y); ctx.globalAlpha = clamp(fade, 0, 1);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, e.def.r * 3.2);
    const blinkOff = e.def.blink && Math.sin(e.phase * 6) < 0;
    glow.addColorStop(0, hsl(e.def.hue, 80, 62, blinkOff ? 0.08 : 0.45));
    glow.addColorStop(1, hsl(e.def.hue, 80, 50, 0));
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, e.def.r * 3.2, 0, TAU); ctx.fill();
    ctx.restore();

    const s = e.def.r * 3.2;
    let drawn = false;
    if (e.def.sheet === "moths") {
      const f = e.def.i + (((e.phase * 1.4) | 0) % 2 === 0 ? 0 : 0);
      drawn = drawSheet(sheetCell(assets.moths, 3, 3, f), -s, -s * 0.7, s * 2, s * 1.4);
    } else if (e.def.sheet === "ground") {
      drawn = drawSheet(sheetCell(assets.ground, 2, 2, e.def.i), -s * 1.05, -s * 0.7, s * 2.1, s * 1.4);
    } else if (e.def.sheet === "pests") {
      drawn = drawSheet(sheetCell(assets.pests, 3, 1, e.def.i), -s * 1.1, -s * 0.75, s * 2.2, s * 1.5);
    }
    if (!drawn) {
      ctx.fillStyle = hsl(e.def.hue, 80, 60, 0.85);
      ctx.beginPath(); ctx.ellipse(0, 0, e.def.r * 1.3, e.def.r * 0.7, Math.sin(e.phase) * 0.3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawPickup(e) {
    const img = assets.pickups;
    ctx.save(); ctx.translate(e.x, e.y);
    ctx.translate(0, Math.sin(time * 4 + e.x) * 3);
    if (img) {
      const cw = img.width / 3, ch = img.height;
      const idx = e.pid === "wick" ? 0 : e.pid === "magnet" ? 1 : 2;
      ctx.drawImage(img, idx * cw, 0, cw, ch, -22, -22, 44, 44);
    } else {
      ctx.fillStyle = e.pid === "wick" ? "#8dff6a" : e.pid === "magnet" ? "#6ad0ff" : "#e8f0ff";
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawKeeper() {
    const kp = keeperPx();
    const lp = lanternPx();
    ctx.save();
    ctx.translate(kp.x, kp.y);
    ctx.rotate(keeper.roll);
    const bob = Math.sin(keeper.bob) * 2.2;
    ctx.translate(0, bob);
    if (run.invuln > 0 && ((time * 18) | 0) % 2 === 0) ctx.globalAlpha = 0.5;
    if (run.aegisT > 0) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(200,220,255,${0.45 + 0.2 * Math.sin(time * 8)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -28, 48, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    if (run.veilT > 0) {
      ctx.fillStyle = "rgba(40,36,48,0.28)";
      ctx.beginPath(); ctx.ellipse(0, -10, 40, 50, 0, 0, TAU); ctx.fill();
    }
    const img = assets.keeper;
    const h = 118, w = h * (img ? img.width / img.height : 0.7);
    ctx.save();
    ctx.scale(keeper.facing, 1);
    if (img) ctx.drawImage(img, -w * 0.48, -h + 18, w, h);
    else {
      ctx.fillStyle = "#3a4a38"; ctx.fillRect(-16, -50, 32, 60);
      ctx.fillStyle = "#c9a070"; ctx.beginPath(); ctx.arc(0, -60, 12, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(0, 16, 22, 6, 0, 0, TAU); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(lp.x, lp.y);
    const flick = 0.9 + 0.1 * Math.sin(time * 14);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const gR = 54 * keeper.glow * flick;
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, gR);
    g.addColorStop(0, `rgba(255,236,180,${0.55 * keeper.glow})`);
    g.addColorStop(0.35, `rgba(255,180,80,${0.22 * keeper.glow})`);
    g.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, gR, 0, TAU); ctx.fill();
    ctx.restore();
    const lan = assets.lantern;
    if (lan) ctx.drawImage(lan, -16, -22, 32, 32 * (lan.height / lan.width));
    ctx.restore();
  }

  function drawPulseRings() {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = pulseRings.length - 1; i >= 0; i--) {
      const r = pulseRings[i];
      r.life -= 1 / 60;
      const t = 1 - r.life / 0.34;
      r.r = lerp(8, r.max, easeOut(clamp(t, 0, 1))); r.a = 1 - t;
      ctx.strokeStyle = `rgba(255,200,110,${Math.max(0, r.a) * 0.55})`; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
      if (r.life <= 0) pulseRings.splice(i, 1);
    }
    ctx.restore();
  }

  function drawHUD() {
    if (state !== STATE.FLY && state !== STATE.LAND) return;
    const pad = Math.max(14, W * 0.04), top = Math.max(22, H * 0.038);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.75)"; ctx.shadowBlur = 10;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,236,210,0.5)";
    ctx.font = `600 ${Math.round(Math.max(11, W * 0.03))}px Palatino Linotype, Georgia, serif`;
    ctx.fillText("NECTAR", pad, top);
    ctx.fillStyle = "#f4ead8";
    ctx.font = `700 ${Math.round(Math.max(20, W * 0.052))}px Palatino Linotype, Georgia, serif`;
    ctx.fillText(String(run.nectar), pad, top + 22);
    ctx.textAlign = "right";
    const remain = Math.max(0, run.dur - run.t);
    const mm = Math.floor(remain / 60), ss = Math.floor(remain % 60);
    ctx.fillStyle = "rgba(255,236,210,0.5)";
    ctx.font = `600 ${Math.round(Math.max(11, W * 0.03))}px Palatino Linotype, Georgia, serif`;
    ctx.fillText("NIGHT", W - pad, top);
    ctx.fillStyle = remain < 8 ? "rgba(255,170,110,0.95)" : "#f4ead8";
    ctx.font = `700 ${Math.round(Math.max(20, W * 0.052))}px Palatino Linotype, Georgia, serif`;
    ctx.fillText(`${mm}:${ss.toString().padStart(2, "0")}`, W - pad, top + 22);
    const wickY = top + 40;
    ctx.textAlign = "center";
    ctx.font = `600 ${Math.round(Math.max(10, W * 0.026))}px Palatino Linotype, Georgia, serif`;
    ctx.fillStyle = "rgba(255,236,210,0.5)"; ctx.fillText("WICK", W / 2, wickY);
    for (let i = 0; i < run.wickMax; i++) {
      const x = W / 2 + (i - (run.wickMax - 1) / 2) * 20, y = wickY + 14, on = i < run.wick;
      ctx.fillStyle = on ? "rgba(255,210,120,0.95)" : "rgba(70,50,40,0.55)";
      ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x - 5, y + 1, x, y - 8); ctx.quadraticCurveTo(x + 5, y + 1, x, y + 6); ctx.fill();
    }
    if (run.combo >= 1) {
      ctx.font = `700 ${Math.round(22 + comboPop * 12)}px Palatino Linotype, Georgia, serif`;
      ctx.fillStyle = run.kindledT > 0 ? "rgba(255,210,120,0.95)" : "#f4ead8";
      ctx.fillText(String(fibStep(run.combo)), W / 2, wickY + 48);
      ctx.font = "600 11px Palatino Linotype, Georgia, serif";
      ctx.fillStyle = "rgba(255,236,210,0.5)";
      ctx.fillText(run.kindledT > 0 ? "kindled" : "combo", W / 2, wickY + 62);
    }
    if (lastCatchT > 0) {
      ctx.globalAlpha = clamp(lastCatchT * 1.5, 0, 1);
      ctx.font = `italic ${Math.round(Math.max(13, W * 0.034))}px Palatino Linotype, Georgia, serif`;
      ctx.fillStyle = "rgba(255,220,170,0.92)";
      ctx.fillText(lastCatchName, W / 2, wickY + 84);
      ctx.globalAlpha = 1;
    }
    const buffs = [];
    if (run.magnetT > 0) buffs.push("magnet " + run.magnetT.toFixed(1));
    if (run.aegisT > 0) buffs.push("aegis " + run.aegisT.toFixed(1));
    if (run.veilT > 0) buffs.push("veil");
    if (buffs.length) {
      ctx.font = "11px Palatino Linotype, Georgia, serif";
      ctx.fillStyle = "rgba(180,220,255,0.75)";
      ctx.fillText(buffs.join("  ·  "), W / 2, H - 22);
    }
    ctx.restore();
    if (state === STATE.FLY && (teachTap || teachHold)) {
      ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,230,190,0.8)";
      ctx.font = "600 13px Palatino Linotype, Georgia, serif";
      ctx.globalAlpha = 0.4 + 0.25 * Math.sin(time * 5);
      if (run.t < 3.2 && teachTap) ctx.fillText("TAP  ·  swing lantern", W / 2, H * 0.88);
      else if (run.t < 8 && teachHold) ctx.fillText("DRAG  ·  strafe the trail", W / 2, H * 0.88);
      ctx.restore();
      if (run.t > 8) { teachTap = false; teachHold = false; }
    }
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function addHit(id, x, y, w, h) { hits.push({ id, x, y, w, h }); }
  function wrapText(text, x, y, maxW, lh) {
    const words = String(text).split(" "); let line = "", yy = y;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW) { ctx.fillText(line, x, yy); line = w; yy += lh; }
      else line = test;
    }
    ctx.fillText(line, x, yy);
  }

  function drawTitle() {
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#f4ead8";
    ctx.shadowColor = "rgba(255,160,60,0.35)"; ctx.shadowBlur = 24;
    ctx.font = `600 ${Math.round(W * 0.13)}px Palatino Linotype, Georgia, serif`;
    ctx.fillText("KINDLED", W / 2, H * 0.2);
    ctx.shadowBlur = 0;
    ctx.font = "italic 13px Palatino Linotype, Georgia, serif";
    ctx.fillStyle = "rgba(244,234,216,0.45)"; ctx.fillText("working title", W / 2, H * 0.2 + 22);
    ctx.font = "14px Palatino Linotype, Georgia, serif";
    ctx.fillStyle = `rgba(244,234,216,${0.4 + 0.3 * Math.sin(titlePulse * 2.4)})`;
    ctx.fillText("tap to roost", W / 2, H * 0.9);
    ctx.font = "11px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.32)";
    ctx.fillText("night hike  ·  lantern is a tool  ·  field guide", W / 2, H * 0.935);
    ctx.restore();
  }

  function drawRoost() {
    hits.length = 0;
    ctx.fillStyle = "rgba(6,5,14,0.55)"; ctx.fillRect(0, 0, W, H);
    if (roostView === "hub") drawHub();
    else if (roostView === "map") drawMap();
    else if (roostView === "trophy") drawTrophy();
    else if (roostView === "card") drawCard();
  }

  function pill(id, x, y, w, h, label, on) {
    rr(x, y, w, h, 8);
    ctx.fillStyle = on ? "rgba(70,48,22,0.9)" : "rgba(18,16,28,0.75)";
    ctx.strokeStyle = on ? "rgba(255,200,120,0.75)" : "rgba(255,200,120,0.25)";
    ctx.lineWidth = on ? 1.6 : 1; ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f4ead8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "600 12px Palatino Linotype, Georgia, serif";
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
    addHit(id, x, y, w, h);
  }

  function drawHub() {
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#f4ead8";
    ctx.font = "600 22px Palatino Linotype, Georgia, serif";
    ctx.fillText("roost", W / 2, H * 0.07);
    ctx.font = "12px Palatino Linotype, Georgia, serif";
    ctx.fillStyle = "rgba(244,234,216,0.55)";
    ctx.fillText("lv " + heroLevel() + "   ·   nectar " + save.nectar + "   ·   nights " + save.nights, W / 2, H * 0.105);
    const barW = W * 0.5, bx = (W - barW) / 2, by = H * 0.12;
    ctx.fillStyle = "rgba(255,236,210,0.12)"; rr(bx, by, barW, 6, 3); ctx.fill();
    ctx.fillStyle = "rgba(255,196,110,0.85)"; rr(bx, by, barW * (xpInto() / 70), 6, 3); ctx.fill();
    const kimg = assets.keeper;
    if (kimg) ctx.drawImage(kimg, W / 2 - 48, H * 0.145, 96, 96 * (kimg.height / kimg.width));
    ctx.fillStyle = "rgba(244,234,216,0.5)"; ctx.font = "11px Palatino Linotype, Georgia, serif";
    ctx.fillText("difficulty", W / 2, H * 0.40);
    const diffs = ["watch", "keep", "ember"];
    const dw = W * 0.26, gap = W * 0.03, x0 = (W - (dw * 3 + gap * 2)) / 2;
    diffs.forEach((id, i) => {
      const D = DIFFS[id];
      pill("diff:" + id, x0 + i * (dw + gap), H * 0.415, dw, 36, D.name + "  " + D.wick + " wick", save.difficulty === id);
    });
    ctx.fillStyle = "rgba(244,234,216,0.5)"; ctx.font = "11px Palatino Linotype, Georgia, serif";
    ctx.fillText("loadout  ·  tap to toggle", W / 2, H * 0.50);
    ABILITIES.forEach((a, i) => {
      const cw = W * 0.28, cg = W * 0.03, ax = (W - (cw * 3 + cg * 2)) / 2 + i * (cw + cg);
      const on = !!save.equipped[a.id];
      rr(ax, H * 0.515, cw, H * 0.13, 10);
      ctx.fillStyle = on ? "rgba(60,40,20,0.88)" : "rgba(16,14,24,0.72)";
      ctx.strokeStyle = on ? "rgba(255,200,120,0.7)" : "rgba(255,200,120,0.22)";
      ctx.lineWidth = on ? 1.6 : 1; ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f4ead8"; ctx.font = "600 12px Palatino Linotype, Georgia, serif";
      ctx.fillText(a.name, ax + cw / 2, H * 0.545);
      ctx.font = "10px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.55)";
      wrapText(a.sub, ax + cw / 2, H * 0.57, cw - 10, 12);
      ctx.fillStyle = "rgba(255,196,110,0.55)"; ctx.font = "italic 10px Palatino Linotype, Georgia, serif";
      ctx.fillText("chip " + (save.chips[a.id] || 0), ax + cw / 2, H * 0.625);
      addHit("ab:" + a.id, ax, H * 0.515, cw, H * 0.13);
    });
    pill("play", W * 0.18, H * 0.68, W * 0.64, 48, "play  Night Canyon", true);
    pill("map", W * 0.08, H * 0.78, W * 0.4, 40, "campaign", false);
    pill("trophy", W * 0.52, H * 0.78, W * 0.4, 40, "trophy room", false);
    ctx.font = "11px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.35)";
    ctx.fillText("TAP pulse  ·  DRAG strafe  ·  A/D  ·  Space", W / 2, H * 0.88);
    ctx.fillText("Reed Marsh · Cliff Garden · Sky-Ruins locked", W / 2, H * 0.91);
    ctx.restore();
  }

  function drawMap() {
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#f4ead8";
    ctx.font = "600 20px Palatino Linotype, Georgia, serif";
    ctx.fillText("campaign", W / 2, H * 0.1);
    ctx.font = "12px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.5)";
    ctx.fillText("one ribbon per landscape", W / 2, H * 0.135);
    ctx.strokeStyle = "rgba(255,186,90,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.22, H * 0.28); ctx.quadraticCurveTo(W * 0.7, H * 0.4, W * 0.3, H * 0.55);
    ctx.quadraticCurveTo(W * 0.15, H * 0.65, W * 0.72, H * 0.72); ctx.stroke();
    const nodes = [
      { x: W * 0.24, y: H * 0.28, L: LANDS[0] },
      { x: W * 0.7, y: H * 0.42, L: LANDS[1] },
      { x: W * 0.32, y: H * 0.56, L: LANDS[2] },
      { x: W * 0.7, y: H * 0.72, L: LANDS[3] }
    ];
    nodes.forEach((n) => {
      ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, TAU);
      ctx.fillStyle = n.L.locked ? "rgba(20,18,28,0.85)" : "rgba(80,50,20,0.9)";
      ctx.fill(); ctx.strokeStyle = n.L.locked ? "rgba(255,200,120,0.25)" : "rgba(255,200,120,0.8)"; ctx.stroke();
      ctx.fillStyle = "#f4ead8"; ctx.font = "600 13px Palatino Linotype, Georgia, serif";
      ctx.fillText(n.L.name, n.x, n.y + 32);
      ctx.font = "10px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.45)";
      ctx.fillText(n.L.locked ? "LOCKED  ·  " + n.L.note : n.L.note, n.x, n.y + 46);
      addHit(n.L.locked ? "locked" : "play", n.x - 50, n.y - 18, 100, 70);
    });
    pill("back", W * 0.3, H * 0.88, W * 0.4, 40, "back", false);
    ctx.restore();
  }

  function trophyList() {
    return SPEC.filter((s) => {
      if (trophyFilter === "all") return true;
      if (trophyFilter === "aerial") return s.kind === "aerial";
      if (trophyFilter === "ground") return s.kind === "ground" || s.kind === "cliff";
      if (trophyFilter === "pests") return s.kind === "pest" || s.threat;
      return true;
    });
  }

  function drawTrophy() {
    ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#f4ead8";
    ctx.font = "600 20px Palatino Linotype, Georgia, serif";
    ctx.fillText("trophy room", W / 2, H * 0.08);
    const filts = [["all", "All"], ["aerial", "Aerial"], ["ground", "Ground"], ["pests", "Pests"]];
    const fw = W * 0.2, fg = 6, fx0 = (W - (fw * 4 + fg * 3)) / 2;
    filts.forEach((f, i) => pill("filt:" + f[0], fx0 + i * (fw + fg), H * 0.11, fw, 30, f[1], trophyFilter === f[0]));
    const list = trophyList();
    const cols = 3, cw = W * 0.28, ch = H * 0.16, g = W * 0.03;
    const x0 = (W - (cw * 3 + g * 2)) / 2, y0 = H * 0.18;
    list.forEach((s, i) => {
      const c = i % cols, r = (i / cols) | 0;
      const x = x0 + c * (cw + g), y = y0 + r * (ch + 10);
      const caught = seenDex(s.id);
      rr(x, y, cw, ch, 10);
      ctx.fillStyle = "rgba(16,14,26,0.78)"; ctx.strokeStyle = "rgba(255,200,120,0.28)";
      ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
      ctx.save();
      ctx.translate(x + cw / 2, y + 34);
      if (!caught) { ctx.filter = "brightness(0)"; ctx.globalAlpha = 0.5; }
      const ss = 18;
      if (s.sheet === "moths") drawSheet(sheetCell(assets.moths, 3, 3, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
      else if (s.sheet === "ground") drawSheet(sheetCell(assets.ground, 2, 2, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
      else if (s.sheet === "pests") drawSheet(sheetCell(assets.pests, 3, 1, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
      else { ctx.fillStyle = hsl(s.hue, 70, caught ? 60 : 20, 0.9); ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = caught ? "#f4ead8" : "rgba(244,234,216,0.4)";
      ctx.font = "600 10px Palatino Linotype, Georgia, serif";
      wrapText(caught ? s.commonName : "????", x + cw / 2, y + 58, cw - 8, 11);
      ctx.font = "9px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.4)";
      ctx.fillText(caught ? dexCount(s.id) + " logged" : s.rarity, x + cw / 2, y + ch - 12);
      addHit("card:" + s.id, x, y, cw, ch);
    });
    pill("back", W * 0.3, H * 0.9, W * 0.4, 36, "back", false);
    ctx.restore();
  }

  function drawCard() {
    const s = SPEC_BY[cardId] || SPEC[0];
    const caught = seenDex(s.id);
    ctx.save(); ctx.textAlign = "center";
    rr(W * 0.08, H * 0.1, W * 0.84, H * 0.72, 16);
    ctx.fillStyle = "rgba(14,12,22,0.92)"; ctx.strokeStyle = "rgba(255,200,120,0.45)";
    ctx.lineWidth = 1.4; ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f4ead8";
    ctx.font = "600 20px Palatino Linotype, Georgia, serif";
    ctx.fillText(caught ? s.commonName : "Unknown specimen", W / 2, H * 0.18);
    ctx.font = "italic 13px Palatino Linotype, Georgia, serif";
    ctx.fillStyle = "rgba(255,210,140,0.7)";
    ctx.fillText(caught ? s.latin : "— —", W / 2, H * 0.215);
    ctx.save(); ctx.translate(W / 2, H * 0.30);
    if (!caught) { ctx.filter = "brightness(0)"; ctx.globalAlpha = 0.45; }
    const ss = 28;
    if (s.sheet === "moths") drawSheet(sheetCell(assets.moths, 3, 3, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
    else if (s.sheet === "ground") drawSheet(sheetCell(assets.ground, 2, 2, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
    else if (s.sheet === "pests") drawSheet(sheetCell(assets.pests, 3, 1, s.i), -ss, -ss * 0.7, ss * 2, ss * 1.4);
    ctx.restore();
    const lines = caught ? [
      "rarity   " + s.rarity,
      "speed   " + s.speed,
      "nectar   " + s.nectar,
      "catch window   " + s.catchWindow.toFixed(1) + "s",
      "weakness   " + s.weakness,
      "habitat   " + s.habitat,
      "times caught   " + dexCount(s.id)
    ] : ["silhouette until first catch", "walk the canyon. pulse. log it."];
    ctx.font = "12px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(244,234,216,0.75)";
    lines.forEach((ln, i) => wrapText(ln, W / 2, H * 0.42 + i * 22, W * 0.72, 15));
    pill("back", W * 0.3, H * 0.86, W * 0.4, 40, "back", false);
    ctx.restore();
  }

  function drawLandFlash() {
    const a = clamp(1 - landT / 1.3, 0, 1);
    ctx.save();
    ctx.fillStyle = run.crashed ? "rgba(255,90,50," + (a * 0.18) + ")" : "rgba(255,180,80," + (a * 0.16) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,236,210," + a + ")";
    ctx.font = "600 26px Palatino Linotype, Georgia, serif";
    ctx.fillText(run.crashed ? "wick spent" : "home", W / 2, H * 0.38);
    ctx.font = "13px Palatino Linotype, Georgia, serif"; ctx.fillStyle = "rgba(255,236,210," + (a * 0.65) + ")";
    ctx.fillText("+" + run.nectar + " nectar   ·   " + run.catches + " specimens", W / 2, H * 0.43);
    ctx.restore();
  }

  function applyCamera(fn) {
    ctx.save();
    const sh = run.shake * 7;
    ctx.translate(W / 2 + (Math.random() - 0.5) * sh * 2, H / 2 + (Math.random() - 0.5) * sh);
    ctx.rotate(keeper.roll * 0.25);
    ctx.translate(-W / 2, -H / 2);
    fn(); ctx.restore();
  }

  function frame() {
    applyCamera(() => {
      drawCanyon();
      if (speedLines.length) {
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "rgba(255,230,200,0.16)"; ctx.lineWidth = 1;
        for (const s of speedLines) { ctx.globalAlpha = s.a; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.len); ctx.stroke(); }
        ctx.restore();
      }
      if (state === STATE.FLY || state === STATE.LAND || state === STATE.TITLE) {
        const ordered = ents.slice().sort((a, b) => a.y - b.y);
        for (const e of ordered) drawEnt(e);
        drawPulseRings(); drawParts(); drawKeeper(); drawFloats();
      }
    });
    if (run.hitFlash > 0) { ctx.fillStyle = "rgba(120,20,10," + (run.hitFlash * 0.28) + ")"; ctx.fillRect(0, 0, W, H); }
    if (state === STATE.TITLE) drawTitle();
    if (state === STATE.FLY) drawHUD();
    if (state === STATE.LAND) { drawHUD(); drawLandFlash(); }
    if (state === STATE.ROOST) { drawRoost(); drawParts(); drawFloats(); }
  }

  let last = performance.now();
  function tick(now) {
    let dt = (now - last) / 1000; last = now; if (dt > 0.05) dt = 0.05; time += dt;
    if (state === STATE.TITLE) updateTitle(dt);
    else if (state === STATE.FLY) updateFly(dt);
    else if (state === STATE.LAND) updateLand(dt);
    else if (state === STATE.ROOST) updateRoost(dt);
    updateParts(dt); updateFloats(dt); frame();
    requestAnimationFrame(tick);
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      this.moveTo(x + rr, y); this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr); this.arcTo(x, y, x, y, rr);
      this.arcTo(x, y, x + w, y, rr); this.closePath(); return this;
    };
  }
  requestAnimationFrame(tick);
})();
