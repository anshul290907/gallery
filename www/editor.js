'use strict';
/* ===================== Photo editor ===================== */
(function () {
  Object.assign(P, {
    crop: '<path d="M7 3v14h14M3 7h14v14"/>',
    filters: '<circle cx="9" cy="10" r="5.5"/><circle cx="15" cy="10" r="5.5"/><circle cx="12" cy="15" r="5.5"/>',
    brush: '<path d="M14.5 5.5l4 4-8 8-4.5.5.5-4.5z"/><path d="M13 7l4 4"/>',
    text: '<path d="M5 6V4.5h14V6M12 4.5V19M9 19h6"/>',
    smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5v.2M15 9.5v.2"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    compare: '<rect x="3.5" y="5" width="7.5" height="14" rx="2"/><rect x="13" y="5" width="7.5" height="14" rx="2"/>',
    wand: '<path d="M5 19L15 9M14 4v3M19 9h-3M17.5 5.5L16 7M9 4.5v2M6 7.5h2"/>',
    dup: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>'
  });

  const FILTERS = {
    None: {},
    Vivid: { contrast: 14, saturation: 28, vibrance: 25 },
    Warm: { warmth: 38, tint: 6, saturation: 6 },
    Cool: { warmth: -38, saturation: 4 },
    Sunset: { warmth: 52, tint: 14, saturation: 16, contrast: 8 },
    Mint: { warmth: -22, tint: -16, saturation: 8, fade: 8 },
    Matte: { fade: 28, contrast: -6, saturation: -12, shadows: 12 },
    Fade: { fade: 40, contrast: -12, saturation: -18 },
    Drama: { contrast: 32, shadows: -22, highlights: -10, saturation: -12, vignette: 25 },
    Pop: { contrast: 20, saturation: 38, vibrance: 20, sharpen: 25 },
    Mono: { mono: 1, contrast: 12 },
    Noir: { mono: 1, contrast: 38, vignette: 35, grain: 15 },
    Sepia: { sepia: 0.85, contrast: 6 },
    Vintage: { sepia: 0.4, fade: 30, warmth: 20, vignette: 25, grain: 20 }
  };
  const ADJ = [['exposure', 'Exposure'], ['brightness', 'Brightness'], ['contrast', 'Contrast'], ['highlights', 'Highlights'], ['shadows', 'Shadows'], ['saturation', 'Saturation'], ['vibrance', 'Vibrance'], ['warmth', 'Warmth'], ['tint', 'Tint'], ['sharpen', 'Sharpness'], ['vignette', 'Vignette'], ['grain', 'Grain'], ['fade', 'Fade']];
  const POSITIVE_ONLY = ['sharpen', 'grain', 'fade'];
  const FONTS = {
    Sans: 'Roboto,"Segoe UI",system-ui,sans-serif',
    Serif: 'Georgia,"Times New Roman",serif',
    Mono: '"Courier New",ui-monospace,monospace',
    Script: '"Brush Script MT","Segoe Script",cursive',
    Impact: 'Impact,"Arial Black",sans-serif',
    Round: '"Trebuchet MS",system-ui,sans-serif'
  };
  const COLORS = ['#ffffff', '#000000', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#3e91ff', '#5856d6', '#ff2d92', '#8e5b3c'];
  const EMOJI = '😀 😂 🥹 😍 😎 🤩 🥳 😭 😡 🤯 😴 🤔 🙌 👍 👏 🙏 💪 ✌️ 🤞 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💯 🔥 ✨ ⭐ 🌟 💫 🎉 🎊 🎈 🎁 🏆 👑 💎 🌈 ☀️ 🌙 ⚡ ❄️ 🌸 🌹 🌺 🍀 🌴 🌊 🐶 🐱 🦋 🐼 🦄 🍕 🍔 🍟 🍩 🍦 🍎 🍓 🥑 ☕ 🍻 🎵 🎶 📷 ✈️ 🚗 ⚽ 🏀 🎮 📍 ✅ ❌ ⚠️ 💬 💭 👀 🙈 😈 👻 💀 🤖'.split(' ');
  const mctx = document.createElement('canvas').getContext('2d');
  const mkc = (w, hh) => { const c = document.createElement('canvas'); c.width = w; c.height = hh; return c; };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const zeroAdj = () => ({ exposure: 0, brightness: 0, contrast: 0, highlights: 0, shadows: 0, saturation: 0, vibrance: 0, warmth: 0, tint: 0, sharpen: 0, vignette: 0, grain: 0, fade: 0 });
  const KEYS = ['exposure', 'brightness', 'contrast', 'highlights', 'shadows', 'saturation', 'vibrance', 'warmth', 'tint', 'sharpen', 'vignette', 'grain', 'fade', 'mono', 'sepia'];

  /* ---------- pixel pipeline ---------- */
  function process(src, p, dst) {
    const w = src.width, hh = src.height;
    const out = dst || mkc(w, hh);
    if (out.width !== w) out.width = w;
    if (out.height !== hh) out.height = hh;
    const x = out.getContext('2d', { willReadFrequently: true });
    x.clearRect(0, 0, w, hh); x.drawImage(src, 0, 0);
    if (!KEYS.some(k => p[k])) return out;
    const id = x.getImageData(0, 0, w, hh), d = id.data;
    const lr = new Uint8ClampedArray(256), lg = new Uint8ClampedArray(256), lb = new Uint8ClampedArray(256);
    const ex = Math.pow(2, p.exposure / 100 * 1.2), bri = p.brightness / 100 * 0.3, con = 1 + p.contrast / 100;
    const hi = p.highlights / 100 * 0.3, sh = p.shadows / 100 * 0.3, fd = p.fade / 100;
    const wr = p.warmth / 100 * 0.1 + p.tint / 100 * 0.04, wg = -p.tint / 100 * 0.08, wb = -p.warmth / 100 * 0.1 + p.tint / 100 * 0.04;
    for (let i = 0; i < 256; i++) {
      let v = i / 255 * ex + bri;
      v = (v - 0.5) * con + 0.5;
      v += hi * smooth(0.45, 1, v) + sh * (1 - smooth(0, 0.55, v));
      if (fd > 0) v = v * (1 - fd * 0.25) + fd * 0.1;
      lr[i] = (v + wr) * 255; lg[i] = (v + wg) * 255; lb[i] = (v + wb) * 255;
    }
    const sat = 1 + p.saturation / 100, vib = p.vibrance / 100, mono = p.mono || 0, sep = p.sepia || 0;
    const doSat = sat !== 1 || vib !== 0 || mono > 0 || sep > 0;
    for (let i = 0; i < d.length; i += 4) {
      let r = lr[d[i]], g = lg[d[i + 1]], b = lb[d[i + 2]];
      if (doSat) {
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        let f = sat;
        if (vib) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); f *= Math.max(0, 1 + vib * (1 - (mx - mn) / 255)); }
        if (mono) f *= (1 - mono);
        if (f !== 1) { r = l + (r - l) * f; g = l + (g - l) * f; b = l + (b - l) * f; }
        if (sep) { const sr = l * 1.07 + 8, sg = l * 0.95 + 4, sb = l * 0.78; r += (sr - r) * sep; g += (sg - g) * sep; b += (sb - b) * sep; }
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
    if (p.sharpen > 0) {
      const a = p.sharpen / 100 * 0.9, c = 1 + 4 * a, s = new Uint8ClampedArray(d), st = w * 4;
      for (let y = 1; y < hh - 1; y++) for (let xx = 1; xx < w - 1; xx++) {
        const o = (y * w + xx) * 4;
        for (let ch = 0; ch < 3; ch++) { const q = o + ch; d[q] = c * s[q] - a * (s[q - 4] + s[q + 4] + s[q - st] + s[q + st]); }
      }
    }
    if (p.vignette || p.grain) {
      const v = p.vignette / 100, gr = p.grain / 100 * 40, cx = w / 2, cy = hh / 2, md = Math.sqrt(cx * cx + cy * cy);
      for (let y = 0; y < hh; y++) for (let xx = 0; xx < w; xx++) {
        const pi = y * w + xx, o = pi * 4;
        let m = 1;
        if (v) { const dx = xx - cx, dy = y - cy, t = smooth(0.35, 1, Math.sqrt(dx * dx + dy * dy) / md); m = v > 0 ? 1 - v * t * 0.85 : 1 + (-v) * t * 0.5; }
        const n = gr ? ((((pi * 2654435761) >>> 0) % 256) - 128) / 128 * gr : 0;
        d[o] = d[o] * m + n; d[o + 1] = d[o + 1] * m + n; d[o + 2] = d[o + 2] * m + n;
      }
    }
    x.putImageData(id, 0, 0);
    return out;
  }
  function filterParams(n, s) {
    const p = Object.assign(zeroAdj(), { mono: 0, sepia: 0 }), f = FILTERS[n] || {};
    for (const k in f) p[k] = f[k] * s;
    return p;
  }

  /* ---------- overlays ---------- */
  function rr(c, x, y, w, hh, r) {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  const fontOf = l => (l.it ? 'italic ' : '') + (l.b ? '700 ' : '400 ') + l.size + 'px ' + (FONTS[l.font] || FONTS.Sans);
  function bounds(l) {
    if (l.type === 'emoji') return { w: l.size * 1.3, h: l.size * 1.3 };
    mctx.font = fontOf(l);
    const lines = l.text.split('\n');
    const w = Math.max(...lines.map(s => mctx.measureText(s).width));
    return { w: w + l.size * 0.5, h: lines.length * l.size * 1.2 + l.size * 0.3 };
  }
  function drawLayer(c, l) {
    c.save();
    c.translate(l.x, l.y); c.rotate(l.rot * Math.PI / 180); c.globalAlpha = l.op == null ? 1 : l.op;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (l.type === 'emoji') {
      c.font = l.size + 'px "Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji",sans-serif';
      c.fillText(l.char, 0, 0);
    } else {
      c.font = fontOf(l);
      const lines = l.text.split('\n'), lh = l.size * 1.2;
      const w = Math.max(...lines.map(s => c.measureText(s).width)), th = lines.length * lh;
      if (l.bg) {
        const lum = parseInt(l.color.slice(1, 3), 16) * 0.299 + parseInt(l.color.slice(3, 5), 16) * 0.587 + parseInt(l.color.slice(5, 7), 16) * 0.114, pad = l.size * 0.3;
        c.fillStyle = lum > 140 ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.88)';
        rr(c, -w / 2 - pad, -th / 2 - pad * 0.5, w + pad * 2, th + pad, l.size * 0.25); c.fill();
      }
      if (l.shadow) { c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = l.size * 0.15; c.shadowOffsetY = l.size * 0.05; }
      lines.forEach((s, i) => {
        const y = (i - (lines.length - 1) / 2) * lh;
        if (l.outline) { c.lineWidth = l.size * 0.12; c.lineJoin = 'round'; c.strokeStyle = l.color === '#000000' ? '#ffffff' : '#000000'; c.strokeText(s, 0, y); }
        c.fillStyle = l.color; c.fillText(s, 0, y);
      });
    }
    c.restore();
  }
  function drawStroke(c, s) {
    const p = s.pts;
    c.save();
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = c.fillStyle = s.color; c.lineWidth = s.size;
    if (s.k === 'marker') c.globalAlpha = 0.4;
    if (s.k === 'pen' || s.k === 'marker') {
      if (p.length === 1) { c.beginPath(); c.arc(p[0][0], p[0][1], s.size / 2, 0, 7); c.fill(); }
      else {
        c.beginPath(); c.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < p.length - 1; i++) c.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
        c.lineTo(p[p.length - 1][0], p[p.length - 1][1]); c.stroke();
      }
    } else if (p.length > 1) {
      const a = p[0], b = p[1];
      if (s.k === 'line' || s.k === 'arrow') {
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
        if (s.k === 'arrow') {
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = Math.max(s.size * 3.5, 22);
          c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - hl * Math.cos(ang - 0.45), b[1] - hl * Math.sin(ang - 0.45));
          c.moveTo(b[0], b[1]); c.lineTo(b[0] - hl * Math.cos(ang + 0.45), b[1] - hl * Math.sin(ang + 0.45)); c.stroke();
        }
      } else if (s.k === 'rect') c.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      else if (s.k === 'oval') { c.beginPath(); c.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(1, Math.abs(b[0] - a[0]) / 2), Math.max(1, Math.abs(b[1] - a[1]) / 2), 0, 0, 7); c.stroke(); }
    }
    c.restore();
  }
  function segDist(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
  }
  function strokeHit(s, x, y, r) {
    const p = s.pts;
    if (s.k === 'pen' || s.k === 'marker') { for (let i = 0; i < p.length; i++) { if (Math.hypot(p[i][0] - x, p[i][1] - y) < r) return true; if (i && segDist(x, y, p[i - 1], p[i]) < r) return true; } return false; }
    if (p.length < 2) return false;
    const a = p[0], b = p[1];
    if (s.k === 'line' || s.k === 'arrow') return segDist(x, y, a, b) < r;
    if (s.k === 'rect') { const c = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]; return c.some((q, i) => segDist(x, y, q, c[(i + 1) % 4]) < r); }
    const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, ra = Math.max(1, Math.abs(b[0] - a[0]) / 2), rb = Math.max(1, Math.abs(b[1] - a[1]) / 2);
    return Math.abs(Math.hypot((x - cx) / ra, (y - cy) / rb) - 1) * Math.min(ra, rb) < r;
  }

  /* ---------- editor ---------- */
  async function openEditor(it, done) {
    const blob = await getBlob(it.id);
    let bmp;
    try { bmp = await createImageBitmap(blob); } catch (e) { toast("Can't edit this file"); return; }
    const k0 = Math.min(1, 3200 / Math.max(bmp.width, bmp.height));
    let base = mkc(Math.max(1, Math.round(bmp.width * k0)), Math.max(1, Math.round(bmp.height * k0)));
    base.getContext('2d').drawImage(bmp, 0, 0, base.width, base.height);
    if (bmp.close) bmp.close();

    let adj = zeroAdj(), flt = { n: 'None', s: 100 }, strokes = [], layers = [], sel = null, nid = 1;
    let tool = 'adjust', adjKey = 'exposure', dtool = 'pen', dcolor = '#ff3b30', dsize = 8, lsl = 'size';
    let tstyle = { color: '#ffffff', font: 'Sans', b: true, it: false, bg: false, outline: false, shadow: true };
    let aspectKey = 'Free', aspect = 0, cr = null, prev = null, pk = 1, raf = 0, comparing = false, force = false;
    const thumbCache = {};
    let thumbSrc = null;

    /* DOM */
    const root = h('div', { class: 'ed' });
    const undoB = h('button', { class: 'ib', onclick: () => undo() }, icon('undo'));
    const redoB = h('button', { class: 'ib', onclick: () => redo() }, icon('redo'));
    const cmpB = h('button', { class: 'ib' }, icon('compare'));
    const setCmp = v => () => { comparing = v; draw(); };
    cmpB.addEventListener('pointerdown', setCmp(true));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => cmpB.addEventListener(n, setCmp(false)));
    root.append(h('div', { class: 'ed-h' }, h('button', { class: 'ib', onclick: () => back() }, icon('close')), h('div', { class: 'sp' }), undoB, redoB, cmpB, h('button', { class: 'ed-save', onclick: saveSheet }, 'Save')));
    const stage = h('div', { class: 'ed-st' }), wrap = h('div', { class: 'ed-wrap' });
    const cv = document.createElement('canvas'), ov = document.createElement('canvas');
    wrap.append(cv, ov); stage.append(wrap);
    const panel = h('div', { class: 'ed-p' }), tabsEl = h('div', { class: 'ed-tabs' });
    root.append(stage, panel, tabsEl);
    document.body.append(root);

    const TABS = [['crop', 'Crop', 'crop'], ['adjust', 'Adjust', 'sliders'], ['filters', 'Filters', 'filters'], ['draw', 'Draw', 'brush'], ['text', 'Text', 'text'], ['sticker', 'Stickers', 'smile']];
    const tabBtns = TABS.map(([k, l, i]) => { const b = h('button', { class: 'ed-tab', onclick: () => setTool(k) }, icon(i), l); tabsEl.append(b); return b; });

    /* history */
    const clone = o => JSON.parse(JSON.stringify(o));
    const snap = () => ({ base, adj: { ...adj }, flt: { ...flt }, strokes: clone(strokes), layers: clone(layers) });
    let hist = [snap()], hi = 0;
    function updUndo() { undoB.disabled = hi <= 0; redoB.disabled = hi >= hist.length - 1; }
    function commit() {
      hist.length = hi + 1; hist.push(snap());
      if (hist.length > 40) hist.shift();
      hi = hist.length - 1; updUndo();
    }
    function restore(s) {
      const nb = s.base !== base;
      base = s.base; adj = { ...s.adj }; flt = { ...s.flt }; strokes = clone(s.strokes); layers = clone(s.layers);
      if (sel && !layers.some(l => l.id === sel)) sel = null;
      if (nb) rebuildPrev(); else draw();
      drawPanel(); updUndo();
    }
    function undo() { if (hi > 0) { hi--; restore(hist[hi]); } }
    function redo() { if (hi < hist.length - 1) { hi++; restore(hist[hi]); } }
    const dirty = () => hi > 0;

    /* preview */
    function rebuildPrev() {
      const k = Math.min(1, 1280 / Math.max(base.width, base.height));
      prev = mkc(Math.max(1, Math.round(base.width * k)), Math.max(1, Math.round(base.height * k)));
      pk = prev.width / base.width;
      const x = prev.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(base, 0, 0, prev.width, prev.height);
      cv.width = ov.width = prev.width; cv.height = ov.height = prev.height;
      thumbSrc = null; for (const k2 in thumbCache) delete thumbCache[k2];
      cr = tool === 'crop' ? { x: 0, y: 0, w: base.width, h: base.height } : null;
      fit(); draw();
    }
    function fit() {
      if (!prev) return;
      const w = stage.clientWidth - 20, hh = stage.clientHeight - 12;
      if (w <= 0 || hh <= 0) return;
      const s = Math.min(w / prev.width, hh / prev.height);
      wrap.style.width = Math.floor(prev.width * s) + 'px'; wrap.style.height = Math.floor(prev.height * s) + 'px';
      drawOv();
    }
    const ro = new ResizeObserver(fit); ro.observe(stage);
    function params() {
      const p = { ...adj, mono: 0, sepia: 0 }, f = filterParams(flt.n, flt.s / 100);
      for (const k in f) p[k] = (p[k] || 0) + f[k];
      return p;
    }
    function paintOverlays(c) { strokes.forEach(s => drawStroke(c, s)); layers.forEach(l => drawLayer(c, l)); }
    function draw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }
    function paint() {
      if (!prev) return;
      if (comparing) { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(prev, 0, 0); drawOv(); return; }
      process(prev, params(), cv);
      const x = cv.getContext('2d'); x.save(); x.scale(pk, pk); paintOverlays(x); x.restore();
      drawOv();
    }
    const getSel = () => layers.find(l => l.id === sel) || null;
    const kd = () => base.width / (ov.getBoundingClientRect().width || base.width);
    function drawOv() {
      const x = ov.getContext('2d'); x.clearRect(0, 0, ov.width, ov.height);
      if (tool === 'crop' && cr && !comparing) drawCrop(x);
      else if ((tool === 'text' || tool === 'sticker') && sel && !comparing) {
        const l = getSel(); if (!l) return;
        const b = bounds(l), lw = 2 / pk;
        x.save(); x.scale(pk, pk); x.translate(l.x, l.y); x.rotate(l.rot * Math.PI / 180);
        x.strokeStyle = '#fff'; x.lineWidth = lw; x.setLineDash([8 / pk, 6 / pk]); x.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
        x.setLineDash([]); x.fillStyle = '#3e91ff';
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, c]) => { x.beginPath(); x.arc(a * b.w / 2, c * b.h / 2, 5 / pk, 0, 7); x.fill(); });
        x.restore();
      }
    }
    function drawCrop(x) {
      const r = { x: cr.x * pk, y: cr.y * pk, w: cr.w * pk, h: cr.h * pk }, cs = ov.width / (ov.getBoundingClientRect().width || ov.width);
      x.fillStyle = 'rgba(0,0,0,.6)';
      x.fillRect(0, 0, ov.width, r.y); x.fillRect(0, r.y + r.h, ov.width, ov.height - r.y - r.h);
      x.fillRect(0, r.y, r.x, r.h); x.fillRect(r.x + r.w, r.y, ov.width - r.x - r.w, r.h);
      x.strokeStyle = '#fff'; x.lineWidth = 1.5 * cs; x.strokeRect(r.x, r.y, r.w, r.h);
      x.globalAlpha = 0.4; x.lineWidth = cs; x.beginPath();
      for (let i = 1; i < 3; i++) { x.moveTo(r.x + r.w * i / 3, r.y); x.lineTo(r.x + r.w * i / 3, r.y + r.h); x.moveTo(r.x, r.y + r.h * i / 3); x.lineTo(r.x + r.w, r.y + r.h * i / 3); }
      x.stroke(); x.globalAlpha = 1; x.lineWidth = 4 * cs; x.lineCap = 'round';
      const L = 22 * cs; x.beginPath();
      [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]].forEach(([cx, cy, sx, sy]) => { x.moveTo(cx + sx * L, cy); x.lineTo(cx, cy); x.lineTo(cx, cy + sy * L); });
      x.stroke();
    }

    /* destructive ops */
    function mapAll(fn, rf) {
      strokes.forEach(s => { s.pts = s.pts.map(q => fn(q[0], q[1])); });
      layers.forEach(l => { const q = fn(l.x, l.y); l.x = q[0]; l.y = q[1]; l.rot = rf(l.rot); });
    }
    function applyBase(nb) { base = nb; rebuildPrev(); commit(); drawPanel(); }
    function rot90(cw) {
      const W = base.width, H = base.height, nb = mkc(H, W), x = nb.getContext('2d');
      if (cw) x.setTransform(0, 1, -1, 0, H, 0); else x.setTransform(0, -1, 1, 0, 0, W);
      x.drawImage(base, 0, 0);
      mapAll(cw ? (px, py) => [H - py, px] : (px, py) => [py, W - px], r => r + (cw ? 90 : -90));
      applyBase(nb);
    }
    function flip(horiz) {
      const W = base.width, H = base.height, nb = mkc(W, H), x = nb.getContext('2d');
      if (horiz) x.setTransform(-1, 0, 0, 1, W, 0); else x.setTransform(1, 0, 0, -1, 0, H);
      x.drawImage(base, 0, 0);
      mapAll(horiz ? (px, py) => [W - px, py] : (px, py) => [px, H - py], r => -r);
      applyBase(nb);
    }
    function applyCrop() {
      if (!cr) return;
      const { x, y, w, h: ch } = cr;
      if (w >= base.width - 1 && ch >= base.height - 1) { toast('Drag the corners to crop first'); return; }
      const nb = mkc(Math.max(1, Math.round(w)), Math.max(1, Math.round(ch)));
      nb.getContext('2d').drawImage(base, x, y, w, ch, 0, 0, nb.width, nb.height);
      mapAll((px, py) => [px - x, py - y], r => r);
      aspectKey = 'Free'; aspect = 0;
      applyBase(nb);
    }
    function setAspect(key, ratio) {
      aspectKey = key; aspect = ratio === 'orig' ? base.width / base.height : ratio;
      if (!aspect) return;
      const W = base.width, H = base.height, w = Math.min(W, H * aspect), hh = w / aspect;
      cr = { x: (W - w) / 2, y: (H - hh) / 2, w, h: hh };
    }

    /* panel helpers */
    const chip = (label, on, fn, dot) => h('button', { class: 'ec' + (on ? ' on' : ''), onclick: fn }, label, dot ? h('i') : null);
    function slider(label, min, max, val, oninput, onchange) {
      const out = h('output', {}, String(Math.round(val)));
      const inp = h('input', { type: 'range', min: String(min), max: String(max), step: '1', value: String(val) });
      inp.addEventListener('input', () => { out.textContent = inp.value; oninput(+inp.value); });
      inp.addEventListener('change', () => { if (onchange) onchange(); });
      return h('div', { class: 'srow2' }, h('label', {}, label), inp, out);
    }
    function swatches(cur, fn) {
      return h('div', { class: 'sw' }, ...COLORS.map(c => { const b = h('button', { class: c === cur ? 'on' : '', onclick: () => fn(c) }); b.style.background = c; return b; }));
    }
    const pill = (label, fn, cls, ic2) => h('button', { class: 'pillb ' + (cls || ''), onclick: fn }, ic2 ? icon(ic2, 18) : null, label);

    function setTool(t) {
      tool = t;
      if (t === 'crop') cr = { x: 0, y: 0, w: base.width, h: base.height }; else cr = null;
      if (t !== 'text' && t !== 'sticker') sel = null;
      tabBtns.forEach((b, i) => b.classList.toggle('on', TABS[i][0] === t));
      drawPanel(); drawOv();
    }
    function drawPanel() {
      panel.innerHTML = '';
      ({ crop: pCrop, adjust: pAdjust, filters: pFilters, draw: pDraw, text: pText, sticker: pSticker })[tool]();
    }

    function pCrop() {
      panel.append(h('div', { class: 'chiprow' }, ...[['Free', 0], ['Original', 'orig'], ['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9], ['9:16', 9 / 16]].map(([k, r]) => chip(k, aspectKey === k, () => { setAspect(k, r); drawPanel(); drawOv(); }))));
      panel.append(h('div', { class: 'arow2' }, pill('Left', () => rot90(false), '', 'rotate'), pill('Right', () => rot90(true), '', 'rotate'), pill('Flip H', () => flip(true), '', 'flip'), pill('Flip V', () => flip(false), '', 'flip')));
      panel.append(h('div', { class: 'arow2' }, pill('Apply crop', applyCrop, 'pri', 'check'), pill('Reset', () => { aspectKey = 'Free'; aspect = 0; cr = { x: 0, y: 0, w: base.width, h: base.height }; drawPanel(); drawOv(); })));
    }
    function pAdjust() {
      panel.append(h('div', { class: 'chiprow' },
        chip([icon('wand', 16), 'Auto'], false, autoEnhance),
        ...ADJ.map(([k, n]) => chip(n, adjKey === k, () => { adjKey = k; drawPanel(); }, adj[k] !== 0)),
        chip('Reset', false, () => { adj = zeroAdj(); commit(); drawPanel(); draw(); })));
      const k = adjKey, nm = ADJ.find(a => a[0] === k)[1];
      panel.append(slider(nm, POSITIVE_ONLY.includes(k) ? 0 : -100, 100, adj[k], v => { adj[k] = v; draw(); }, () => { commit(); drawPanel(); }));
    }
    function autoEnhance() {
      const x = prev.getContext('2d'), d = x.getImageData(0, 0, prev.width, prev.height).data, hist2 = new Uint32Array(256);
      let n = 0, sum = 0;
      for (let i = 0; i < d.length; i += 16) { const l = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); hist2[l]++; n++; sum += l; }
      let acc = 0, lo = 0, hi2 = 255;
      for (let i = 0; i < 256; i++) { acc += hist2[i]; if (acc >= n * 0.01) { lo = i; break; } }
      acc = 0; for (let i = 255; i >= 0; i--) { acc += hist2[i]; if (acc >= n * 0.01) { hi2 = i; break; } }
      const mean = sum / n;
      adj.exposure = clamp(Math.round((118 - mean) / 128 * 45), -30, 40);
      adj.contrast = clamp(Math.round((255 / Math.max(60, hi2 - lo) - 1) * 55), 0, 45);
      adj.shadows = mean < 100 ? 18 : 6; adj.highlights = hi2 > 245 ? -12 : 0;
      adj.saturation = 8; adj.vibrance = 15;
      commit(); drawPanel(); draw(); toast('Auto enhanced');
    }
    function mkThumbSrc() {
      const s = 152, c = mkc(s, s), x = c.getContext('2d'), r = Math.max(s / prev.width, s / prev.height);
      x.drawImage(prev, (s - prev.width * r) / 2, (s - prev.height * r) / 2, prev.width * r, prev.height * r);
      return c;
    }
    function pFilters() {
      if (!thumbSrc) thumbSrc = mkThumbSrc();
      const row = h('div', { class: 'fths' });
      Object.keys(FILTERS).forEach(n => {
        if (!thumbCache[n]) thumbCache[n] = process(thumbSrc, filterParams(n, 1));
        row.append(h('button', { class: 'fth' + (flt.n === n ? ' on' : ''), onclick: () => { flt = { n, s: 100 }; commit(); drawPanel(); draw(); } }, thumbCache[n], n));
      });
      panel.append(row);
      if (flt.n !== 'None') panel.append(slider('Intensity', 0, 100, flt.s, v => { flt.s = v; draw(); }, commit));
    }
    function pDraw() {
      panel.append(h('div', { class: 'chiprow' }, ...[['pen', 'Pen'], ['marker', 'Marker'], ['line', 'Line'], ['arrow', 'Arrow'], ['rect', 'Rectangle'], ['oval', 'Oval'], ['eraser', 'Eraser']].map(([k, n]) => chip(n, dtool === k, () => { dtool = k; drawPanel(); }))));
      if (dtool === 'eraser') panel.append(h('div', { class: 'hint' }, 'Touch a stroke to remove it. Use undo to bring it back.'));
      else {
        panel.append(swatches(dcolor, c => { dcolor = c; drawPanel(); }));
        panel.append(slider('Size', 1, 40, dsize, v => { dsize = v; }));
      }
    }
    function addLayer(l) {
      l.id = nid++; l.x = base.width / 2; l.y = base.height / 2; l.rot = 0; l.op = 1;
      layers.push(l); sel = l.id; commit(); drawPanel(); draw();
    }
    const longEdge = () => Math.max(base.width, base.height);
    async function addText() {
      const t = await dialog({ title: 'Add text', input: '', multiline: true, placeholder: 'Type something', ok: 'Add' });
      if (t) addLayer({ type: 'text', text: t, size: longEdge() * 0.06, ...tstyle });
    }
    async function editText(l) {
      const t = await dialog({ title: 'Edit text', input: l.text, multiline: true, ok: 'Done' });
      if (t && t !== l.text) { l.text = t; commit(); draw(); drawOv(); }
    }
    function dupLayer(l) { const c = clone(l); c.id = nid++; c.x += longEdge() * 0.03; c.y += longEdge() * 0.03; layers.push(c); sel = c.id; commit(); drawPanel(); draw(); }
    function delLayer(l) { layers = layers.filter(q => q !== l); sel = null; commit(); drawPanel(); draw(); drawOv(); }
    function layerControls(l) {
      const long = longEdge();
      panel.append(h('div', { class: 'chiprow' }, ...[['size', 'Size'], ['rot', 'Rotate'], ['op', 'Opacity']].map(([k, n]) => chip(n, lsl === k, () => { lsl = k; drawPanel(); }))));
      const live2 = () => { draw(); drawOv(); };
      if (lsl === 'size') panel.append(slider('Size', 2, 100, l.size / long * 200, v => { l.size = v / 200 * long; live2(); }, commit));
      else if (lsl === 'rot') panel.append(slider('Rotate', -180, 180, l.rot, v => { l.rot = v; live2(); }, commit));
      else panel.append(slider('Opacity', 10, 100, (l.op == null ? 1 : l.op) * 100, v => { l.op = v / 100; live2(); }, commit));
    }
    function pText() {
      const l = getSel(), tl = l && l.type === 'text' ? l : null;
      const acts = [pill('Add text', addText, 'pri', 'plus')];
      if (tl) acts.push(pill('Edit', () => editText(tl), '', 'edit'));
      if (l) acts.push(pill('Copy', () => dupLayer(l), '', 'dup'), pill('Delete', () => delLayer(l), 'danger', 'trash'));
      panel.append(h('div', { class: 'arow2' }, ...acts));
      if (!l) { panel.append(h('div', { class: 'hint' }, 'Tap text to select it. Drag to move, pinch to resize and rotate, tap again to edit.')); return; }
      if (tl) {
        const set = (k, v) => { tl[k] = v; tstyle[k] = v; commit(); drawPanel(); draw(); drawOv(); };
        panel.append(h('div', { class: 'chiprow' }, ...Object.keys(FONTS).map(f => chip(f, tl.font === f, () => set('font', f)))));
        panel.append(swatches(tl.color, c => set('color', c)));
        panel.append(h('div', { class: 'chiprow' }, chip('Bold', tl.b, () => set('b', !tl.b)), chip('Italic', tl.it, () => set('it', !tl.it)), chip('Background', tl.bg, () => set('bg', !tl.bg)), chip('Outline', tl.outline, () => set('outline', !tl.outline)), chip('Shadow', tl.shadow, () => set('shadow', !tl.shadow))));
      }
      layerControls(l);
    }
    function pSticker() {
      const l = getSel();
      if (l) { panel.append(h('div', { class: 'arow2' }, pill('Copy', () => dupLayer(l), '', 'dup'), pill('Delete', () => delLayer(l), 'danger', 'trash'))); layerControls(l); }
      panel.append(h('div', { class: 'emo' }, ...EMOJI.map(e => h('button', { onclick: () => addLayer({ type: 'emoji', char: e, size: longEdge() * 0.14 }) }, e))));
    }

    /* pointer interaction */
    const ptrs = new Map(); let g = null;
    const pt = e => { const r = ov.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * base.width, (e.clientY - r.top) / r.height * base.height]; };
    function hitLayer(l, x, y) {
      const b = bounds(l), m = kd() * 14, a = -l.rot * Math.PI / 180, dx = x - l.x, dy = y - l.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      return Math.abs(lx) <= b.w / 2 + m && Math.abs(ly) <= b.h / 2 + m;
    }
    function cropDown(x, y) {
      const k = kd() * 28, { x: cx, y: cy, w, h: ch } = cr;
      const L = Math.abs(x - cx) < k, R = Math.abs(x - (cx + w)) < k, T = Math.abs(y - cy) < k, B = Math.abs(y - (cy + ch)) < k;
      const inX = x > cx - k && x < cx + w + k, inY = y > cy - k && y < cy + ch + k;
      let m = 'crop-none';
      if (L && T) m = 'crop-tl'; else if (R && T) m = 'crop-tr'; else if (L && B) m = 'crop-bl'; else if (R && B) m = 'crop-br';
      else if (L && inY) m = 'crop-l'; else if (R && inY) m = 'crop-r'; else if (T && inX) m = 'crop-t'; else if (B && inX) m = 'crop-b';
      else if (x > cx && x < cx + w && y > cy && y < cy + ch) m = 'crop-move';
      return { mode: m, sx: x, sy: y, r0: { ...cr } };
    }
    function cropMove(x, y) {
      const m = g.mode, r0 = g.r0, W = base.width, H = base.height, minS = Math.max(24, Math.min(W, H) * 0.05);
      if (m === 'crop-none') return;
      if (m === 'crop-move') { cr.x = clamp(r0.x + x - g.sx, 0, W - r0.w); cr.y = clamp(r0.y + y - g.sy, 0, H - r0.h); drawOv(); return; }
      const s = m.slice(5);
      let l = r0.x, t = r0.y, r = r0.x + r0.w, b = r0.y + r0.h;
      if (s.includes('l')) l = clamp(x, 0, r - minS);
      if (s.includes('r')) r = clamp(x, l + minS, W);
      if (s.includes('t')) t = clamp(y, 0, b - minS);
      if (s.includes('b')) b = clamp(y, t + minS, H);
      if (aspect) {
        let w = r - l, ch = b - t;
        const hz = /[lr]/.test(s), vt = /[tb]/.test(s);
        if (hz && vt) { if (w / ch > aspect) w = ch * aspect; else ch = w / aspect; if (s.includes('l')) l = r - w; else r = l + w; if (s.includes('t')) t = b - ch; else b = t + ch; }
        else if (hz) { ch = w / aspect; const cy = (t + b) / 2; t = cy - ch / 2; b = cy + ch / 2; }
        else { w = ch * aspect; const cx = (l + r) / 2; l = cx - w / 2; r = cx + w / 2; }
        if (l < -0.5 || t < -0.5 || r > W + 0.5 || b > H + 0.5 || r - l < minS || b - t < minS) return;
      }
      cr = { x: l, y: t, w: r - l, h: b - t }; drawOv();
    }
    function eraseAt(x, y, gg) {
      const rad = kd() * 18, before = strokes.length;
      strokes = strokes.filter(s => !strokeHit(s, x, y, rad + s.size / 2));
      if (strokes.length !== before) { gg.n += before - strokes.length; draw(); }
    }
    ov.addEventListener('pointerdown', e => {
      ov.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, pt(e));
      const [x, y] = pt(e);
      if (ptrs.size === 2) {
        const l = getSel();
        if ((tool === 'text' || tool === 'sticker') && l) {
          const [a, b] = [...ptrs.values()];
          g = { mode: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, a0: Math.atan2(b[1] - a[1], b[0] - a[0]), s0: l.size, r0: l.rot, l };
        }
        return;
      }
      if (ptrs.size > 1) return;
      if (tool === 'draw') {
        if (dtool === 'eraser') { g = { mode: 'erase', n: 0 }; eraseAt(x, y, g); }
        else { const s = { k: dtool, color: dcolor, size: dsize * longEdge() / 1000, pts: [[x, y]] }; strokes.push(s); g = { mode: 'draw', s }; draw(); }
      } else if (tool === 'crop' && cr) g = cropDown(x, y);
      else if (tool === 'text' || tool === 'sticker') {
        const l = [...layers].reverse().find(q => hitLayer(q, x, y)), was = sel;
        sel = l ? l.id : null;
        g = { mode: 'move', l, ox: l ? l.x - x : 0, oy: l ? l.y - y : 0, moved: false, was };
        drawOv();
      }
    });
    ov.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId) || !g) return;
      ptrs.set(e.pointerId, pt(e));
      const [x, y] = pt(e);
      if (g.mode === 'pinch') {
        if (ptrs.size < 2) return;
        const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        g.l.size = clamp(g.s0 * d / g.d0, longEdge() * 0.01, longEdge() * 0.6); g.l.rot = g.r0 + (ang - g.a0) * 180 / Math.PI;
        draw(); return;
      }
      if (g.mode === 'draw') { const s = g.s; if (s.k === 'pen' || s.k === 'marker') s.pts.push([x, y]); else s.pts[1] = [x, y]; draw(); }
      else if (g.mode === 'erase') eraseAt(x, y, g);
      else if (g.mode === 'move' && g.l) { g.moved = true; g.l.x = clamp(x + g.ox, 0, base.width); g.l.y = clamp(y + g.oy, 0, base.height); draw(); }
      else if (g.mode.startsWith('crop')) cropMove(x, y);
    });
    const up = e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (!g) return;
      if (g.mode === 'pinch') { if (ptrs.size < 2) { commit(); g = null; drawPanel(); draw(); } return; }
      if (ptrs.size > 0) return;
      const m = g; g = null;
      if (m.mode === 'draw') { if (m.s.k !== 'pen' && m.s.k !== 'marker' && m.s.pts.length < 2) strokes.pop(); else commit(); }
      else if (m.mode === 'erase') { if (m.n) commit(); }
      else if (m.mode === 'move') {
        if (m.moved) commit();
        if (m.l && !m.moved && m.was === m.l.id && m.l.type === 'text') editText(m.l);
        drawPanel(); drawOv();
      }
      draw();
    };
    ov.addEventListener('pointerup', up);
    ov.addEventListener('pointercancel', up);

    /* save / close */
    function saveSheet() {
      sheet('Save', [
        { icon: 'plus', label: 'Save as copy', fn: () => commitSave(true) },
        { icon: 'edit', label: 'Replace original', fn: () => commitSave(false) }
      ]);
    }
    async function commitSave(copy) {
      const t = toast('Saving…', true);
      try {
        const out = process(base, params()), x = out.getContext('2d');
        x.save(); paintOverlays(x); x.restore();
        const nb = await new Promise(ok => out.toBlob(ok, 'image/jpeg', 0.92));
        if (!nb) throw new Error('encode');
        const th = await coverBlob(out, out.width, out.height);
        const baseName = it.name.replace(/\.[^.]+$/, '');
        let target = it;
        if (copy) { target = { ...it, id: uid(), name: baseName + '_edited.jpg', date: Date.now(), added: Date.now(), fav: false, deleted: 0 }; S.items.push(target); }
        else { target.name = /\.jpe?g$/i.test(it.name) ? it.name : baseName + '.jpg'; dropURLs(it.id); }
        Object.assign(target, { type: 'image/jpeg', size: nb.size, w: out.width, h: out.height, video: false, dur: 0 });
        await txn(['items', 'blobs', 'thumbs'], 'readwrite', tx => { tx.objectStore('items').put(target, target.id); tx.objectStore('blobs').put(nb, target.id); tx.objectStore('thumbs').put(th, target.id); });
        refresh(); t.hide(); toast(copy ? 'Saved as copy' : 'Saved');
        force = true; back(); setTimeout(() => done && done(), 80);
      } catch (e) {
        t.hide(); toast(e && e.name === 'QuotaExceededError' ? 'Not enough storage space' : "Couldn't save the picture");
      }
    }
    function onPop() {
      if (dirty() && !force) {
        pushLayer(onPop);
        setTimeout(async () => {
          const ok = await dialog({ title: 'Discard changes?', text: 'Your edits to this picture will be lost.', ok: 'Discard', cancel: 'Keep editing', danger: true });
          if (ok) { force = true; back(); }
        }, 0);
        return;
      }
      cancelAnimationFrame(raf); ro.disconnect(); root.remove();
    }
    pushLayer(onPop);

    rebuildPrev(); setTool('adjust'); updUndo();
  }
  window.openEditor = openEditor;
})();
