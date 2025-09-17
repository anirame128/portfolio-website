// drawings/inLetters.ts
export type LetterConfig = {
  boxWidth: number;
  boxHeight: number;
  particleCount: number;
};

type Pt = { x: number; y: number };

const evenPick = (pts: Pt[], k: number) => {
  if (k >= pts.length) return pts;
  const out: Pt[] = [];
  const step = (pts.length - 1) / Math.max(1, k - 1);
  for (let i = 0; i < k; i++) out.push(pts[Math.round(i * step)]);
  return out;
};

const jitter = (pts: Pt[], j = 0.8) => {
  for (const p of pts) {
    p.x += (Math.random() - 0.5) * j;
    p.y += (Math.random() - 0.5) * j;
  }
  return pts;
};

const pushVertical = (arr: Pt[], x: number, y1: number, y2: number, step: number, stroke: number) => {
  for (let y = y1; y <= y2; y += step) {
    for (let t = -Math.floor(stroke / 2); t <= Math.floor(stroke / 2); t += step) {
      arr.push({ x: x + t, y });
    }
  }
};

const pushCircle = (arr: Pt[], cx: number, cy: number, r: number, step: number, stroke: number) => {
  const peri = 2 * Math.PI * r;
  const samples = Math.max(20, Math.floor(peri / step));
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    for (let t = -Math.floor(stroke / 2); t <= Math.floor(stroke / 2); t += step) {
      arr.push({ x: cx + Math.cos(a) * (r + t), y: cy + Math.sin(a) * (r + t) });
    }
  }
};

const pushHorizontal = (arr: Pt[], y: number, x1: number, x2: number, step: number, stroke: number) => {
  const [minX, maxX] = x1 <= x2 ? [x1, x2] : [x2, x1];
  for (let x = minX; x <= maxX; x += step) {
    for (let t = -Math.floor(stroke / 2); t <= Math.floor(stroke / 2); t += step) {
      arr.push({ x, y: y + t });
    }
  }
};

const pushQuarterArc = (
  arr: Pt[], cx: number, cy: number, r: number,
  startAngle: number, endAngle: number, // e.g., -Math.PI/2 -> 0 for a top-right corner
  step: number, stroke: number
) => {
  const peri = r * (endAngle - startAngle);
  const samples = Math.max(10, Math.floor(Math.abs(peri) / step));
  for (let i = 0; i <= samples; i++) {
    const a = startAngle + (i / samples) * (endAngle - startAngle);
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    for (let t = -Math.floor(stroke / 2); t <= Math.floor(stroke / 2); t += step) {
      // thicken orthogonally (vertical thickness is fine here)
      arr.push({ x: px, y: py + t });
    }
  }
};


export const generateInLetterTargets = (cfg: LetterConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  // overall scale
  const LETTER_H = Math.min(200, Math.max(140, H * 0.32));
  const centerX  = W * 0.52;
  const centerY  = H * 0.50;
  const baseline = centerY + LETTER_H * 0.26;

  // proportions & spacing
  const strokeN = Math.max(4, Math.floor(LETTER_H * 0.11));   // 'n' weight
  const strokeI = Math.max(3, Math.floor(strokeN * 0.78));    // thinner 'i'
  const stepN   = 4;                                          // denser 'n'
  const stepI   = 6;                                          // sparser 'i'
  const stepDot = 6;

  const wordWidth = LETTER_H * 0.94; // keeps aspect pleasing
  const startX    = centerX - wordWidth * 0.5;

  // --- build parts ---
  const ptsDot: Pt[] = [];
  const ptsI:   Pt[] = [];
  const ptsNL:  Pt[] = [];
  const ptsNR:  Pt[] = [];
  const ptsArch:Pt[] = [];

  // "i"
  const iX   = startX;
  const iTop = baseline - LETTER_H * 0.80;
  pushVertical(ptsI, iX, iTop, baseline, stepI, strokeI);

  const dotR = Math.max(9, Math.floor(LETTER_H * 0.11));
  pushCircle(ptsDot, iX, iTop - dotR * 2.1, dotR, stepDot, Math.max(2, Math.floor(strokeI * 0.8)));

  // kerning between "i" and "n"
  const gap = Math.max(22, Math.floor(LETTER_H * 0.10));

  // "n" geometry (boxy)
  const nLeftX   = iX + strokeI + gap;
  const nWidth   = Math.max(LETTER_H * 0.46, 90);
  const nRightX  = nLeftX + nWidth;
  const nTopY    = baseline - LETTER_H * 0.76;
  const rightDrop= LETTER_H * 0.20;                 // where the arch/right stem lands
  const yEnd     = baseline - rightDrop;

  // stems (as before)
  pushVertical(ptsNL, nLeftX,  nTopY, baseline, stepN, strokeN);
  pushVertical(ptsNR, nRightX, nTopY + LETTER_H * 0.18, baseline, stepN, strokeN);

  // --- BOXY TOP + CORNER ---
  const CORNER_R = Math.max(LETTER_H * 0.04, 6);    // smaller = boxier; try 0.03–0.06
  // horizontal top from left stem to just before the corner radius
  pushHorizontal(ptsArch, nTopY, nLeftX, nRightX - CORNER_R, stepN, strokeN);

  // quarter arc to turn into the right stem (top-right corner)
  // center of the quarter arc is at (nRightX - R, nTopY + R), sweeping -90° → 0°
  pushQuarterArc(
    ptsArch,
    nRightX - CORNER_R,
    nTopY + CORNER_R,
    CORNER_R,
    -Math.PI / 2,
    0,
    stepN,
    strokeN
  );

  // ensure the vertical connection from the end of corner into the lowered join
  pushVertical(ptsArch, nRightX, nTopY + CORNER_R, yEnd, stepN, strokeN);

  // --- particle budget (bias to boxy top + corner) ---
  const BUDGET = Math.min(P, 500);
  const dotB   = Math.min(32, Math.round(BUDGET * 0.07)); // slightly less on the dot
  const iB     = Math.round(BUDGET * 0.17);
  const nB     = BUDGET - dotB - iB;

  // boxy parts: left stem, right stem, and (top bar + corner) combined
  const nTopCornerB = Math.round(nB * 0.42);  // flat top + corner get the plurality
  const nLeftB      = Math.round(nB * 0.30);
  const nRightB     = nB - nTopCornerB - nLeftB;

  // combine with even downsampling + tiny jitter
  const targets: Pt[] = [
    ...evenPick(jitter(ptsDot),  dotB),
    ...evenPick(jitter(ptsI),    iB),
    ...evenPick(jitter(ptsNL),   nLeftB),
    ...evenPick(jitter(ptsNR),   nRightB),
    ...evenPick(jitter(ptsArch), nTopCornerB), // top bar + corner samples live in ptsArch now
  ];

  if (targets.length > P) targets.length = P;
  return targets;
};
