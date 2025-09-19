// drawings/SkillsParticles.ts
// Generates: Less Than and Greater Than Symbols
import { Pt, jitter, exactCount } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

/* ---------------------- Less Than and Greater Than Symbols ---------------------- */
export const generateSkillsTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const stroke = Math.max(2, Math.floor(4 * (S / 520)));
  const baseStep = Math.max(2, Math.floor(3 * (S / 520)));

  // Center the symbols
  const cx = W * 0.5, cy = H * 0.5;
  const symbolSize = 0.25 * S; // Size of each symbol
  const spacing = 0.25 * S; // Space between symbols

  const pts: Pt[] = [];

  // Less than symbol (<) - left side
  const leftCenterX = cx - spacing / 2;
  
  // Top line of < (from top-right to center)
  const topStartX = leftCenterX + symbolSize * 0.4;
  const topStartY = cy - symbolSize * 0.3;
  const topEndX = leftCenterX;
  const topEndY = cy;
  
  for (let t = 0; t <= 1; t += baseStep / Math.hypot(topEndX - topStartX, topEndY - topStartY)) {
    const x = topStartX + (topEndX - topStartX) * t;
    const y = topStartY + (topEndY - topStartY) * t;
    for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s++) {
      pts.push({ x: x + s, y });
    }
  }
  
  // Bottom line of < (from center to bottom-right)
  const bottomStartX = leftCenterX;
  const bottomStartY = cy;
  const bottomEndX = leftCenterX + symbolSize * 0.4;
  const bottomEndY = cy + symbolSize * 0.3;
  
  for (let t = 0; t <= 1; t += baseStep / Math.hypot(bottomEndX - bottomStartX, bottomEndY - bottomStartY)) {
    const x = bottomStartX + (bottomEndX - bottomStartX) * t;
    const y = bottomStartY + (bottomEndY - bottomStartY) * t;
    for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s++) {
      pts.push({ x: x + s, y });
    }
  }

  // Greater than symbol (>) - right side
  const rightCenterX = cx + spacing / 2;
  
  // Top line of > (from top-left to center)
  const topStartX2 = rightCenterX - symbolSize * 0.4;
  const topStartY2 = cy - symbolSize * 0.3;
  const topEndX2 = rightCenterX;
  const topEndY2 = cy;
  
  for (let t = 0; t <= 1; t += baseStep / Math.hypot(topEndX2 - topStartX2, topEndY2 - topStartY2)) {
    const x = topStartX2 + (topEndX2 - topStartX2) * t;
    const y = topStartY2 + (topEndY2 - topStartY2) * t;
    for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s++) {
      pts.push({ x: x + s, y });
    }
  }
  
  // Bottom line of > (from center to bottom-left)
  const bottomStartX2 = rightCenterX;
  const bottomStartY2 = cy;
  const bottomEndX2 = rightCenterX - symbolSize * 0.4;
  const bottomEndY2 = cy + symbolSize * 0.3;
  
  for (let t = 0; t <= 1; t += baseStep / Math.hypot(bottomEndX2 - bottomStartX2, bottomEndY2 - bottomStartY2)) {
    const x = bottomStartX2 + (bottomEndX2 - bottomStartX2) * t;
    const y = bottomStartY2 + (bottomEndY2 - bottomStartY2) * t;
    for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s++) {
      pts.push({ x: x + s, y });
    }
  }

  return exactCount(jitter(pts, 0.3), P, 0.7);
};


