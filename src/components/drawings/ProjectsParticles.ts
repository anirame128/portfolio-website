// drawings/projectsKanban.ts
import { Pt, jitter, exactCount, pushRectOutline, pushVertical, densify } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

export const generateProjectsTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const scale = Math.min(1, (S * 0.9) / 520);
  const cx = W * 0.52, cy = H * 0.50;

  const bw = 0.70 * S, bh = 0.42 * S;
  const x = cx - bw/2, y = cy - bh/2;
  const r = 0.04 * S;

  const colGap = 0.02 * S;
  const colW = (bw - 2*colGap) / 3;

  const cardH = 0.11 * S;
  const cardR = 0.025 * S;

  const stroke = Math.max(3, Math.floor(7 * scale));
  const stepB  = Math.max(2, Math.floor(4 * scale));

  const frame: Pt[] = [];
  pushRectOutline(frame, { x, y, w: bw, h: bh }, stepB, stroke, r);

  const cols: Pt[] = [];
  // vertical separators
  pushVertical(cols, x + colW + colGap, y + 8, y + bh - 8, stepB, Math.max(2, stroke - 2));
  pushVertical(cols, x + 2*(colW + colGap), y + 8, y + bh - 8, stepB, Math.max(2, stroke - 2));

  const cards: Pt[] = [];
  for (let c = 0; c < 3; c++) {
    const cx0 = x + c*(colW + colGap);
    const gx = cx0 + 0.04*S;
    const top1 = y + 0.07*S;
    const top2 = y + 0.22*S;
    pushRectOutline(cards, { x: gx, y: top1, w: colW - 0.08*S, h: cardH }, stepB, Math.max(2, stroke - 2), cardR);
    pushRectOutline(cards, { x: gx, y: top2, w: colW - 0.08*S, h: cardH }, stepB, Math.max(2, stroke - 2), cardR);
  }

  const est = frame.length + cols.length + cards.length;
  const factor = est ? Math.max(1, Math.sqrt(P / est)) : 1;
  const step = densify(stepB, factor);

  const F: Pt[] = [], C: Pt[] = [], K: Pt[] = [];
  pushRectOutline(F, { x, y, w: bw, h: bh }, step, stroke, r);
  pushVertical(C, x + colW + colGap, y + 8, y + bh - 8, step, Math.max(2, stroke - 2));
  pushVertical(C, x + 2*(colW + colGap), y + 8, y + bh - 8, step, Math.max(2, stroke - 2));
  for (let c = 0; c < 3; c++) {
    const cx0 = x + c*(colW + colGap);
    const gx = cx0 + 0.04*S;
    const top1 = y + 0.07*S;
    const top2 = y + 0.22*S;
    pushRectOutline(K, { x: gx, y: top1, w: colW - 0.08*S, h: cardH }, step, Math.max(2, stroke - 2), cardR);
    pushRectOutline(K, { x: gx, y: top2, w: colW - 0.08*S, h: cardH }, step, Math.max(2, stroke - 2), cardR);
  }

  return exactCount([...jitter(F,0.7), ...jitter(C,0.6), ...jitter(K,0.6)], P, 0.6);
};


