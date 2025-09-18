// drawings/EducationParticles.ts
// Generates: UC Berkeley Bear
import { Pt, jitter, exactCount, pushHorizontal, pushVertical, pushCircle, densify } from "./shapes";

export type IconConfig = { boxWidth: number; boxHeight: number; particleCount: number };

/* ----------------------------- helpers ------------------------------ */
const edgeLine = (out: Pt[], p: Pt, q: Pt, step: number, stroke: number) => {
  const dx = q.x - p.x, dy = q.y - p.y;
  const len = Math.hypot(dx, dy);
  const n = Math.max(8, Math.floor(len / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = p.x + dx * t, y = p.y + dy * t;
    // simple vertical stroke "thickness"
    for (let s = -Math.floor(stroke / 2); s <= Math.floor(stroke / 2); s += Math.max(1, Math.floor(stroke / 3))) {
      out.push({ x, y: y + s });
    }
  }
};

const pushPolyline = (out: Pt[], pts: Pt[], closed: boolean, step: number, stroke: number) => {
  for (let i = 0; i < pts.length - 1; i++) edgeLine(out, pts[i], pts[i + 1], step, stroke);
  if (closed && pts.length > 2) edgeLine(out, pts[pts.length - 1], pts[0], step, stroke);
};

/* ---------------------------- Cal Bear (Realistic) ------------------------------ */
/**
 * A realistic bear silhouette with proper anatomy, facial features, and proportions.
 * Designed to look exactly like a bear with stocky body, rounded features, and four distinct legs.
 */
export const generateEducationTargets = (cfg: IconConfig): Pt[] => {
  const { boxWidth: W, boxHeight: H, particleCount: P } = cfg;
  const S = Math.min(W, H);
  const stroke = Math.max(3, Math.floor(6 * (S / 520)));
  const baseStep = Math.max(2, Math.floor(4 * (S / 520)));

  // --- Scale and Center ---
  // Bear is stockier and more compact (ratio approx 1.6 : 1)
  const scale = 0.85 * S;
  const ox = (W - scale) / 2;
  const oy = (H - scale * 0.65) / 2;

  // Helper to scale our normalized points into the drawing space
  const T = (p: Pt): Pt => ({
      x: ox + p.x / 1.6 * scale,
      y: oy + p.y * scale * 0.65
  });

  // --- Define the Bear's Shape in Parts (Normalized Coordinates) ---

  // 🐻 Head with rounded snout
  const headRaw: Pt[] = [
    { x: 0.05, y: 0.48 }, // Bottom of nose
    { x: 0.08, y: 0.44 }, // Nose tip
    { x: 0.12, y: 0.42 }, // Top of snout
    { x: 0.18, y: 0.40 }, // Forehead start
    { x: 0.25, y: 0.35 }, // Top of head
    { x: 0.32, y: 0.38 }, // Back of head
    { x: 0.35, y: 0.42 }, // Neck connection
  ];

  // 👂 Left ear (rounded)
  const leftEarRaw: Pt[] = [
    { x: 0.22, y: 0.35 },
    { x: 0.20, y: 0.30 },
    { x: 0.25, y: 0.28 },
    { x: 0.28, y: 0.32 },
  ];

  // 👂 Right ear (rounded)
  const rightEarRaw: Pt[] = [
    { x: 0.28, y: 0.32 },
    { x: 0.31, y: 0.28 },
    { x: 0.36, y: 0.30 },
    { x: 0.34, y: 0.35 },
  ];

  // 💪 Back with shoulder hump and curved spine
  const backRaw: Pt[] = [
    { x: 0.35, y: 0.42 }, // Neck
    { x: 0.45, y: 0.38 }, // Shoulder hump peak
    { x: 0.65, y: 0.42 }, // Mid-back
    { x: 0.95, y: 0.45 }, // Lower back
    { x: 1.20, y: 0.50 }, // Rump start
    { x: 1.35, y: 0.58 }, // Rump peak
  ];

  // 🐾 Front left leg (closer to viewer)
  const frontLeftLegRaw: Pt[] = [
    { x: 0.42, y: 0.50 }, // Shoulder
    { x: 0.38, y: 0.70 }, // Upper arm
    { x: 0.35, y: 0.85 }, // Elbow
    { x: 0.32, y: 0.95 }, // Paw back
    { x: 0.28, y: 0.97 }, // Paw bottom
    { x: 0.25, y: 0.96 }, // Paw front
    { x: 0.24, y: 0.93 }, // Paw top
  ];

  // 🐾 Front right leg (farther from viewer)
  const frontRightLegRaw: Pt[] = [
    { x: 0.50, y: 0.52 }, // Shoulder
    { x: 0.52, y: 0.72 }, // Upper arm
    { x: 0.54, y: 0.87 }, // Elbow
    { x: 0.56, y: 0.96 }, // Paw back
    { x: 0.60, y: 0.98 }, // Paw bottom
    { x: 0.63, y: 0.97 }, // Paw front
    { x: 0.64, y: 0.94 }, // Paw top
  ];

  // 🐾 Rear left leg (closer to viewer)
  const rearLeftLegRaw: Pt[] = [
    { x: 1.15, y: 0.58 }, // Hip
    { x: 1.18, y: 0.75 }, // Thigh
    { x: 1.15, y: 0.88 }, // Knee
    { x: 1.10, y: 0.96 }, // Ankle
    { x: 1.06, y: 0.98 }, // Paw back
    { x: 1.02, y: 0.97 }, // Paw bottom
    { x: 0.99, y: 0.95 }, // Paw front
    { x: 0.98, y: 0.92 }, // Paw top
  ];

  // 🐾 Rear right leg (farther from viewer)
  const rearRightLegRaw: Pt[] = [
    { x: 1.25, y: 0.60 }, // Hip
    { x: 1.30, y: 0.78 }, // Thigh
    { x: 1.28, y: 0.90 }, // Knee
    { x: 1.24, y: 0.97 }, // Ankle
    { x: 1.20, y: 0.98 }, // Paw back
    { x: 1.16, y: 0.97 }, // Paw bottom
    { x: 1.13, y: 0.95 }, // Paw front
    { x: 1.12, y: 0.92 }, // Paw top
  ];

  // 🐻 Belly curve
  const bellyRaw: Pt[] = [
    { x: 0.24, y: 0.93 }, // Front paw connection
    { x: 0.45, y: 0.88 }, // Chest
    { x: 0.70, y: 0.90 }, // Mid-belly
    { x: 0.90, y: 0.92 }, // Lower belly
    { x: 0.98, y: 0.92 }, // Rear connection
  ];

  // 🐻 Tail (short and stubby)
  const tailRaw: Pt[] = [
    { x: 1.35, y: 0.58 }, // Tail base
    { x: 1.40, y: 0.62 }, // Tail mid
    { x: 1.42, y: 0.65 }, // Tail tip
  ];

  // 👄 Jaw line
  const jawRaw: Pt[] = [
    { x: 0.05, y: 0.48 }, // Nose bottom
    { x: 0.10, y: 0.52 }, // Jaw curve
    { x: 0.18, y: 0.54 }, // Jaw back
    { x: 0.25, y: 0.52 }, // Neck underside
  ];

  // --- Scale all points to pixel space ---
  const headPath = headRaw.map(T);
  const leftEarPath = leftEarRaw.map(T);
  const rightEarPath = rightEarRaw.map(T);
  const backPath = backRaw.map(T);
  const frontLeftLegPath = frontLeftLegRaw.map(T);
  const frontRightLegPath = frontRightLegRaw.map(T);
  const rearLeftLegPath = rearLeftLegRaw.map(T);
  const rearRightLegPath = rearRightLegRaw.map(T);
  const bellyPath = bellyRaw.map(T);
  const tailPath = tailRaw.map(T);
  const jawPath = jawRaw.map(T);

  // --- Estimate particle density and draw ---
  const totalPoints = headRaw.length + leftEarRaw.length + rightEarRaw.length + backRaw.length +
                     frontLeftLegRaw.length + frontRightLegRaw.length + rearLeftLegRaw.length +
                     rearRightLegRaw.length + bellyRaw.length + tailRaw.length + jawRaw.length;
  const est = totalPoints * (scale / baseStep) * stroke;
  const factor = est ? Math.max(1, Math.sqrt(P / est)) : 1;
  const step = densify(baseStep, factor);

  const pts: Pt[] = [];

  // Draw all bear parts
  pushPolyline(pts, headPath, false, step, stroke);
  pushPolyline(pts, leftEarPath, true, step, stroke);
  pushPolyline(pts, rightEarPath, true, step, stroke);
  pushPolyline(pts, backPath, false, step, stroke);
  pushPolyline(pts, frontLeftLegPath, false, step, stroke);
  pushPolyline(pts, frontRightLegPath, false, step, stroke);
  pushPolyline(pts, rearLeftLegPath, false, step, stroke);
  pushPolyline(pts, rearRightLegPath, false, step, stroke);
  pushPolyline(pts, bellyPath, false, step, stroke);
  pushPolyline(pts, tailPath, false, step, stroke);
  pushPolyline(pts, jawPath, false, step, stroke);

  // 👁️ Eyes (both eyes)
  const leftEyePos = T({ x: 0.16, y: 0.42 });
  const rightEyePos = T({ x: 0.22, y: 0.42 });
  pushCircle(pts, leftEyePos.x, leftEyePos.y, 0.008 * scale, step, Math.max(1, stroke - 2));
  pushCircle(pts, rightEyePos.x, rightEyePos.y, 0.008 * scale, step, Math.max(1, stroke - 2));

  // 👃 Nose detail
  const nosePos = T({ x: 0.08, y: 0.44 });
  pushCircle(pts, nosePos.x, nosePos.y, 0.006 * scale, step, Math.max(1, stroke - 2));

  return exactCount(jitter(pts, 0.6), P, 0.6);
};
