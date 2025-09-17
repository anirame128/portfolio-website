import { generateInLetterTargets, type LetterConfig } from "./drawings/inLetters";
import { generateGitLogoTargets, type GitVizConfig } from "./drawings/gitBranches";
import { generateExperienceTargets, type IconConfig as ExperienceConfig } from "./drawings/experienceBriefcase";
import { generateProjectsTargets, type IconConfig as ProjectsConfig } from "./drawings/projectsKanban";
import { generateEducationTargets, type IconConfig as EducationConfig } from "./drawings/educationCap";
import { generateSkillsTargets, type IconConfig as SkillsConfig } from "./drawings/skillsGear";

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

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

let cfg: Config;
let dpr = 1;
let width = 0, height = 0;

let count = 0;
let x!: Float32Array;
let y!: Float32Array;
let vx!: Float32Array;
let vy!: Float32Array;
let forming!: Uint8Array;   // 0/1
let tx!: Float32Array;      // target x
let ty!: Float32Array;      // target y

// precomputed ids to avoid allocations
let ids!: Uint32Array;

// sprite
let dotCanvas: OffscreenCanvas;
let drawOffset = 1;

// hover state
let hoverLinkedIn = false;
let hoverGitHub = false;
let hoverExperience = false;
let hoverProjects = false;
let hoverEducation = false;
let hoverSkills = false;

// fixed timestep
const FIXED_DT = 1 / 120;   // 120 Hz physics
const MAX_STEPS = 4;        // clamp when tab resumes
let lastTime = 0;

function lcgHash(n: number) {
  // tiny hash (deterministic, fast)
  let t = (n ^ 0x9E3779B9) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x85EBCA6B) >>> 0;
  t = Math.imul(t ^ (t >>> 13), 0xC2B2AE35) >>> 0;
  return (t ^ (t >>> 16)) >>> 0;
}
function rng01(seed: number, tick: number) {
  const s = lcgHash(seed + tick * 2654435761);
  return (s & 0xffff) / 65536; // [0,1)
}

function setupCanvas() {
  ctx = canvas.getContext("2d", { alpha: true, desynchronized: true } as CanvasRenderingContext2DSettings);
  if (!ctx) throw new Error("2D context unavailable");
  dpr = Math.max(1, Math.min(cfg.maxDevicePixelRatio, (self as unknown as { devicePixelRatio?: number }).devicePixelRatio || 1));
  width = Math.floor(cfg.width);
  height = Math.floor(cfg.height);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  // crisp transform
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeDotSprite() {
  const r = Math.ceil(cfg.dotSize * dpr);
  const size = r * 2 + 2;
  dotCanvas = new OffscreenCanvas(size, size);
  const c2d = dotCanvas.getContext("2d")!;
  c2d.fillStyle = "#fff";
  c2d.beginPath();
  c2d.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  c2d.fill();
  drawOffset = (size / 2) / dpr;
}

function initParticles() {
  count = cfg.particleCount;
  x = new Float32Array(count);
  y = new Float32Array(count);
  vx = new Float32Array(count);
  vy = new Float32Array(count);
  forming = new Uint8Array(count);
  tx = new Float32Array(count);
  ty = new Float32Array(count);
  ids = new Uint32Array(count);

  for (let i = 0; i < count; i++) {
    x[i] = Math.random() * width;
    y[i] = Math.random() * height;
    vx[i] = (Math.random() - 0.5) * 2;
    vy[i] = (Math.random() - 0.5) * 2;
    forming[i] = 0;
    tx[i] = 0;
    ty[i] = 0;
    ids[i] = i >>> 0;
  }
}

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
  const ax = p.springK * dx - p.springC * vx[i];
  const ay = p.springK * dy - p.springC * vy[i];
  vx[i] += ax * dt;
  vy[i] += ay * dt;
}

function applyDrift(i: number, tick: number, dt: number, p: Physics) {
  // deterministic tiny wander (no Math.random per frame)
  const a = rng01(ids[i], tick) * 6.283185307179586; // 2π
  const mag = (rng01(ids[i] ^ 0xABCDEF, tick) - 0.5) * p.wander * dt * 60;
  vx[i] += Math.cos(a) * mag;
  vy[i] += Math.sin(a) * mag;

  const s2 = vx[i] * vx[i] + vy[i] * vy[i];
  const min2 = p.minSpeed * p.minSpeed;
  if (s2 < min2) {
    const theta = rng01(ids[i] ^ 0x123456, tick) * 6.283185307179586;
    const imp = p.minSpeed * (1.0 + rng01(ids[i] ^ 0x777, tick));
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

function reflectWalls(i: number) {
  let nx = x[i] + vx[i] * FIXED_DT * 60;
  let ny = y[i] + vy[i] * FIXED_DT * 60;

  if (nx < 0) { nx = 0; vx[i] = Math.abs(vx[i]); }
  else if (nx > width) { nx = width; vx[i] = -Math.abs(vx[i]); }
  x[i] = nx;

  if (ny < 0) { ny = 0; vy[i] = Math.abs(vy[i]); }
  else if (ny > height) { ny = height; vy[i] = -Math.abs(vy[i]); }
  y[i] = ny;
}

function scatter(i: number, p: Physics) {
  // single random burst when leaving forming state
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
    reflectWalls(i);
  }
}

function drawFrame() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = cfg.opacity;

  // draw all with one state
  for (let i = 0; i < count; i++) {
    // drawImage of our precomputed dot sprite
    (ctx as OffscreenCanvasRenderingContext2D).drawImage(dotCanvas, x[i] - drawOffset, y[i] - drawOffset);
  }
}

function animate(now: number) {
  if (!lastTime) lastTime = now;
  let acc = Math.min(0.1, (now - lastTime) / 1000); // clamp
  lastTime = now;

  let steps = 0;
  const tick = (now / (FIXED_DT * 1000)) | 0; // integer tick for RNG

  while (acc >= FIXED_DT && steps < MAX_STEPS) {
    physicsStep(tick + steps);
    acc -= FIXED_DT;
    steps++;
  }
  drawFrame();
  (self as unknown as { requestAnimationFrame: (cb: (time: number) => void) => void }).requestAnimationFrame(animate);
}

/* -------- Target generation using actual drawing functions -------- */
function genInLetterTargets(n: number): { x: number; y: number }[] {
  const config: LetterConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
  };
  return generateInLetterTargets(config);
}

function genGitTargets(n: number): { x: number; y: number }[] {
  const config: GitVizConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
    // Git logo styling - bolder look
    stroke: 9,
    step: 5,
    nodeRadius: 11,
    nodeStep: 5,
  };
  return generateGitLogoTargets(config);
}

function genExperienceTargets(n: number): { x: number; y: number }[] {
  const config: ExperienceConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
  };
  return generateExperienceTargets(config);
}

function genProjectsTargets(n: number): { x: number; y: number }[] {
  const config: ProjectsConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
  };
  return generateProjectsTargets(config);
}

function genEducationTargets(n: number): { x: number; y: number }[] {
  const config: EducationConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
  };
  return generateEducationTargets(config);
}

function genSkillsTargets(n: number): { x: number; y: number }[] {
  const config: SkillsConfig = {
    boxWidth: width,
    boxHeight: height,
    particleCount: n,
  };
  return generateSkillsTargets(config);
}

// map particles to targets with stable sort by x (cheap for 400)
function assignTargets(targets: {x:number;y:number}[]) {
  const N = Math.min(count, targets.length);

  // Build index arrays once to avoid object churn
  const idxs = ids.slice(0, count);
  idxs.sort((a, b) => x[a] - x[b]);

  const tids = new Uint32Array(N);
  for (let i = 0; i < N; i++) tids[i] = i;
  tids.sort((a, b) => targets[a].x - targets[b].x);

  for (let i = 0; i < N; i++) {
    const pi = idxs[i] >>> 0;
    const ti = tids[i] >>> 0;
    tx[pi] = targets[ti].x;
    ty[pi] = targets[ti].y;
    forming[pi] = 1;
  }
  for (let i = N; i < count; i++) {
    const pi = idxs[i] >>> 0;
    // leaving forming -> scatter once
    if (forming[pi]) scatter(pi, cfg.physics);
    forming[pi] = 0;
  }
}

// ------------------- Message handling -------------------
self.onmessage = (e: MessageEvent) => {
  const { type } = (e.data || {}) as { type?: string };
  if (type === "init") {
    canvas = e.data.canvas as OffscreenCanvas;
    cfg = e.data.config as Config;
    setupCanvas();
    makeDotSprite();
    initParticles();
    lastTime = 0;
    (self as unknown as { requestAnimationFrame: (cb: (time: number) => void) => void }).requestAnimationFrame(animate);
    return;
  }
  if (type === "resize") {
    cfg.width = e.data.width;
    cfg.height = e.data.height;
    setupCanvas();
    makeDotSprite();
    return;
  }
  if (type === "hover") {
    hoverLinkedIn = !!e.data.isLinkedInHovered;
    hoverGitHub = !!e.data.isGitHubHovered;
    hoverExperience = !!e.data.isExperienceHovered;
    hoverProjects = !!e.data.isProjectsHovered;
    hoverEducation = !!e.data.isEducationHovered;
    hoverSkills = !!e.data.isSkillsHovered;

    if (hoverLinkedIn) {
      const targets = genInLetterTargets(count);
      assignTargets(targets);
    } else if (hoverGitHub) {
      const targets = genGitTargets(count);
      assignTargets(targets);
    } else if (hoverExperience) {
      const targets = genExperienceTargets(count);
      assignTargets(targets);
    } else if (hoverProjects) {
      const targets = genProjectsTargets(count);
      assignTargets(targets);
    } else if (hoverEducation) {
      const targets = genEducationTargets(count);
      assignTargets(targets);
    } else if (hoverSkills) {
      const targets = genSkillsTargets(count);
      assignTargets(targets);
    } else {
      // release all to drift
      for (let i = 0; i < count; i++) {
        if (forming[i]) scatter(i, cfg.physics);
        forming[i] = 0;
      }
    }
    return;
  }
  if (type === "dispose") {
    // best-effort cleanup
    ctx = null;
  }
};


