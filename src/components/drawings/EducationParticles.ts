// drawings/EducationParticles.ts
// Generates: Diploma with Box and Lines
import { Pt, jitter, exactCount, pushCircle } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

/* ---------------------- Diploma Design ---------------------- */
export const generateEducationTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;

  const S = Math.min(W, H);
  const stroke = Math.max(2, Math.floor(4 * (S / 520)));
  const baseStep = Math.max(2, Math.floor(3 * (S / 520)));

  // Diploma dimensions - rectangular document
  const diplomaW = 0.7 * S;
  const diplomaH = diplomaW * 0.8; // Slightly taller than wide
  const cx = W * 0.5, cy = H * 0.5;
  const ox = cx - diplomaW / 2, oy = cy - diplomaH / 2;

  const pts: Pt[] = [];

  // Outer border of diploma
  const borderStroke = stroke;
  const borderStep = baseStep;
  
  // Top border
  for (let x = ox; x <= ox + diplomaW; x += borderStep) {
    for (let s = -Math.floor(borderStroke / 2); s <= Math.floor(borderStroke / 2); s++) {
      pts.push({ x, y: oy + s });
    }
  }
  
  // Bottom border
  for (let x = ox; x <= ox + diplomaW; x += borderStep) {
    for (let s = -Math.floor(borderStroke / 2); s <= Math.floor(borderStroke / 2); s++) {
      pts.push({ x, y: oy + diplomaH + s });
    }
  }
  
  // Left border
  for (let y = oy; y <= oy + diplomaH; y += borderStep) {
    for (let s = -Math.floor(borderStroke / 2); s <= Math.floor(borderStroke / 2); s++) {
      pts.push({ x: ox + s, y });
    }
  }
  
  // Right border
  for (let y = oy; y <= oy + diplomaH; y += borderStep) {
    for (let s = -Math.floor(borderStroke / 2); s <= Math.floor(borderStroke / 2); s++) {
      pts.push({ x: ox + diplomaW + s, y });
    }
  }

  // Text lines inside the diploma
  const lineStroke = Math.max(1, stroke - 1);
  const lineStep = baseStep;
  const lineSpacing = diplomaH * 0.12; // Space between lines
  const lineStartX = ox + diplomaW * 0.15;
  const lineEndX = ox + diplomaW * 0.85;
  
  // Create 5 text lines
  for (let i = 0; i < 5; i++) {
    const lineY = oy + diplomaH * 0.2 + i * lineSpacing;
    
    // Main text line
    for (let x = lineStartX; x <= lineEndX; x += lineStep) {
      for (let s = -Math.floor(lineStroke / 2); s <= Math.floor(lineStroke / 2); s++) {
        pts.push({ x, y: lineY + s });
      }
    }
    
    // Add some variation to line lengths (some shorter)
    if (i === 1 || i === 3) {
      const shortEndX = lineStartX + (lineEndX - lineStartX) * 0.7;
      for (let x = lineStartX; x <= shortEndX; x += lineStep) {
        for (let s = -Math.floor(lineStroke / 2); s <= Math.floor(lineStroke / 2); s++) {
          pts.push({ x, y: lineY + s });
        }
      }
    }
  }

  // Add a decorative element - small circle (seal/stamp)
  const sealX = ox + diplomaW * 0.8;
  const sealY = oy + diplomaH * 0.75;
  const sealRadius = diplomaW * 0.08;
  pushCircle(pts, sealX, sealY, sealRadius, baseStep, Math.max(1, stroke - 1));

  // Add a small inner circle for the seal
  pushCircle(pts, sealX, sealY, sealRadius * 0.6, baseStep, Math.max(1, stroke - 2));

  return exactCount(jitter(pts, 0.3), P, 0.7);
};
