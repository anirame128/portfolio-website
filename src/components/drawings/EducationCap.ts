// drawings/educationCap.ts
import { Pt, jitter, exactCount, pushHorizontal, pushVertical, pushCircle, densify } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

// Mortarboard: diamond cap (top), small front edge, tassel
export const generateEducationTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const cx = W * 0.52, cy = H * 0.50;

  const cap = 0.48 * S;    // diamond half-diagonal
  const brim = 0.26 * S;   // front strip width
  const tasselLen = 0.26 * S;

  const stroke = Math.max(3, Math.floor(7 * (S/520)));
  const stepB  = Math.max(2, Math.floor(4 * (S/520)));

  // diamond outline (4 edges)
  const A = { x: cx, y: cy - cap };
  const B = { x: cx + cap, y: cy };
  const C = { x: cx, y: cy + cap };
  const D = { x: cx - cap, y: cy };

  const capPts: Pt[] = [];
  const edge = (p: Pt, q: Pt, step: number, stroke: number) => {
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.hypot(dx, dy);
    const n = Math.max(8, Math.floor(len / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = p.x + dx * t, y = p.y + dy * t;
      for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s += step) {
        capPts.push({ x, y: y + s });
      }
    }
  };

  edge(A, B, stepB, stroke);
  edge(B, C, stepB, stroke);
  edge(C, D, stepB, stroke);
  edge(D, A, stepB, stroke);

  // front brim (horizontal) slightly below center
  const brimY = cy + cap*0.12;
  const brimX1 = cx - brim, brimX2 = cx + brim;
  const brimPts: Pt[] = [];
  pushHorizontal(brimPts, brimY, brimX1, brimX2, stepB, Math.max(2, stroke - 2));

  // tassel: from right corner (B) going down with a little knob
  const tasselPts: Pt[] = [];
  const knobR = 0.02 * S;
  pushCircle(tasselPts, B.x, B.y, knobR, stepB, Math.max(2, stroke - 2));
  pushVertical(tasselPts, B.x, B.y + knobR, B.y + tasselLen, stepB, Math.max(2, stroke - 2));

  // densify
  const est = capPts.length + brimPts.length + tasselPts.length;
  const factor = est ? Math.max(1, Math.sqrt(P / est)) : 1;
  const step = densify(stepB, factor);

  const CAP: Pt[] = [], BR: Pt[] = [], TAS: Pt[] = [];
  edge(A, B, step, stroke); edge(B, C, step, stroke); edge(C, D, step, stroke); edge(D, A, step, stroke);
  pushHorizontal(BR, brimY, brimX1, brimX2, step, Math.max(2, stroke - 2));
  pushCircle(TAS, B.x, B.y, knobR, step, Math.max(2, stroke - 2));
  pushVertical(TAS, B.x, B.y + knobR, B.y + tasselLen, step, Math.max(2, stroke - 2));

  return exactCount([...jitter(CAP,0.7), ...jitter(BR,0.6), ...jitter(TAS,0.6)], P, 0.6);
};


