import { generateInLetterTargets, type LetterConfig } from "./drawings/InLetters";
import { generateGitLogoTargets, type GitVizConfig } from "./drawings/GitBranches";
import { generateExperienceTargets, type IconConfig as ExperienceConfig } from "./drawings/ExperienceBriefcase";
import { generateProjectsTargets, type IconConfig as ProjectsConfig } from "./drawings/ProjectsKanban";
import { generateEducationTargets, type IconConfig as EducationConfig } from "./drawings/EducationCap";
import { generateSkillsTargets, type IconConfig as SkillsConfig } from "./drawings/SkillsGear";

/* ----------------------------- Types ----------------------------- */
type Physics = {
  maxSpeed: number;
  driftMax: number;
  wander: number;
  springK: number;
  springC: number;
  minSpeed: number;
  snapRadius: number;
  scatterMin: number;
  scatterMax: number;
};

type Config = {
  width: number;
  height: number;
  particleCount: number;
  maxDevicePixelRatio: number;
  physics: Physics;
  dotSize: number;
  opacity: number;
};

type ShapeKey =
  | "in" | "git" | "experience" | "projects" | "education" | "skills";

/* --------------------------- Module State --------------------------- */
let canvas!: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let cfg!: Config;
let dpr = 1;
let width = 0, height = 0;

let count = 0;
let x!: Float32Array;
let y!: Float32Array;
let vx!: Float32Array;
let vy!: Float32Array;
let forming!: Uint8Array;      // 0/1
let tx!: Float32Array;         // target x
let ty!: Float32Array;         // target y
let ids!: Uint32Array;         // stable ids 0..count-1

// persistent index buffers to avoid allocations
let idxByX!: Uint32Array;      // particle indices sorted by x
let tmpTargetsOrder!: Uint32Array; // 0..N-1 reused for sorting target order

// sprite
let dotCanvas!: OffscreenCanvas;
let dotBitmap: ImageBitmap | null = null;
let drawOffset = 1;

// fixed timestep
const FIXED_DT = 1 / 120;
const MAX_STEPS = 4;
let lastTime = 0;

// cached targets (invalidated on resize/particleCount change)
const targetCache = new Map<ShapeKey, { x: number; y: number }[]>();

/* ---------------------------- Utilities ---------------------------- */
function setupCanvas() {
  ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }) as OffscreenCanvasRenderingContext2D;
  if (!ctx) throw new Error("2D context unavailable");
  dpr = Math.max(1, Math.min(cfg.maxDevicePixelRatio, (self as unknown as { devicePixelRatio?: number }).devicePixelRatio || 1));
  width = (cfg.width | 0);
  height = (cfg.height | 0);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

async function makeDotSprite() {
  const r = Math.max(1, Math.ceil(cfg.dotSize * dpr));
  const size = r * 2 + 2;
  dotCanvas = new OffscreenCanvas(size, size);
  const c2d = dotCanvas.getContext("2d")!;
  c2d.fillStyle = "#fff";
  c2d.beginPath();
  c2d.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  c2d.fill();
  drawOffset = (size * 0.5) / dpr;

  // Create ImageBitmap once; faster draw on most engines.
  dotBitmap?.close?.();
  dotBitmap = await dotCanvas.convertToBlob().then(b => createImageBitmap(b));
}

function initParticles() {
  count = cfg.particleCount | 0;
  x = new Float32Array(count);
  y = new Float32Array(count);
  vx = new Float32Array(count);
  vy = new Float32Array(count);
  forming = new Uint8Array(count);
  tx = new Float32Array(count);
  ty = new Float32Array(count);
  ids = new Uint32Array(count);
  idxByX = new Uint32Array(count);
  tmpTargetsOrder = new Uint32Array(count);

  for (let i = 0; i < count; i++) {
    x[i] = Math.random() * width;
    y[i] = Math.random() * height;
    vx[i] = (Math.random() - 0.5) * 2;
    vy[i] = (Math.random() - 0.5) * 2;
    forming[i] = 0;
    tx[i] = 0; ty[i] = 0;
    ids[i] = i;
    idxByX[i] = i;
    tmpTargetsOrder[i] = i;
  }
}

function invalidateTargets() {
  targetCache.clear();
}

function lcgHash(n: number) {
  let t = (n ^ 0x9E3779B9) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x85EBCA6B) >>> 0;
  t = Math.imul(t ^ (t >>> 13), 0xC2B2AE35) >>> 0;
  return (t ^ (t >>> 16)) >>> 0;
}
function rng01(seed: number, tick: number) {
  const s = lcgHash(seed + tick * 2654435761);
  return (s & 0xffff) / 65536; // [0,1)
}

/* ---------------------------- Physics ---------------------------- */
function clampSpeed(i: number, maxSpeed: number) {
  const sv = vx[i] * vx[i] + vy[i] * vy[i];
  const m2 = maxSpeed * maxSpeed;
  if (sv > m2) {
    const k = maxSpeed / Math.sqrt(sv);
    vx[i] *= k; vy[i] *= k;
  }
}

function applySpring(i: number, dt: number, p: Physics) {
  const dx = tx[i] - x[i];
  const dy = ty[i] - y[i];
  vx[i] += (p.springK * dx - p.springC * vx[i]) * dt;
  vy[i] += (p.springK * dy - p.springC * vy[i]) * dt;
}

function applyDrift(i: number, tick: number, dt: number, p: Physics) {
  const a = rng01(ids[i], tick) * 6.283185307179586;
  const mag = (rng01(ids[i] ^ 0xABCDEF, tick) - 0.5) * p.wander * (dt * 60);
  vx[i] += Math.cos(a) * mag;
  vy[i] += Math.sin(a) * mag;

  const s2 = vx[i] * vx[i] + vy[i] * vy[i];
  const min2 = p.minSpeed * p.minSpeed;
  if (s2 < min2) {
    const theta = rng01(ids[i] ^ 0x123456, tick) * 6.283185307179586;
    const imp = p.minSpeed * (1 + rng01(ids[i] ^ 0x777, tick));
    vx[i] += Math.cos(theta) * imp;
    vy[i] += Math.sin(theta) * imp;
  }
  const d2 = p.driftMax * p.driftMax;
  if (s2 > d2) {
    const k = p.driftMax / Math.sqrt(s2);
    vx[i] *= k; vy[i] *= k;
  }
}

function snapIfClose(i: number, snap: number) {
  const dx = tx[i] - x[i];
  const dy = ty[i] - y[i];
  if (dx * dx + dy * dy < snap * snap) {
    x[i] = tx[i];
    y[i] = ty[i];
    vx[i] *= 0.2;
    vy[i] *= 0.2;
  }
}

function integrateAndReflect(i: number, dt: number) {
  let nx = x[i] + vx[i] * dt * 60;
  let ny = y[i] + vy[i] * dt * 60;

  if (nx < 0) { nx = 0; vx[i] = Math.abs(vx[i]); }
  else if (nx > width) { nx = width; vx[i] = -Math.abs(vx[i]); }
  x[i] = nx;

  if (ny < 0) { ny = 0; vy[i] = Math.abs(vy[i]); }
  else if (ny > height) { ny = height; vy[i] = -Math.abs(vy[i]); }
  y[i] = ny;
}

function scatterOnce(i: number, p: Physics) {
  const a = Math.random() * 6.283185307179586;
  const imp = p.scatterMin + Math.random() * (p.scatterMax - p.scatterMin);
  vx[i] += Math.cos(a) * imp;
  vy[i] += Math.sin(a) * imp;
}

function physicsStep(tick: number) {
  const p = cfg.physics;
  for (let i = 0; i < count; i++) {
    if (forming[i]) {
      applySpring(i, FIXED_DT, p);
      clampSpeed(i, p.maxSpeed);
      snapIfClose(i, p.snapRadius);
    } else {
      applyDrift(i, tick, FIXED_DT, p);
    }
    integrateAndReflect(i, FIXED_DT);
  }
}

/* ------------------------------ Draw ------------------------------ */
function drawFrame() {
  if (!ctx) return;
  ctx.globalAlpha = cfg.opacity;
  ctx.clearRect(0, 0, width, height);

  // ImageBitmap path if available (faster on most engines)
  if (dotBitmap) {
    for (let i = 0; i < count; i++) {
      ctx.drawImage(dotBitmap, x[i] - drawOffset, y[i] - drawOffset);
    }
    return;
  }

  // Fallback to drawing from OffscreenCanvas if ImageBitmap creation failed
  for (let i = 0; i < count; i++) {
    ctx.drawImage(dotCanvas, x[i] - drawOffset, y[i] - drawOffset);
  }
}

/* ----------------------- Target Generation ------------------------ */
function genTargets(key: ShapeKey, n: number): { x: number; y: number }[] {
  const cached = targetCache.get(key);
  if (cached && cached.length === n) return cached;

  let pts: { x: number; y: number }[] = [];
  switch (key) {
    case "in":
      pts = generateInLetterTargets({ boxWidth: width, boxHeight: height, particleCount: n } as LetterConfig);
      break;
    case "git":
      pts = generateGitLogoTargets({
        boxWidth: width, boxHeight: height, particleCount: n,
        stroke: 9, step: 5, nodeRadius: 11, nodeStep: 5,
      } as GitVizConfig);
      break;
    case "experience":
      pts = generateExperienceTargets({ boxWidth: width, boxHeight: height, particleCount: n } as ExperienceConfig);
      break;
    case "projects":
      pts = generateProjectsTargets({ boxWidth: width, boxHeight: height, particleCount: n } as ProjectsConfig);
      break;
    case "education":
      pts = generateEducationTargets({ boxWidth: width, boxHeight: height, particleCount: n } as EducationConfig);
      break;
    case "skills":
      pts = generateSkillsTargets({ boxWidth: width, boxHeight: height, particleCount: n } as SkillsConfig);
      break;
  }
  targetCache.set(key, pts);
  return pts;
}

// Sort helpers reuse persistent buffers; no allocations on hover
function assignTargets(targets: { x: number; y: number }[]) {
  const N = Math.min(count, targets.length);

  // particles sorted by current x
  for (let i = 0; i < count; i++) idxByX[i] = i;
  idxByX.sort((a, b) => x[a] - x[b]);

  // target indices sorted by target x
  for (let i = 0; i < N; i++) tmpTargetsOrder[i] = i;
  // Typescript requires slice for .sort usually; Uint32Array.sort is supported.
  tmpTargetsOrder.subarray(0, N).sort((a, b) => targets[a].x - targets[b].x);

  for (let i = 0; i < N; i++) {
    const pi = idxByX[i] >>> 0;
    const ti = tmpTargetsOrder[i] >>> 0;
    tx[pi] = targets[ti].x;
    ty[pi] = targets[ti].y;
    forming[pi] = 1;
  }
  for (let i = N; i < count; i++) {
    const pi = idxByX[i] >>> 0;
    if (forming[pi]) scatterOnce(pi, cfg.physics);
    forming[pi] = 0;
  }
}

/* ---------------------------- Animation ---------------------------- */
function animate(now: number) {
  if (!lastTime) lastTime = now;
  let acc = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  let steps = 0;
  const tick0 = (now / (FIXED_DT * 1000)) | 0;
  while (acc >= FIXED_DT && steps < MAX_STEPS) {
    physicsStep(tick0 + steps);
    acc -= FIXED_DT;
    steps++;
  }
  drawFrame();

  (self as unknown as { requestAnimationFrame: (cb: (time: number) => void) => void }).requestAnimationFrame(animate);
}

/* --------------------------- Message API --------------------------- */
self.onmessage = (e: MessageEvent) => {
  const data = e.data || {};
  switch (data.type) {
    case "init": {
      canvas = data.canvas as OffscreenCanvas;
      cfg = data.config as Config;
      setupCanvas();
      invalidateTargets();
      initParticles();
      lastTime = 0;
      // sprite creation is async but quick; start animating immediately
      makeDotSprite().finally(() => {});
      (self as unknown as { requestAnimationFrame: (cb: (time: number) => void) => void }).requestAnimationFrame(animate);
      break;
    }

    case "resize": {
      cfg.width = data.width | 0;
      cfg.height = data.height | 0;
      setupCanvas();
      invalidateTargets();
      // keep particles; just ensure they remain in-bounds
      for (let i = 0; i < count; i++) {
        x[i] = Math.min(Math.max(0, x[i]), width);
        y[i] = Math.min(Math.max(0, y[i]), height);
      }
      // Rebuild sprite for DPR changes
      makeDotSprite().finally(() => {});
      break;
    }

    case "hover": {
      const {
        isLinkedInHovered,
        isGitHubHovered,
        isExperienceHovered,
        isProjectsHovered,
        isEducationHovered,
        isSkillsHovered,
      } = data;

      let key: ShapeKey | null = null;
      if (isLinkedInHovered) key = "in";
      else if (isGitHubHovered) key = "git";
      else if (isExperienceHovered) key = "experience";
      else if (isProjectsHovered) key = "projects";
      else if (isEducationHovered) key = "education";
      else if (isSkillsHovered) key = "skills";

      if (key) {
        const targets = genTargets(key, count);
        assignTargets(targets);
      } else {
        // release all to drift, scatter once
        const p = cfg.physics;
        for (let i = 0; i < count; i++) {
          if (forming[i]) scatterOnce(i, p);
          forming[i] = 0;
        }
      }
      break;
    }

    case "dispose": {
      ctx = null;
      dotBitmap?.close?.();
      break;
    }
  }
};


