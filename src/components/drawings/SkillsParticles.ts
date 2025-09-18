// drawings/skillsGear.ts
import { Pt, jitter, exactCount, pushCircle, densify } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

// Simple 8-tooth gear: outer radius with teeth notches, inner hole
export const generateSkillsTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const cx = W * 0.52, cy = H * 0.50;

  const R  = 0.26 * S;         // base radius
  const toothLen = 0.06 * S;
  const innerR = 0.10 * S;

  const stroke = Math.max(3, Math.floor(7 * (S/520)));
  const stepB  = Math.max(2, Math.floor(4 * (S/520)));

  const outerPts: Pt[] = [];
  const teeth = 8;

  // draw outer circle with tooth rectangles approximated by radial spikes
  pushCircle(outerPts, cx, cy, R, stepB, stroke);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const ax = cx + Math.cos(a) * R;
    const ay = cy + Math.sin(a) * R;
    const bx = cx + Math.cos(a) * (R + toothLen);
    const by = cy + Math.sin(a) * (R + toothLen);

    // approximate spike by sampling along the line from A to B with “stroke” thickness
    const len = toothLen;
    const n = Math.max(6, Math.floor(len / stepB));
    for (let j = 0; j <= n; j++) {
      const t = j / n;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      for (let s = -Math.floor(stroke/2); s <= Math.floor(stroke/2); s += stepB) {
        // slight orthogonal jitter around the radial direction
        const ox = -Math.sin(a) * s;
        const oy =  Math.cos(a) * s;
        outerPts.push({ x: x + ox, y: y + oy });
      }
    }
  }

  const innerPts: Pt[] = [];
  pushCircle(innerPts, cx, cy, innerR, stepB, Math.max(2, stroke - 2));

  // densify
  const est = outerPts.length + innerPts.length;
  const factor = est ? Math.max(1, Math.sqrt(P / est)) : 1;
  const step = densify(stepB, factor);

  const OUT: Pt[] = [], IN: Pt[] = [];
  pushCircle(OUT, cx, cy, R, step, stroke);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const ax = cx + Math.cos(a) * R;
    const ay = cy + Math.sin(a) * R;
    const bx = cx + Math.cos(a) * (R + toothLen);
    const by = cy + Math.sin(a) * (R + toothLen);
    const len = toothLen;
    const n = Math.max(6, Math.floor(len / step));
    for (let j = 0; j <= n; j++) {
      const t = j / n;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      for (let s = -Math.floor(stroke/2); s <= Math.floor(stroke/2); s += step) {
        const ox = -Math.sin(a) * s;
        const oy =  Math.cos(a) * s;
        OUT.push({ x: x + ox, y: y + oy });
      }
    }
  }
  pushCircle(IN, cx, cy, innerR, step, Math.max(2, stroke - 2));

  return exactCount([...jitter(OUT,0.7), ...jitter(IN,0.6)], P, 0.6);
};


