// drawings/experienceBriefcase.ts
import { Pt, jitter, exactCount, pushRectOutline, pushHorizontal, pushVertical, densify } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

export const generateExperienceTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const scale = Math.min(1, (S * 0.8) / 520);
  const cx = W * 0.52, cy = H * 0.50;

  const stroke = Math.max(3, Math.floor(8 * scale));
  const stepB  = Math.max(2, Math.floor(4 * scale));

  const bw = 0.56 * S, bh = 0.34 * S;
  const x = cx - bw/2, y = cy - bh/2 + 0.04*S;
  const r = 0.05 * S;

  const hw = 0.22 * S, hh = 0.08 * S;
  const hx = cx - hw/2, hy = y - hh + 0.02*S;
  const hr = 0.03 * S;

  const ly = y + bh*0.45;

  const ptsBox: Pt[] = [];
  const ptsHandle: Pt[] = [];
  const ptsDetail: Pt[] = [];

  pushRectOutline(ptsBox, { x, y, w: bw, h: bh }, stepB, stroke, r);
  pushRectOutline(ptsHandle, { x: hx, y: hy, w: hw, h: hh }, stepB, stroke, hr);
  pushHorizontal(ptsDetail, ly, x + bw*0.12, x + bw*0.88, stepB, Math.max(2, stroke - 2));
  pushVertical(ptsDetail, cx, ly - 0.02*S, ly + 0.02*S, stepB, Math.max(2, stroke - 2));

  const est = ptsBox.length + ptsHandle.length + ptsDetail.length;
  const factor = est ? Math.max(1, Math.sqrt(P / est)) : 1;

  const step = densify(stepB, factor);
  const box: Pt[] = [], handle: Pt[] = [], detail: Pt[] = [];
  pushRectOutline(box,    { x, y, w: bw, h: bh }, step, stroke, r);
  pushRectOutline(handle, { x: hx, y: hy, w: hw, h: hh }, step, stroke, hr);
  pushHorizontal(detail,  ly, x + bw*0.12, x + bw*0.88, step, Math.max(2, stroke - 2));
  pushVertical(detail,    cx, ly - 0.02*S, ly + 0.02*S, step, Math.max(2, stroke - 2));

  const all = [
    ...jitter(box, 0.7),
    ...jitter(handle, 0.7),
    ...jitter(detail, 0.6),
  ];

  return exactCount(all, P, 0.6);
};


