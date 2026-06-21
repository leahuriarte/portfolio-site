import { prepareWithSegments, layoutNextLine } from '/public/pretext/layout.js';

// ── constants ────────────────────────────────────────────────────────────────
const FRAME_COUNT   = 42;
const TIGER_W       = 200;   // display width in CSS px
const LERP          = 0.07;
const ANIM_SCALE    = 0.45;  // animPhase advance per pixel of movement (lower = slower frame switching)
const BOB_AMP       = 0;     // pixels of sine-wave bob (0 = no bob)
const DIRTY_THRESH  = 4;     // px movement before recomputing layout

const PARAGRAPHS = [
  "right now, i'm a sophomore at harvey mudd college, studying computer science (with a concentration in religious studies and chinese).",
  "i'm currently in the quantum quasars lab researching quantum position verification.",
  "in summer 2025, i was an intern for google in mountain view. i worked for the books team in google search to build a bulk inference pipeline to classify books by subject heading (93% accuracy).",
  "before that, i was an apprentice for the us army. i designed and programmed a microfluidics robot to synthesize gold nanotriangles.",
  "also, i used to lead quantum computing research, with a focus on cryptography. read one of my papers here.",
  "i am an avid hackathon enjoyer, i have won 7 so far.",
  "i love tigers, taylor swift, and roller coasters.",
];

const PAPER_URL = 'https://www.researchgate.net/publication/384235254_A_meta-analysis_on_NIST_post-quantum_cryptographic_primitive_finalists';

// ── canvas + context ─────────────────────────────────────────────────────────
const canvas = document.getElementById('tiger-canvas');
const ctx    = canvas.getContext('2d');

// ── geometry ──────────────────────────────────────────────────────────────────
let geo = null;

function computeGeo() {
  const W        = window.innerWidth;
  const H        = window.innerHeight;
  // Matches the CSS breakpoint in about.html: below this the avatar stacks
  // on top of the text instead of sitting in the right half.
  const NARROW     = W <= 1000;
  // Wide: reserve the right portion for the avatar (360px wide, centered at
  // 75%). Narrow: avatar moves to the top, so no horizontal reservation but
  // we push the text down below it.
  const avatarGap  = NARROW ? 0 : Math.round(W * 0.25 + 200);
  const colW       = Math.min(580, W - 96 - avatarGap);
  const colX       = Math.max(24, (W - colW - avatarGap) / 2);
  const topY       = NARROW ? 460 : 96;   // below fixed nav (or below stacked avatar)
  const fontSize   = Math.max(14, Math.min(17, Math.round(colW / 36)));
  const lineHeight = Math.round(fontSize * 1.68);
  const font       = `${fontSize}px 'Archivo', sans-serif`;
  const titleSize  = Math.round(fontSize * 4.2);
  const titleFont  = `${titleSize}px 'UnifrakturMaguntia', cursive`;
  return { W, H, colW, colX, topY, fontSize, lineHeight, font, titleFont, titleSize };
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width  = Math.round(window.innerWidth  * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  geo = computeGeo();
  layoutLines = null;
}

// ── pointer ───────────────────────────────────────────────────────────────────
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });
window.addEventListener('touchstart', e => { pointer.x = e.touches[0].clientX; pointer.y = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchmove',  e => { pointer.x = e.touches[0].clientX; pointer.y = e.touches[0].clientY; }, { passive: true });

// ── tiger state ───────────────────────────────────────────────────────────────
const tiger = { x: 0, y: 0, facing: 1, animPhase: 0, bobPhase: 0 };

function stepTiger(dt) {
  const tx = pointer.x;
  const ty = pointer.y + 32;
  const dx = tx - tiger.x;
  const dy = ty - tiger.y;
  const mx = dx * LERP;
  const my = dy * LERP;
  tiger.x += mx;
  tiger.y += my;
  const dist = Math.hypot(mx, my);
  if (dist > 0.4) {
    tiger.animPhase += dist * ANIM_SCALE;
    // Sprite art faces LEFT by default, so flip (facing = -1) when moving right.
    if (dx >  1) tiger.facing = -1;
    if (dx < -1) tiger.facing =  1;
  }
  tiger.bobPhase += dt * 0.004 + dist * 0.01;
}

// ── sprites ───────────────────────────────────────────────────────────────────
let spriteCache = null; // [{canvas: OffscreenCanvas, w, h}]

async function loadSprites() {
  const imgs = await Promise.all(
    Array.from({ length: FRAME_COUNT }, (_, i) =>
      new Promise((res, rej) => {
        const img = new Image();
        img.onload  = () => res(img);
        img.onerror = rej;
        img.src = `/public/tiger-sprites/walk-${i + 1}.png?v=4`;
      })
    )
  );
  const scale = TIGER_W / imgs[0].naturalWidth;
  const dw = Math.round(imgs[0].naturalWidth  * scale);
  const dh = Math.round(imgs[0].naturalHeight * scale);
  spriteCache = imgs.map(img => {
    const oc    = new OffscreenCanvas(dw, dh);
    const octx  = oc.getContext('2d');
    octx.drawImage(img, 0, 0, dw, dh);
    return { canvas: oc, w: dw, h: dh };
  });
  // Start tiger off-screen right so it walks in naturally
  tiger.x = window.innerWidth + dw;
  tiger.y = window.innerHeight * 0.5;
}

function getTigerBox() {
  if (!spriteCache) return null;
  const { w, h } = spriteCache[0];
  const bob = Math.sin(tiger.bobPhase * 2) * BOB_AMP;
  return {
    left:   tiger.x - w / 2,
    right:  tiger.x + w / 2,
    top:    tiger.y - h + bob,
    bottom: tiger.y      + bob,
    w, h, bob,
  };
}

function drawTiger(box) {
  if (!spriteCache || !box) return;
  const idx    = ((Math.floor(tiger.animPhase) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
  const sprite = spriteCache[idx];
  ctx.save();
  ctx.translate(tiger.x, tiger.y + box.bob);
  ctx.scale(tiger.facing, 1);
  ctx.shadowColor   = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur    = 10;
  ctx.shadowOffsetY = 5;
  ctx.drawImage(sprite.canvas, -sprite.w / 2, -sprite.h, sprite.w, sprite.h);
  ctx.restore();
}

// ── text layout ───────────────────────────────────────────────────────────────
let layoutLines     = null;  // [{text, x, y, isTitle?, isLink?}] in document coords
let layoutTigerBox  = null;  // tiger box snapshot (document coords) used to build current layout
let linkHitBox      = null;  // {x1, x2, y1, y2} for "here" link, in document coords
let contentHeight   = 0;     // total document height of the laid-out text
const scrollSpacer  = document.getElementById('about-spacer');

function layoutDirty(box) {
  if (!layoutLines || !box !== !layoutTigerBox) return true;
  if (!layoutTigerBox) return false;
  return (
    Math.abs(box.left  - layoutTigerBox.left)  > DIRTY_THRESH ||
    Math.abs(box.top   - layoutTigerBox.top)   > DIRTY_THRESH
  );
}

// Returns {marginLeft, maxWidth} for a line at y given tiger box.
function lineGeometry(y, tigerBox, colX, colW, lineHeight) {
  if (!tigerBox) return { marginLeft: colX, maxWidth: colW };
  const bandBottom = y + lineHeight;
  if (tigerBox.top >= bandBottom || tigerBox.bottom <= y) {
    return { marginLeft: colX, maxWidth: colW };
  }
  const colRight    = colX + colW;
  const overlapL    = Math.max(tigerBox.left,  colX);
  const overlapR    = Math.min(tigerBox.right, colRight);
  if (overlapR - overlapL < 8) return { marginLeft: colX, maxWidth: colW };
  const tigerCX     = (tigerBox.left + tigerBox.right) / 2;
  const colCX       = colX + colW / 2;
  if (tigerCX < colCX) {
    // Tiger on left: text starts to the right of it
    const newLeft = Math.min(tigerBox.right + 8, colRight - 40);
    return { marginLeft: newLeft, maxWidth: Math.max(40, colRight - newLeft) };
  } else {
    // Tiger on right: text ends before it
    const newRight = Math.max(tigerBox.left - 8, colX + 40);
    return { marginLeft: colX, maxWidth: Math.max(40, newRight - colX) };
  }
}

function buildLayout(tigerBox) {
  const { colX, colW, topY, font, titleFont, titleSize, lineHeight } = geo;
  const lines = [];
  linkHitBox  = null;

  // Title
  let y = topY + titleSize * 1.05;
  lines.push({ text: 'about me', x: colX, y, isTitle: true });
  y += titleSize * 0.85 + lineHeight * 0.5;

  for (let pi = 0; pi < PARAGRAPHS.length; pi++) {
    const prepared = prepareWithSegments(PARAGRAPHS[pi], font);
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };

    while (true) {
      const { marginLeft, maxWidth } = lineGeometry(y, tigerBox, colX, colW, lineHeight);
      const line = layoutNextLine(prepared, cursor, maxWidth);
      if (!line) break;

      const isLink = pi === 4 && line.text.includes('here');
      lines.push({ text: line.text, x: marginLeft, y, isLink });

      cursor = line.end;
      y += lineHeight;
    }
    y += lineHeight * 0.55; // paragraph gap
  }

  contentHeight = Math.round(y + lineHeight); // bottom padding
  return lines;
}

// ── canvas link hit detection ─────────────────────────────────────────────────
function measureLinkHit(lines) {
  const { font, lineHeight } = geo;
  ctx.font = font;
  for (const line of lines) {
    if (!line.isLink) continue;
    const full   = ctx.measureText(line.text).width;
    const before = ctx.measureText(line.text.replace(/here\.?$/, '')).width;
    const word   = ctx.measureText('here').width;
    linkHitBox   = {
      x1: line.x + before,
      x2: line.x + before + word,
      y1: line.y - lineHeight,
      y2: line.y + 4,
    };
    break;
  }
}

canvas.addEventListener('click', e => {
  if (!linkHitBox) return;
  const { x1, x2, y1, y2 } = linkHitBox;
  const docY = e.clientY + window.scrollY;
  if (e.clientX >= x1 && e.clientX <= x2 && docY >= y1 && docY <= y2) {
    window.open(PAPER_URL, '_blank', 'noopener');
  }
});

canvas.addEventListener('mousemove', e => {
  if (!linkHitBox) { canvas.style.cursor = ''; return; }
  const { x1, x2, y1, y2 } = linkHitBox;
  const docY = e.clientY + window.scrollY;
  canvas.style.cursor = (e.clientX >= x1 && e.clientX <= x2 && docY >= y1 && docY <= y2)
    ? 'pointer' : '';
});

// ── draw text ─────────────────────────────────────────────────────────────────
function drawText(lines, scrollY) {
  const { font, titleFont, fontSize } = geo;
  ctx.textBaseline = 'alphabetic';

  for (const line of lines) {
    const y = line.y - scrollY; // document coords -> viewport
    if (line.isTitle) {
      ctx.font      = titleFont;
      ctx.fillStyle = '#1e00ff';
      ctx.fillText(line.text, line.x, y);
    } else {
      ctx.font      = font;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(line.text, line.x, y);

      if (line.isLink && linkHitBox) {
        // Underline "here" in blue
        const { x1, x2 } = linkHitBox;
        ctx.save();
        ctx.fillStyle   = '#1e00ff';
        ctx.strokeStyle = '#1e00ff';
        ctx.lineWidth   = 1;
        // Re-draw just the "here" portion in blue
        ctx.fillText('here', x1, y);
        ctx.beginPath();
        ctx.moveTo(x1, y + 2);
        ctx.lineTo(x2, y + 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// ── main loop ─────────────────────────────────────────────────────────────────
let lastTime = 0;

function frame(ts) {
  requestAnimationFrame(frame);
  const dt  = Math.min(ts - lastTime, 50);
  lastTime  = ts;

  stepTiger(dt);

  const scrollY = window.scrollY;
  const box = getTigerBox(); // viewport coords (the tiger follows the cursor on screen)
  // Layout is computed in document coords, so place the tiger in document
  // space too. This also makes layoutDirty fire on scroll (box top shifts).
  const docBox = box
    ? { left: box.left, right: box.right, top: box.top + scrollY, bottom: box.bottom + scrollY, w: box.w, h: box.h, bob: box.bob }
    : null;

  if (layoutDirty(docBox)) {
    layoutLines    = buildLayout(docBox);
    layoutTigerBox = docBox ? { ...docBox } : null;
    measureLinkHit(layoutLines);
    if (scrollSpacer) scrollSpacer.style.height = contentHeight + 'px';
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (layoutLines) drawText(layoutLines, scrollY);
  drawTiger(box);
}

// ── boot ──────────────────────────────────────────────────────────────────────
// Canvas fillText can't trigger a webfont download on its own, so explicitly
// load the fonts we render (esp. UnifrakturMaguntia, which nothing else uses).
async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load("400 80px 'UnifrakturMaguntia'"),
      document.fonts.load("400 17px 'Archivo'"),
    ]);
    await document.fonts.ready;
  } catch (e) { /* fall back to system fonts */ }
  layoutLines = null; // force a re-layout/redraw now that fonts are ready
}

window.addEventListener('resize', () => { resizeCanvas(); layoutLines = null; });
resizeCanvas();
ensureFonts();

loadSprites().then(() => {
  requestAnimationFrame(ts => { lastTime = ts; requestAnimationFrame(frame); });
});
