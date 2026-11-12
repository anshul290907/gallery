'use strict';
/* =============== helpers =============== */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const P = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  more: '<circle cx="12" cy="5" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.7" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  heartf: '<path fill="currentColor" d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  edit: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1z"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10.5 11v5.5M13.5 11v5.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
  pics: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  albums: '<rect x="3.5" y="7" width="17" height="13" rx="3"/><path d="M6.5 4.5h11"/>',
  stories: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  rotate: '<path d="M5 9a7.5 7.5 0 1 1-.5 6"/><path d="M5 4v5h5"/>',
  flip: '<path d="M12 4v16M8 7L3.5 17H8zM16 7l4.5 10H16z"/>',
  sliders: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  restore: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5"/>',
  select: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l3 3 5-6"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  storage: '<ellipse cx="12" cy="6.5" rx="7.5" ry="3"/><path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
  download: '<path d="M12 4v11M7.5 11L12 15.5 16.5 11M5 19.5h14"/>',
  slideshow: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M10 9.5l4.5 2.5-4.5 2.5z"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'
};
const ic = (n, s = 24) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;
function icon(n, s) { const w = document.createElement('span'); w.className = 'ic'; w.innerHTML = ic(n, s); return w; }
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  props = props || {};
  for (const k in props) {
    const v = props[k];
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

/* =============== dates / formats =============== */
const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
const monthKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + d.getMonth(); };
function dayLabel(ts) {
  const d = new Date(ts), n = new Date(), k = dayKey(ts);
  if (k === dayKey(n)) return 'Today';
  const y = new Date(n); y.setDate(n.getDate() - 1);
  if (k === dayKey(y)) return 'Yesterday';
  const o = { weekday: 'short', month: 'short', day: 'numeric' };
  if (d.getFullYear() !== n.getFullYear()) o.year = 'numeric';
  return d.toLocaleDateString(undefined, o);
}
const timeLabel = ts => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const fmtDur = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtSize = b => b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';
const daysLeft = it => { const d = 30 - Math.floor((Date.now() - it.deleted) / 864e5); return Math.max(0, d) + ' days'; };

/* =============== database =============== */
let db;
const S = { items: [], map: new Map(), albums: [], settings: { theme: 'system', cols: 3 }, tab: 'pictures' };
const openDB = () => new Promise((ok, no) => {
  const r = indexedDB.open('gallery', 1);
  r.onupgradeneeded = () => { ['items', 'blobs', 'thumbs', 'meta'].forEach(s => r.result.createObjectStore(s)); };
  r.onsuccess = () => ok(r.result);
  r.onerror = () => no(r.error);
});
const txn = (stores, mode, fn) => new Promise((ok, no) => {
  const t = db.transaction(stores, mode);
  let out;
  try { out = fn(t); } catch (e) { no(e); return; }
  t.oncomplete = () => ok(out && out.result);
  t.onerror = () => no(t.error);
  t.onabort = () => no(t.error);
});
const saveMeta = (k, v) => txn('meta', 'readwrite', t => t.objectStore('meta').put(v, k));
const saveSettings = () => saveMeta('settings', S.settings);
const getBlob = id => txn('blobs', 'readonly', t => t.objectStore('blobs').get(id));
const saveItems = its => txn('items', 'readwrite', t => its.forEach(i => t.objectStore('items').put(i, i.id)));

const tcache = new Map(), ucache = new Map();
async function thumbURL(id) {
  if (tcache.has(id)) return tcache.get(id);
  const b = await txn('thumbs', 'readonly', t => t.objectStore('thumbs').get(id));
  const u = b ? URL.createObjectURL(b) : '';
  tcache.set(id, u);
  return u;
}
async function mediaURL(id) {
  if (ucache.has(id)) return ucache.get(id);
  const b = await getBlob(id);
  const u = b ? URL.createObjectURL(b) : '';
  ucache.set(id, u);
  if (ucache.size > 10) { const k = ucache.keys().next().value; URL.revokeObjectURL(ucache.get(k)); ucache.delete(k); }
  return u;
}
function dropURLs(id) {
  if (tcache.has(id)) { URL.revokeObjectURL(tcache.get(id)); tcache.delete(id); }
  if (ucache.has(id)) { URL.revokeObjectURL(ucache.get(id)); ucache.delete(id); }
}

async function loadAll() {
  S.items = await txn('items', 'readonly', t => t.objectStore('items').getAll());
  S.albums = (await txn('meta', 'readonly', t => t.objectStore('meta').get('albums'))) || [];
  const st = await txn('meta', 'readonly', t => t.objectStore('meta').get('settings'));
  if (st) Object.assign(S.settings, st);
  reindex();
  const old = S.items.filter(i => i.deleted && Date.now() - i.deleted > 30 * 864e5).map(i => i.id);
  if (old.length) await permDelete(old, true);
}
function reindex() {
  S.items.sort((a, b) => b.date - a.date);
  S.map = new Map(S.items.map(i => [i.id, i]));
}
async function mutate(ids, fn) {
  const arr = ids.map(id => S.map.get(id)).filter(Boolean);
  arr.forEach(fn);
  await saveItems(arr);
  refresh();
}
async function permDelete(ids, silent) {
  await txn(['items', 'blobs', 'thumbs'], 'readwrite', t => ids.forEach(id => { t.objectStore('items').delete(id); t.objectStore('blobs').delete(id); t.objectStore('thumbs').delete(id); }));
  ids.forEach(dropURLs);
  const set = new Set(ids);
  S.items = S.items.filter(i => !set.has(i.id));
  reindex();
  if (!silent) refresh();
}

/* =============== import =============== */
const loadImage = url => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
const loadVideo = url => new Promise((ok, no) => {
  const v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.preload = 'metadata';
  v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 0) / 2); };
  v.onseeked = () => ok(v);
  v.onerror = no;
  v.src = url;
  setTimeout(() => no(new Error('timeout')), 8000);
});
function coverBlob(src, sw, sh, size = 360) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const r = Math.max(size / sw, size / sh), w = sw * r, hh = sh * r;
  x.drawImage(src, (size - w) / 2, (size - hh) / 2, w, hh);
  return new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.82));
}
async function analyze(file) {
  const video = file.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|3gp)$/i.test(file.name);
  const url = URL.createObjectURL(file);
  try {
    if (video) { const v = await loadVideo(url); return { video, w: v.videoWidth, h: v.videoHeight, dur: v.duration, thumb: await coverBlob(v, v.videoWidth, v.videoHeight) }; }
    const i = await loadImage(url);
    return { video, w: i.naturalWidth, h: i.naturalHeight, dur: 0, thumb: await coverBlob(i, i.naturalWidth, i.naturalHeight) };
  } catch (e) { return { video, w: 0, h: 0, dur: 0, thumb: null }; }
  finally { URL.revokeObjectURL(url); }
}
async function importFiles(files) {
  files = [...files].filter(f => /^(image|video)\//.test(f.type) || /\.(jpe?g|png|gif|webp|heic|heif|bmp|mp4|mov|mkv|webm|3gp)$/i.test(f.name));
  if (!files.length) return toast('No photos or videos selected');
  const t = toast('', true);
  let n = 0, added = 0;
  try {
    for (const f of files) {
      t.set('Adding ' + (++n) + ' of ' + files.length + '…');
      if (S.items.some(i => i.name === f.name && i.size === f.size && i.date === f.lastModified)) continue;
      const a = await analyze(f);
      const id = uid();
      const it = { id, name: f.name, type: f.type || (a.video ? 'video/mp4' : 'image/jpeg'), size: f.size, date: f.lastModified || Date.now(), added: Date.now(), w: a.w, h: a.h, video: a.video, dur: a.dur || 0, album: /screenshot/i.test(f.name) ? 'Screenshots' : 'Camera', fav: false, deleted: 0 };
      await txn(['items', 'blobs', 'thumbs'], 'readwrite', tx => { tx.objectStore('items').put(it, id); tx.objectStore('blobs').put(f, id); if (a.thumb) tx.objectStore('thumbs').put(a.thumb, id); });
      S.items.push(it); S.map.set(id, it); added++;
      if (n % 8 === 0) refresh();
    }
  } catch (e) {
    t.hide();
    toast(e && e.name === 'QuotaExceededError' ? 'Not enough storage space' : 'Something went wrong while adding');
    refresh();
    return;
  }
  refresh();
  t.hide();
  setTimeout(() => toast(added ? 'Added ' + added + (added === 1 ? ' item' : ' items') : 'Already in Gallery'), 700);
}

/* =============== toast / layers / sheets / dialogs =============== */
let tEl, tT;
function toast(msg, sticky) {
  if (!tEl) { tEl = h('div', { class: 'toast' }); document.body.append(tEl); }
  tEl.textContent = msg; tEl.classList.add('on'); clearTimeout(tT);
  if (!sticky) tT = setTimeout(() => tEl.classList.remove('on'), 2600);
  return { set: m => { tEl.textContent = m; }, hide: () => { clearTimeout(tT); tT = setTimeout(() => tEl.classList.remove('on'), 500); } };
}
const layers = [];
function pushLayer(close) { layers.push(close); history.pushState({ d: layers.length }, ''); }
addEventListener('popstate', () => { const c = layers.pop(); if (c) c(); });
const back = () => history.back();

function Screen(el, onClose) {
  const s = h('div', { class: 'screen' }, el);
  document.body.append(s);
  pushLayer(() => { s.classList.add('out'); setTimeout(() => { s.remove(); if (onClose) onClose(); }, 190); });
  return s;
}
function sheet(title, items, onDismiss) {
  const ov = h('div', { class: 'overlay' });
  const sh = h('div', { class: 'sheet' });
  let after = null;
  if (title) sh.append(h('div', { class: 'sh-t' }, title));
  items.forEach(it => {
    if (it.fn) sh.append(h('button', { class: 'srow' + (it.danger ? ' danger' : ''), onclick: () => { after = it.fn; back(); } }, it.icon ? icon(it.icon) : null, it.label));
    else sh.append(h('div', { class: 'irow' }, h('small', {}, it.label), h('div', {}, it.value)));
  });
  ov.append(sh); document.body.append(ov);
  ov.addEventListener('click', e => { if (e.target === ov) back(); });
  pushLayer(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 170); setTimeout(() => { if (after) after(); else if (onDismiss) onDismiss(); }, 0); });
}
function dialog({ title, text, ok = 'OK', cancel = 'Cancel', input, danger, multiline, placeholder }) {
  return new Promise(res => {
    const ov = h('div', { class: 'overlay mid' });
    const inp = input != null ? (multiline ? h('textarea', { class: 'dinput', rows: '3', placeholder: placeholder || 'Type here', style: 'height:96px;padding:10px 14px;resize:none;line-height:1.3' }) : h('input', { class: 'dinput', value: input, placeholder: placeholder || 'Album name', maxlength: '40' })) : null;
    if (inp && multiline) inp.value = input;
    let result = null;
    const box = h('div', { class: 'dialog' },
      h('div', { class: 'dt' }, title), text ? h('div', { class: 'dx' }, text) : null, inp,
      h('div', { class: 'db' },
        h('button', { onclick: () => back() }, cancel),
        h('button', { class: danger ? 'danger' : 'pri', onclick: () => { result = inp ? (inp.value.trim() || null) : true; back(); } }, ok)));
    ov.append(box); document.body.append(ov);
    ov.addEventListener('click', e => { if (e.target === ov) back(); });
    pushLayer(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 170); setTimeout(() => res(result), 0); });
    if (inp) setTimeout(() => { inp.focus(); inp.select(); }, 80);
  });
}
const askName = (title, v) => dialog({ title, input: v || '', ok: 'Create' });

/* =============== albums =============== */
function albumDefs() {
  const vis = S.items.filter(i => !i.deleted);
  const names = ['Camera', ...S.albums.filter(a => a !== 'Camera')];
  const out = names.map(n => ({ name: n, filter: i => i.album === n, user: n !== 'Camera' }));
  if (vis.some(i => i.album === 'Screenshots') && !names.includes('Screenshots')) out.splice(1, 0, { name: 'Screenshots', filter: i => i.album === 'Screenshots', user: false });
  out.push({ name: 'Videos', filter: i => i.video, virtual: true, hide: !vis.some(i => i.video) });
  out.push({ name: 'Favorites', filter: i => i.fav, virtual: true });
  return out.filter(a => !a.hide).map(a => ({ ...a, items: vis.filter(a.filter) }));
}
const allAlbumNames = () => ['Camera', ...new Set([...S.albums, ...S.items.map(i => i.album)])].filter((v, i, a) => a.indexOf(v) === i);
async function addAlbum(n) {
  if (allAlbumNames().some(a => a.toLowerCase() === n.toLowerCase())) { toast('That album already exists'); return; }
  S.albums.push(n); await saveMeta('albums', S.albums); refresh();
}
function pickAlbum() {
  return new Promise(res => {
    sheet('Move to album', [
      ...allAlbumNames().map(n => ({ icon: 'folder', label: n, fn: () => res(n) })),
      { icon: 'plus', label: 'Create album', fn: async () => { const n = await askName('Create album'); if (n) { await addAlbum(n); res(n); } else res(null); } }
    ], () => res(null));
  });
}
async function moveTo(ids) {
  const a = await pickAlbum();
  if (!a) return false;
  await mutate(ids, i => { i.album = a; });
  toast('Moved to ' + a);
  return true;
}
async function shareItems(its) {
  try {
    const files = [];
    for (const it of its) { const b = await getBlob(it.id); if (b) files.push(new File([b], it.name, { type: it.type || b.type })); }
    if (navigator.canShare && navigator.canShare({ files })) await navigator.share({ files });
    else toast('Sharing is not supported here');
  } catch (e) { if (e.name !== 'AbortError') toast("Couldn't share"); }
}
async function exportItem(it) {
  const b = await getBlob(it.id); if (!b) return;
  const u = URL.createObjectURL(b);
  const a = h('a', { href: u, download: it.name }); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
  toast('Saved to Downloads');
}
function infoSheet(it) {
  sheet('Details', [
    { label: 'File name', value: it.name },
    { label: 'Date', value: new Date(it.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ', ' + timeLabel(it.date) },
    { label: 'Resolution', value: it.w ? it.w + ' × ' + it.h + (it.w * it.h > 1e5 ? '  (' + (it.w * it.h / 1e6).toFixed(1) + ' MP)' : '') : 'Unknown' },
    { label: it.video ? 'Length' : 'Type', value: it.video ? fmtDur(it.dur) : (it.type || 'image') },
    { label: 'Size', value: fmtSize(it.size) },
    { label: 'Album', value: it.album }
  ]);
}

/* =============== Browser (grid with selection) =============== */
const live = new Set();
function emptyState(msg, sub, btn) {
  return h('div', { class: 'empty' }, icon('pics', 56), h('div', { class: 'big' }, msg), sub ? h('div', {}, sub) : null, btn || null);
}
const addBtn = () => h('button', { class: 'pill', onclick: () => $('#file').click() }, 'Add photos & videos');

function Browser(o) {
  const el = h('div', { class: 'col' });
  const head = h('div', { class: 'head' });
  const scroller = h('div', { class: 'scroll' });
  const selbar = h('div', { class: 'selbar' });
  el.append(head);
  if (o.sub) el.append(o.sub);
  el.append(scroller, selbar);
  if (o.fab) el.append(h('button', { class: 'fab', onclick: () => $('#file').click() }, icon('plus', 26)));
  const sel = new Set(); let selecting = false, list = [], cols = S.settings.cols;
  const tiles = new Map();
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) {
      io.unobserve(e.target);
      const t = e.target;
      thumbURL(t.dataset.id).then(u => { if (u) { const im = t.firstChild; im.onload = () => im.classList.add('ld'); im.src = u; } });
    }
  }, { root: scroller, rootMargin: '800px 0px' });
  const api = { el, redraw, destroy, enterSel, list: () => list };

  function drawHead() {
    head.innerHTML = '';
    if (selecting) {
      head.append(h('button', { class: 'ib', onclick: () => exitSel() }, icon('close')),
        h('div', { class: 'ttl' }, sel.size ? sel.size + ' selected' : 'Select items'),
        h('button', { class: 'allb', onclick: toggleAll }, h('div', { class: 'circ' + (list.length && sel.size === list.length ? ' on' : '') }, icon('check', 14))));
    } else {
      if (o.back) head.append(h('button', { class: 'ib', onclick: back }, icon('back')));
      if (o.title instanceof Node) head.append(o.title);
      else head.append(h('div', { class: 'ttl' }, typeof o.title === 'function' ? o.title(list) : o.title));
      (o.actions || []).forEach(a => head.append(h('button', { class: 'ib', onclick: e => a.fn(e, api) }, icon(a.icon))));
    }
  }
  function drawSel() {
    selbar.innerHTML = '';
    const d = !sel.size;
    const acts = o.trash
      ? [['restore', 'Restore', restoreSel], ['trash', 'Delete', delForever]]
      : [['share', 'Share', shareSel], ['trash', 'Delete', delSel], ['folder', 'Move', moveSel], ['heart', 'Favorite', favSel]];
    acts.forEach(([i, l, f]) => selbar.append(h('button', { class: 'sb', disabled: d, onclick: f }, icon(i), h('span', {}, l))));
  }
  function tile(it, i) {
    const t = h('div', { class: 'tile', 'data-id': it.id }, h('img', { alt: '', draggable: 'false' }));
    if (it.video) t.append(h('div', { class: 'vb' }, icon('play', 12), it.dur ? fmtDur(it.dur) : ''));
    if (it.fav && !o.trash) t.append(h('div', { class: 'fv' }, icon('heartf', 14)));
    if (o.trash) t.append(h('div', { class: 'dl' }, daysLeft(it)));
    t.append(h('div', { class: 'ck' }, icon('check', 14)));
    if (sel.has(it.id)) t.classList.add('sel');
    io.observe(t);
    let timer, sx = 0, sy = 0, moved = false, fired = false;
    t.addEventListener('pointerdown', e => {
      moved = false; fired = false; sx = e.clientX; sy = e.clientY;
      clearTimeout(timer);
      timer = setTimeout(() => { if (moved || o.noSel) return; fired = true; if (navigator.vibrate) navigator.vibrate(12); if (!selecting) enterSel(); toggle(it.id); }, 420);
    });
    t.addEventListener('pointermove', e => { if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) { moved = true; clearTimeout(timer); } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => t.addEventListener(n, () => clearTimeout(timer)));
    t.addEventListener('contextmenu', e => e.preventDefault());
    t.addEventListener('click', () => {
      if (fired) { fired = false; return; }
      if (selecting) toggle(it.id); else openViewer(list, i, { trash: o.trash, rect: t.getBoundingClientRect() });
    });
    tiles.set(it.id, t);
    return t;
  }
  function draw() {
    io.disconnect(); tiles.clear(); scroller.innerHTML = '';
    if (!list.length) { scroller.append(o.empty ? o.empty() : emptyState('No pictures')); return; }
    let cur = null, grid = null, sec = null;
    list.forEach((it, i) => {
      if (o.group !== false) {
        const k = dayKey(it.date);
        if (k !== cur) {
          cur = k; sec = h('div', { class: 'sec' }, h('div', { class: 'dhead' }, dayLabel(it.date)));
          grid = h('div', { class: 'grid' }); grid.style.setProperty('--c', cols); sec.append(grid); scroller.append(sec);
        }
      } else if (!grid) { grid = h('div', { class: 'grid' }); grid.style.setProperty('--c', cols); scroller.append(grid); }
      grid.append(tile(it, i));
    });
  }
  function redraw() {
    const st = scroller.scrollTop;
    list = o.getList();
    for (const id of [...sel]) if (!list.some(i => i.id === id)) sel.delete(id);
    draw();
    if (!(o.title instanceof Node)) drawHead();
    if (selecting) drawSel();
    scroller.scrollTop = st;
  }
  function toggle(id) {
    if (sel.has(id)) sel.delete(id); else sel.add(id);
    const t = tiles.get(id); if (t) t.classList.toggle('sel', sel.has(id));
    drawHead(); drawSel();
  }
  function toggleAll() {
    if (sel.size === list.length) sel.clear(); else list.forEach(i => sel.add(i.id));
    tiles.forEach((t, id) => t.classList.toggle('sel', sel.has(id)));
    drawHead(); drawSel();
  }
  function enterSel() {
    if (selecting || o.noSel) return;
    selecting = true; el.classList.add('selecting'); document.body.classList.add('selecting');
    pushLayer(() => exitSel(true));
    drawHead(); drawSel();
  }
  function exitSel(fromPop) {
    if (!selecting) return;
    selecting = false; sel.clear();
    el.classList.remove('selecting'); document.body.classList.remove('selecting');
    tiles.forEach(t => t.classList.remove('sel'));
    drawHead();
    if (!fromPop) back();
  }
  const ids = () => [...sel];
  const picked = () => ids().map(id => S.map.get(id)).filter(Boolean);
  async function delSel() {
    const n = sel.size; if (!n) return;
    const ok = await dialog({ title: 'Move ' + (n === 1 ? 'this item' : n + ' items') + ' to Recently deleted?', text: 'Items are permanently deleted after 30 days.', ok: 'Move' });
    if (!ok) return;
    await mutate(ids(), i => { i.deleted = Date.now(); });
    exitSel(); toast('Moved to Recently deleted');
  }
  async function delForever() {
    const n = sel.size; if (!n) return;
    const ok = await dialog({ title: 'Delete ' + (n === 1 ? 'this item' : n + ' items') + ' permanently?', text: "This can't be undone.", ok: 'Delete', danger: true });
    if (!ok) return;
    await permDelete(ids()); exitSel(); toast('Deleted');
  }
  async function restoreSel() { if (!sel.size) return; await mutate(ids(), i => { i.deleted = 0; }); exitSel(); toast('Restored'); }
  async function favSel() {
    const its = picked(); if (!its.length) return;
    const all = its.every(i => i.fav);
    await mutate(ids(), i => { i.fav = !all; });
    exitSel(); toast(all ? 'Removed from Favorites' : 'Added to Favorites');
  }
  async function moveSel() { if (!sel.size) return; if (await moveTo(ids())) exitSel(); }
  async function shareSel() { if (sel.size) await shareItems(picked()); }

  let pd = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const setCols = n => { cols = n; S.settings.cols = n; saveSettings(); scroller.querySelectorAll('.grid').forEach(g => g.style.setProperty('--c', n)); };
  scroller.addEventListener('touchstart', e => { pd = e.touches.length === 2 ? dist(e.touches) : 0; }, { passive: true });
  scroller.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !pd) return;
    e.preventDefault();
    const r = dist(e.touches) / pd;
    if (r > 1.3 && cols > 2) { setCols(cols - 1); pd = dist(e.touches); }
    else if (r < 0.75 && cols < 6) { setCols(cols + 1); pd = dist(e.touches); }
  }, { passive: false });
  scroller.addEventListener('touchend', () => { pd = 0; });

  function destroy() { io.disconnect(); live.delete(api); if (selecting) { document.body.classList.remove('selecting'); } }
  live.add(api);
  list = o.getList(); draw(); drawHead(); drawSel();
  return api;
}

/* =============== pages =============== */
function PicturesPage() {
  const api = Browser({
    title: 'Pictures', fab: true,
    getList: () => S.items.filter(i => !i.deleted),
    empty: () => emptyState('No pictures yet', "Add photos and videos from your phone. They're saved inside this app and work offline.", addBtn()),
    actions: [{ icon: 'search', fn: () => openSearch() }, { icon: 'more', fn: (e, a) => picMenu(a) }]
  });
  return api;
}
function picMenu(a) {
  sheet('', [
    { icon: 'select', label: 'Select', fn: () => a.enterSel() },
    { icon: 'plus', label: 'Add photos & videos', fn: () => $('#file').click() },
    { icon: 'folder', label: 'Create album', fn: async () => { const n = await askName('Create album'); if (n) addAlbum(n); } },
    { icon: 'trash', label: 'Recently deleted', fn: () => openTrash() }
  ]);
}

function AlbumsPage() {
  const el = h('div', { class: 'col' });
  const head = h('div', { class: 'head' }, h('div', { class: 'ttl' }, 'Albums'),
    h('button', { class: 'ib', onclick: () => openSearch() }, icon('search')),
    h('button', { class: 'ib', onclick: async () => { const n = await askName('Create album'); if (n) addAlbum(n); } }, icon('plus')));
  const sc = h('div', { class: 'scroll' });
  el.append(head, sc);
  const api = { el, redraw: draw, destroy: () => live.delete(api) };
  function draw() {
    sc.innerHTML = '';
    const g = h('div', { class: 'agrid' });
    albumDefs().forEach(a => {
      const cv = h('div', { class: 'cover' });
      if (a.items[0]) { const im = h('img', { alt: '' }); cv.append(im); thumbURL(a.items[0].id).then(u => { if (u) { im.onload = () => im.classList.add('ld'); im.src = u; } }); }
      else cv.append(icon('pics', 40));
      g.append(h('div', { onclick: () => openAlbum(a) }, cv, h('div', { class: 'an' }, a.name), h('div', { class: 'ac' }, String(a.items.length))));
    });
    sc.append(g);
    const dead = S.items.filter(i => i.deleted).length;
    sc.append(h('button', { class: 'arow', onclick: () => openTrash() }, icon('trash'), h('span', {}, 'Recently deleted'), h('span', { class: 'sub' }, String(dead))));
  }
  live.add(api); draw();
  return api;
}
function openAlbum(a) {
  const get = () => S.items.filter(i => !i.deleted && a.filter(i));
  const api = Browser({
    title: () => a.name, back: true, getList: get,
    empty: () => emptyState('No pictures', 'Move items here from the Pictures tab.'),
    actions: [{ icon: 'more', fn: (e, ap) => {
      const items = [{ icon: 'select', label: 'Select', fn: () => ap.enterSel() }];
      if (a.user) items.push(
        { icon: 'edit', label: 'Rename album', fn: async () => {
          const n = await dialog({ title: 'Rename album', input: a.name, ok: 'Rename' });
          if (!n || n === a.name) return;
          if (allAlbumNames().some(x => x.toLowerCase() === n.toLowerCase())) return toast('That album already exists');
          S.albums = S.albums.map(x => x === a.name ? n : x);
          await saveMeta('albums', S.albums);
          const its = S.items.filter(i => i.album === a.name);
          its.forEach(i => { i.album = n; }); await saveItems(its);
          a.name = n; a.filter = i => i.album === n; refresh(); toast('Album renamed');
        } },
        { icon: 'trash', label: 'Delete album', danger: true, fn: async () => {
          const ok = await dialog({ title: 'Delete album "' + a.name + '"?', text: 'Pictures inside move back to Camera.', ok: 'Delete', danger: true });
          if (!ok) return;
          const its = S.items.filter(i => i.album === a.name);
          its.forEach(i => { i.album = 'Camera'; }); await saveItems(its);
          S.albums = S.albums.filter(x => x !== a.name); await saveMeta('albums', S.albums);
          back(); refresh();
        } });
      sheet('', items);
    } }]
  });
  Screen(api.el, () => api.destroy());
}
function openTrash() {
  const api = Browser({
    title: 'Recently deleted', back: true, trash: true, group: false,
    getList: () => S.items.filter(i => i.deleted).sort((a, b) => b.deleted - a.deleted),
    empty: () => emptyState('Nothing here', 'Deleted items stay for 30 days before being removed.'),
    actions: [{ icon: 'more', fn: (e, ap) => sheet('', [
      { icon: 'select', label: 'Select', fn: () => ap.enterSel() },
      { icon: 'trash', label: 'Empty', danger: true, fn: async () => {
        const dead = S.items.filter(i => i.deleted).map(i => i.id); if (!dead.length) return;
        const ok = await dialog({ title: 'Delete all ' + dead.length + ' items permanently?', text: "This can't be undone.", ok: 'Delete', danger: true });
        if (ok) { await permDelete(dead); toast('Deleted'); }
      } }
    ]) }]
  });
  Screen(api.el, () => api.destroy());
}

function StoriesPage() {
  const el = h('div', { class: 'col' });
  const head = h('div', { class: 'head' }, h('div', { class: 'ttl' }, 'Stories'), h('button', { class: 'ib', onclick: () => openSearch() }, icon('search')));
  const sc = h('div', { class: 'scroll' });
  el.append(head, sc);
  const api = { el, redraw: draw, destroy: () => live.delete(api) };
  function draw() {
    sc.innerHTML = '';
    const vis = S.items.filter(i => !i.deleted);
    if (!vis.length) { sc.append(emptyState('No stories yet', 'Stories are made automatically from your pictures, grouped by month.')); return; }
    const groups = new Map();
    vis.forEach(i => { const k = monthKey(i.date); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); });
    const g = h('div', { class: 'sgrid' });
    groups.forEach(list => {
      const title = new Date(list[0].date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const cover = list[Math.floor(list.length / 2)];
      const im = h('img', { alt: '' });
      thumbURL(cover.id).then(u => { if (u) { im.onload = () => im.classList.add('ld'); im.src = u; } });
      g.append(h('div', { class: 'scard', onclick: () => openStory(title, list) }, im, h('div', { class: 'st' }, title, h('small', {}, list.length + (list.length === 1 ? ' item' : ' items')))));
    });
    sc.append(g);
  }
  live.add(api); draw();
  return api;
}
function openStory(title, list) {
  const its = [...list].sort((a, b) => a.date - b.date).slice(0, 60);
  let i = 0, timer;
  const stage = h('div', { class: 'sstage' });
  const bars = h('div', { class: 'sbars' }, ...its.map(() => h('i', {}, h('b'))));
  const root = h('div', { class: 'story' }, stage, bars, h('div', { class: 'scap' }, h('div', { class: 't1' }, title)), h('button', { class: 'ib sx', onclick: () => back() }, icon('close')));
  document.body.append(root);
  async function show() {
    clearTimeout(timer);
    [...bars.children].forEach((c, k) => { c.className = k < i ? 'done' : k === i ? 'cur' : ''; });
    const it = its[i];
    const u = it.video ? await thumbURL(it.id) : await mediaURL(it.id);
    if (!root.isConnected) return;
    const im = h('img', { src: u || '', alt: '' });
    stage.append(im);
    setTimeout(() => { while (stage.children.length > 1) stage.firstChild.remove(); }, 520);
    timer = setTimeout(next, 3200);
  }
  function next() { if (i >= its.length - 1) { back(); return; } i++; show(); }
  stage.addEventListener('click', e => { if (e.clientX < innerWidth * 0.3) { if (i > 0) { i--; show(); } } else next(); });
  pushLayer(() => { clearTimeout(timer); root.remove(); });
  show();
}

function MenuPage() {
  const el = h('div', { class: 'col' });
  el.append(h('div', { class: 'head' }, h('div', { class: 'ttl' }, 'Menu')));
  const sc = h('div', { class: 'scroll' });
  el.append(sc);
  const api = { el, redraw: draw, destroy: () => live.delete(api) };
  const row = (i, t, s, fn, cls) => h('button', { class: 'mrow ' + (cls || ''), onclick: fn }, h('span', { class: 'bub' }, icon(i)), h('span', { class: 'mt' }, t, s != null ? h('span', { class: 'sub', 'data-s': '1' }, s) : null));
  const themeName = { system: 'System default', light: 'Light', dark: 'Dark' };
  function draw() {
    sc.innerHTML = '';
    const dead = S.items.filter(i => i.deleted).length;
    const storageRow = row('storage', 'Storage', 'Calculating…', () => {});
    sc.append(
      row('trash', 'Recently deleted', dead + (dead === 1 ? ' item' : ' items'), () => openTrash()),
      row('plus', 'Add photos & videos', 'Import from your phone', () => $('#file').click()),
      h('div', { class: 'msec' }),
      row('moon', 'Theme', themeName[S.settings.theme], () => sheet('Theme', ['system', 'light', 'dark'].map(t => ({ label: themeName[t], icon: t === S.settings.theme ? 'check' : 'moon', fn: () => { S.settings.theme = t; saveSettings(); applyTheme(); draw(); } })))),
      row('grid', 'Pictures grid', S.settings.cols + ' columns (pinch the grid to change)', () => sheet('Columns', [2, 3, 4, 5, 6].map(n => ({ label: n + ' columns', icon: n === S.settings.cols ? 'check' : 'grid', fn: () => { S.settings.cols = n; saveSettings(); location.reload(); } })))),
      storageRow,
      row('phone', 'Install as app', 'Add Gallery to your home screen', installApp),
      h('div', { class: 'msec' }),
      row('trash', 'Erase all Gallery data', 'Removes everything stored by this app', eraseAll, 'danger')
    );
    storageInfo().then(t => { const s = storageRow.querySelector('[data-s]'); if (s) s.textContent = t; });
  }
  live.add(api); draw();
  return api;
}
async function storageInfo() {
  const used = S.items.reduce((a, i) => a + (i.size || 0), 0);
  let free = '';
  try { const e = await navigator.storage.estimate(); if (e.quota) free = ' · ' + fmtSize(e.quota - e.usage) + ' available'; } catch (e) {}
  return S.items.length + ' items · ' + fmtSize(used) + ' used' + free;
}
async function eraseAll() {
  const ok = await dialog({ title: 'Erase all Gallery data?', text: 'All photos and videos stored inside this app will be deleted. Your phone\'s other files are not affected.', ok: 'Erase', danger: true });
  if (!ok) return;
  await txn(['items', 'blobs', 'thumbs', 'meta'], 'readwrite', t => ['items', 'blobs', 'thumbs', 'meta'].forEach(s => t.objectStore(s).clear()));
  location.reload();
}
let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
function installApp() {
  if (matchMedia('(display-mode: standalone)').matches) return toast('Already installed');
  if (deferredInstall) { deferredInstall.prompt(); return; }
  dialog({ title: 'Install Gallery', text: 'In Chrome, tap the ⋮ menu and choose "Install app" (or "Add to Home screen").', ok: 'Got it', cancel: 'Close' });
}

/* =============== search =============== */
function openSearch() {
  let q = '', chip = '';
  const inp = h('input', { class: 'sinput', type: 'search', placeholder: 'Search Gallery' });
  const chipsEl = h('div', { class: 'chips' });
  const names = ['Photos', 'Videos', 'Favorites', ...allAlbumNames()];
  function drawChips() {
    chipsEl.innerHTML = '';
    names.forEach(n => chipsEl.append(h('button', { class: 'chip' + (chip === n ? ' on' : ''), onclick: () => { chip = chip === n ? '' : n; drawChips(); api.redraw(); } }, n)));
  }
  function find() {
    if (!q && !chip) return [];
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return S.items.filter(i => {
      if (i.deleted) return false;
      if (chip === 'Videos' && !i.video) return false;
      if (chip === 'Photos' && i.video) return false;
      if (chip === 'Favorites' && !i.fav) return false;
      if (chip && !['Videos', 'Photos', 'Favorites'].includes(chip) && i.album !== chip) return false;
      if (!words.length) return true;
      const hay = (i.name + ' ' + i.album + ' ' + new Date(i.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })).toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }
  const head = h('div', { style: 'display:flex;align-items:center;gap:8px;flex:1' }, h('button', { class: 'ib', onclick: back }, icon('back')), inp);
  const api = Browser({
    title: head, back: false, sub: chipsEl, getList: find,
    empty: () => emptyState(q || chip ? 'No results' : 'Search your pictures', q || chip ? '' : 'Try a file name, month, weekday or album.')
  });
  inp.addEventListener('input', () => { q = inp.value; api.redraw(); });
  drawChips();
  Screen(api.el, () => api.destroy());
  setTimeout(() => inp.focus(), 250);
}

/* =============== viewer =============== */
function openViewer(list, start, opts) {
  opts = opts || {};
  const ids = list.map(i => i.id); let idx = start;
  const trash = !!opts.trash;
  const root = h('div', { class: 'viewer' });
  const bg = h('div', { class: 'vbg' });
  const stage = h('div', { class: 'vstage' });
  const track = h('div', { class: 'vtrack' });
  const top = h('div', { class: 'vtop' });
  const bot = h('div', { class: 'vbot' });
  stage.append(track); root.append(bg, stage, top, bot); document.body.append(root);
  if (opts.rect) {
    const r = opts.rect;
    stage.style.transformOrigin = '0 0';
    stage.style.transform = 'translate(' + r.left + 'px,' + r.top + 'px) scale(' + (r.width / innerWidth) + ',' + (r.height / innerHeight) + ')';
    stage.style.opacity = '.4'; bg.style.opacity = 0; top.style.opacity = 0; bot.style.opacity = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      stage.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s'; bg.style.transition = 'opacity .3s';
      stage.style.transform = 'none'; stage.style.opacity = '1'; bg.style.opacity = 1; top.style.opacity = ''; bot.style.opacity = '';
    }));
  }
  let W = innerWidth, Hh = innerHeight, cur = null, sc = 1, tx = 0, ty = 0, ss = null, seek = null;
  const item = () => S.map.get(ids[idx]);
  const media = () => cur && cur.querySelector('.media');

  function bars() {
    const it = item(); if (!it) return;
    top.innerHTML = ''; bot.innerHTML = '';
    top.append(h('button', { class: 'ib', onclick: back }, icon('back')), h('div', {}, h('div', { class: 'vt1' }, dayLabel(it.date)), h('div', { class: 'vt2' }, timeLabel(it.date))));
    const b = (i, fn, cls) => h('button', { class: 'ib vb2 ' + (cls || ''), onclick: fn }, icon(i, 26));
    if (trash) bot.append(b('restore', restore), b('trash', delForever));
    else bot.append(b(it.fav ? 'heartf' : 'heart', fav, it.fav ? 'on' : ''), it.video ? null : b('edit', edit), b('share', () => shareItems([item()])), b('trash', del), b('more', more));
  }
  function buildSlides() {
    track.innerHTML = '';
    for (let o = -1; o <= 1; o++) {
      const id = ids[idx + o];
      const s = h('div', { class: 'slide' });
      s.style.transform = 'translateX(' + (o * 100) + '%)';
      track.append(s);
      if (id) fill(s, S.map.get(id), o === 0);
    }
    cur = track.children[1];
    if (seek) { seek.remove(); seek = null; }
  }
  async function fill(s, it, isCur) {
    if (!it) return;
    const u = await mediaURL(it.id);
    if (!u || !s.isConnected) return;
    if (it.video) {
      const v = h('video', { class: 'media', src: u, playsinline: '', preload: 'metadata' });
      const pl = h('button', { class: 'bigplay', onclick: e => { e.stopPropagation(); v.paused ? v.play() : v.pause(); } }, icon('play', 32));
      v.addEventListener('play', () => pl.classList.add('hide'));
      v.addEventListener('pause', () => pl.classList.remove('hide'));
      v.addEventListener('ended', () => pl.classList.remove('hide'));
      s.append(v, pl);
      if (isCur) {
        seek = h('input', { class: 'vseek', type: 'range', min: '0', max: '1000', value: '0' });
        seek.addEventListener('input', () => { if (v.duration) v.currentTime = v.duration * seek.value / 1000; });
        v.addEventListener('timeupdate', () => { if (v.duration && document.activeElement !== seek) seek.value = Math.round(v.currentTime / v.duration * 1000); });
        root.append(seek);
      }
    } else {
      s.append(h('img', { class: 'media', src: u, draggable: 'false', alt: '' }));
    }
  }
  function applyZoom() { const m = media(); if (m) m.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')'; }
  function clampPan() {
    const m = media(); if (!m) return;
    const mx = Math.max(0, (m.offsetWidth * sc - W) / 2), my = Math.max(0, (m.offsetHeight * sc - Hh) / 2);
    tx = clamp(tx, -mx, mx); ty = clamp(ty, -my, my);
  }
  function resetZoom(anim) { const m = media(); sc = 1; tx = ty = 0; if (m) { m.style.transition = anim ? 'transform .2s' : 'none'; applyZoom(); } }
  function toggleUI() { root.classList.toggle('imm'); }
  function stopSS() { if (ss) { clearInterval(ss); ss = null; } }
  function go(dir) {
    const t = idx + dir; if (t < 0 || t >= ids.length) { snap(); return; }
    const v = cur && cur.querySelector('video'); if (v) v.pause();
    track.style.transition = 'transform .24s ease-out';
    track.style.transform = 'translateX(' + (-dir * W) + 'px)';
    setTimeout(() => { idx = t; track.style.transition = 'none'; track.style.transform = 'none'; buildSlides(); resetZoom(false); bars(); }, 240);
  }
  function snap() { track.style.transition = 'transform .2s ease-out'; track.style.transform = 'none'; }
  function snapV() { if (cur) { cur.style.transition = 'transform .2s'; cur.style.transform = 'translateX(0%)'; } bg.style.transition = 'opacity .2s'; bg.style.opacity = 1; }

  const ptrs = new Map(); let g = null, mode = null, lastTap = 0, tapT = 0;
  function tap(e) {
    if (ss) { stopSS(); return; }
    const now = Date.now();
    if (now - lastTap < 280) { clearTimeout(tapT); lastTap = 0; dbl(e); }
    else { lastTap = now; tapT = setTimeout(toggleUI, 260); }
  }
  function dbl(e) {
    const m = media(), it = item(); if (!m || !it || it.video) return;
    if (sc > 1) resetZoom(true);
    else { sc = 2.5; tx = -(e.clientX - W / 2) * (sc - 1); ty = -(e.clientY - Hh / 2) * (sc - 1); clampPan(); m.style.transition = 'transform .2s'; applyZoom(); }
  }
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.bigplay,.vseek')) return;
    track.style.transition = 'none';
    const m = media(); if (m) m.style.transition = 'none';
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { g = { sx: e.clientX, sy: e.clientY, t: Date.now(), tx, ty, moved: false }; mode = null; }
    else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      g = Object.assign(g || {}, { pd: Math.hypot(a.x - b.x, a.y - b.y), ps: sc, moved: true }); mode = 'pinch';
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId) || !g) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (mode === 'pinch' && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()];
      sc = clamp(g.ps * Math.hypot(a.x - b.x, a.y - b.y) / g.pd, 1, 6); clampPan(); applyZoom(); return;
    }
    if (ptrs.size !== 1) return;
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!mode) {
      if (Math.abs(dx) + Math.abs(dy) < 8) return;
      g.moved = true;
      mode = sc > 1 ? 'pan' : (Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'vert');
    }
    if (mode === 'pan') { tx = g.tx + dx; ty = g.ty + dy; clampPan(); applyZoom(); }
    else if (mode === 'swipe') {
      const edge = (idx === 0 && dx > 0) || (idx === ids.length - 1 && dx < 0);
      track.style.transform = 'translateX(' + (edge ? dx / 3 : dx) + 'px)';
    } else if (mode === 'vert' && cur) {
      cur.style.transition = 'none';
      cur.style.transform = 'translateY(' + dy + 'px) scale(' + (dy > 0 ? 1 - Math.min(dy, 400) / 1600 : 1) + ')';
      bg.style.transition = 'none'; bg.style.opacity = dy > 0 ? Math.max(0, 1 - dy / 380) : 1;
    }
  });
  const end = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (mode === 'pinch') {
      if (ptrs.size < 2) {
        if (sc < 1.05) resetZoom(true);
        if (ptrs.size === 1) { const p = [...ptrs.values()][0]; g = { sx: p.x, sy: p.y, t: Date.now(), tx, ty, moved: true }; mode = 'pan'; }
        else { g = null; mode = null; }
      }
      return;
    }
    if (ptrs.size > 0 || !g) return;
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy, dt = Date.now() - g.t;
    if (mode === 'swipe') {
      const th = W * 0.22;
      if ((dx < -th || (dx < -40 && dt < 250)) && idx < ids.length - 1) { stopSS(); go(1); }
      else if ((dx > th || (dx > 40 && dt < 250)) && idx > 0) { stopSS(); go(-1); }
      else snap();
    } else if (mode === 'vert') {
      if (dy > 110) back();
      else { if (dy < -80) { const it = item(); if (it) infoSheet(it); } snapV(); }
    } else if (!g.moved) tap(e);
    mode = null; g = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  async function fav() { const it = item(); await mutate([it.id], i => { i.fav = !i.fav; }); bars(); toast(it.fav ? 'Added to Favorites' : 'Removed from Favorites'); }
  async function del() {
    const ok = await dialog({ title: 'Move to Recently deleted?', text: 'This item is permanently deleted after 30 days.', ok: 'Move' });
    if (!ok) return;
    await mutate([ids[idx]], i => { i.deleted = Date.now(); });
    removeCur(); toast('Moved to Recently deleted');
  }
  async function delForever() {
    const ok = await dialog({ title: 'Delete permanently?', text: "This can't be undone.", ok: 'Delete', danger: true });
    if (!ok) return;
    await permDelete([ids[idx]]); removeCur();
  }
  async function restore() { await mutate([ids[idx]], i => { i.deleted = 0; }); removeCur(); toast('Restored'); }
  function removeCur() {
    ids.splice(idx, 1);
    if (!ids.length) { back(); return; }
    if (idx >= ids.length) idx = ids.length - 1;
    buildSlides(); resetZoom(false); bars();
  }
  function edit() { const it = item(); if (it) openEditor(it, () => { buildSlides(); bars(); }); }
  function more() {
    const it = item(); if (!it) return;
    sheet('', [
      { icon: 'info', label: 'Details', fn: () => infoSheet(it) },
      { icon: 'folder', label: 'Move to album', fn: () => moveTo([it.id]) },
      { icon: 'slideshow', label: 'Slideshow', fn: () => { root.classList.add('imm'); stopSS(); ss = setInterval(() => { if (idx < ids.length - 1) go(1); else stopSS(); }, 3000); } },
      { icon: 'download', label: 'Save a copy to Downloads', fn: () => exportItem(it) }
    ]);
  }
  pushLayer(() => {
    stopSS(); root.classList.add('out');
    setTimeout(() => root.remove(), 170);
  });
  buildSlides(); bars();
}

/* =============== shell =============== */
let page = null;
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const t = S.settings.theme, dark = t === 'dark' || (t === 'system' && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#000000' : '#ffffff';
}
mq.addEventListener('change', applyTheme);
function refresh() { reindex(); live.forEach(p => p.redraw()); }
function mount() {
  if (page) page.destroy();
  const host = $('#page'); host.innerHTML = '';
  page = { pictures: PicturesPage, albums: AlbumsPage, stories: StoriesPage, menu: MenuPage }[S.tab]();
  host.append(page.el);
  document.querySelectorAll('.nt').forEach(n => n.classList.toggle('on', n.dataset.t === S.tab));
}
function buildNav() {
  const nav = $('#nav');
  [['pictures', 'Pictures', 'pics'], ['albums', 'Albums', 'albums'], ['stories', 'Stories', 'stories'], ['menu', 'Menu', 'menu']].forEach(([k, l, i]) => {
    nav.append(h('button', { class: 'nt', 'data-t': k, onclick: () => { if (S.tab !== k) { S.tab = k; mount(); } else if (page.el.querySelector('.scroll')) page.el.querySelector('.scroll').scrollTo({ top: 0, behavior: 'smooth' }); } }, h('span', { class: 'pl' }, icon(i)), l));
  });
}
async function boot() {
  db = await openDB();
  await loadAll();
  applyTheme();
  buildNav(); mount();
  $('#file').addEventListener('change', e => { importFiles(e.target.files); e.target.value = ''; });
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot().catch(e => { document.body.append(h('div', { class: 'empty' }, h('div', { class: 'big' }, 'Gallery could not start'), String(e && e.message || e))); });
