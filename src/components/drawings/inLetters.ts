// drawings/inLetters.ts
import { Pt, jitter, exactCount, pushVertical, pushCircle, pushHorizontal, pushQuarterArc, densify } from "./shapes";

export type LetterConfig = {
  boxWidth: number;
  boxHeight: number;
  particleCount: number;
};



export const generateInLetterTargets = (cfg: LetterConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  // bigger letters
  const LETTER_H = Math.min(480, Math.max(200, H * 0.62));
  const centerX  = W * 0.52;
  const centerY  = H * 0.50;
  const baseline = centerY + LETTER_H * 0.40;

  // base stroke/steps
  const strokeNBase = Math.max(4, Math.floor(LETTER_H * 0.11)); // 'n' weight
  const strokeIBase = Math.max(3, Math.floor(strokeNBase * 0.78));
  const stepNBase   = 4; // denser 'n'
  const stepIBase   = 6; // sparser 'i'
  const stepDotBase = 6;

  const wordWidth = LETTER_H * 0.94;
  const startX    = centerX - wordWidth * 0.5;

  // We'll build twice: first to estimate count, then adjust steps to hit P
  const build = (stepN: number, stepI: number, stepDot: number) => {
    const ptsDot: Pt[] = [];
    const ptsI:   Pt[] = [];
    const ptsNL:  Pt[] = [];
    const ptsNR:  Pt[] = [];
    const ptsArch:Pt[] = [];

    const iX   = startX;
    const iTop = baseline - LETTER_H * 0.80;
    const dotR = Math.max(9, Math.floor(LETTER_H * 0.11));

    // geometry
    const gap       = Math.max(22, Math.floor(LETTER_H * 0.10));
    const nLeftX    = iX + strokeIBase + gap;
    const nWidth    = Math.max(LETTER_H * 0.46, 90);
    const nRightX   = nLeftX + nWidth;
    const nTopY     = baseline - LETTER_H * 0.76;
    const rightDrop = LETTER_H * 0.20;
    const yEnd      = baseline - rightDrop;
    const CORNER_R  = Math.max(LETTER_H * 0.04, 6);

    // "i"
    pushVertical(ptsI, iX, iTop, baseline, stepI, strokeIBase);
    pushCircle(ptsDot, iX, iTop - dotR * 2.1, dotR, stepDot, Math.max(2, Math.floor(strokeIBase * 0.8)));

    // "n" stems
    pushVertical(ptsNL, nLeftX,  nTopY, baseline, stepN, strokeNBase);
    pushVertical(ptsNR, nRightX, nTopY + LETTER_H * 0.18, baseline, stepN, strokeNBase);

    // top bar + corner + down
    pushHorizontal(ptsArch, nTopY, nLeftX, nRightX - CORNER_R, stepN, strokeNBase);
    pushQuarterArc(ptsArch, nRightX - CORNER_R, nTopY + CORNER_R, CORNER_R, -Math.PI/2, 0, stepN, strokeNBase);
    pushVertical(ptsArch, nRightX, nTopY + CORNER_R, yEnd, stepN, strokeNBase);

    return { ptsDot, ptsI, ptsNL, ptsNR, ptsArch };
  };

  // pass 1: estimate
  let { ptsDot, ptsI, ptsNL, ptsNR, ptsArch } = build(stepNBase, stepIBase, stepDotBase);
  const baseCount =
    ptsDot.length + ptsI.length + ptsNL.length + ptsNR.length + ptsArch.length;

  // adjust step densities to better match P (smaller step => more points)
  // approximate scale by sqrt ratio (2D sampling intuition)
  const needMore = P / Math.max(1, baseCount);
  const densifyFactor = needMore > 1 ? Math.sqrt(needMore) : 1; // only densify upward
  const stepN    = densify(stepNBase, densifyFactor);
  const stepI    = densify(stepIBase, densifyFactor);
  const stepDot  = densify(stepDotBase, Math.cbrt(needMore)); // dots need less growth

  // pass 2: rebuild with adjusted steps
  ;({ ptsDot, ptsI, ptsNL, ptsNR, ptsArch } = build(stepN, stepI, stepDot));

  // weighting: bias more particles to the visually important top+corner and stems
  const ALL = {
    dot:  jitter(ptsDot,  0.8),
    i:    jitter(ptsI,    0.8),
    nl:   jitter(ptsNL,   0.6),
    nr:   jitter(ptsNR,   0.6),
    arch: jitter(ptsArch, 0.6),
  };

  // compute proportional budgets by raw counts, then bias
  const counts = {
    dot: ALL.dot.length,
    i:   ALL.i.length,
    nl:  ALL.nl.length,
    nr:  ALL.nr.length,
    arch:ALL.arch.length,
  };
  const totalRaw = Object.values(counts).reduce((a,b)=>a+b,0) || 1;

  // base proportions
  let bDot  = (counts.dot  / totalRaw) * P;
  let bI    = (counts.i    / totalRaw) * P;
  let bNL   = (counts.nl   / totalRaw) * P;
  let bNR   = (counts.nr   / totalRaw) * P;
  let bArch = (counts.arch / totalRaw) * P;

  // apply gentle artistic bias
  bArch *= 1.15; // emphasize top bar + corner
  bNL   *= 1.05;
  bNR   *= 1.00;
  bI    *= 0.95;
  bDot  *= 0.85;

  // normalize back to P
  const sumB = bDot + bI + bNL + bNR + bArch || 1;
  bDot  = (bDot  / sumB) * P;
  bI    = (bI    / sumB) * P;
  bNL   = (bNL   / sumB) * P;
  bNR   = (bNR   / sumB) * P;
  bArch = (bArch / sumB) * P;

  // exact counts (integers) with rounding correction
  let qDot  = Math.max(0, Math.round(bDot));
  let qI    = Math.max(0, Math.round(bI));
  let qNL   = Math.max(0, Math.round(bNL));
  let qNR   = Math.max(0, Math.round(bNR));
  let qArch = Math.max(0, Math.round(bArch));

  let sumQ = qDot + qI + qNL + qNR + qArch;
  // fix rounding drift to equal P exactly
  while (sumQ > P) { if (qArch>0) qArch--; else if (qNL>0) qNL--; else if (qNR>0) qNR--; else if (qI>0) qI--; else qDot--; sumQ--; }
  while (sumQ < P) { qArch++; sumQ++; } // add extras to arch (nicest visually)

  // assemble with exact quotas; exactCount will up/down sample per section
  const targets = [
    ...exactCount(ALL.dot,  qDot),
    ...exactCount(ALL.i,    qI),
    ...exactCount(ALL.nl,   qNL),
    ...exactCount(ALL.nr,   qNR),
    ...exactCount(ALL.arch, qArch),
  ];

  // paranoia: ensure exact P
  if (targets.length > P) targets.length = P;
  while (targets.length < P && targets.length > 0) {
    const p = targets[targets.length % targets.length];
    targets.push({ x: p.x + (Math.random()-0.5)*0.6, y: p.y + (Math.random()-0.5)*0.6 });
  }

  return targets;
};
