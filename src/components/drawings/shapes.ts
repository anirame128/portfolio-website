// drawings/shapes.ts
export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

export const jitter = (pts: Pt[], j = 0.6) => {
  for (const p of pts) { p.x += (Math.random()-0.5)*j; p.y += (Math.random()-0.5)*j; }
  return pts;
};

export const evenPick = (pts: Pt[], k: number) => {
  if (k >= pts.length) return pts;
  const out: Pt[] = []; const step = (pts.length - 1) / Math.max(1, k - 1);
  for (let i = 0; i < k; i++) out.push(pts[Math.round(i * step)]);
  return out;
};

// ensure EXACTLY k points (downsample or upsample with micro jitter)
export const exactCount = (pts: Pt[], k: number, j = 0.6): Pt[] => {
  if (pts.length === k) return pts;
  if (pts.length > k) return evenPick(pts, k);
  const out = pts.slice();
  let i = 0;
  while (out.length < k && pts.length) {
    const p = pts[i % pts.length];
    out.push({ x: p.x + (Math.random()-0.5)*j, y: p.y + (Math.random()-0.5)*j });
    i++;
  }
  return out;
};

// primitives (use "step" as sampling stride; "stroke" thickens)
export const pushHorizontal = (arr: Pt[], y: number, x1: number, x2: number, step: number, stroke: number) => {
  const [minX, maxX] = x1 <= x2 ? [x1, x2] : [x2, x1];
  for (let x = minX; x <= maxX; x += step) {
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) arr.push({ x, y: y + t });
  }
};

export const pushVertical = (arr: Pt[], x: number, y1: number, y2: number, step: number, stroke: number) => {
  const [minY, maxY] = y1 <= y2 ? [y1, y2] : [y2, y1];
  for (let y = minY; y <= maxY; y += step) {
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) arr.push({ x: x + t, y });
  }
};

export const pushQuarterArc = (
  arr: Pt[], cx: number, cy: number, r: number,
  startAngle: number, endAngle: number, step: number, stroke: number
) => {
  const len = Math.abs(r * (endAngle - startAngle));
  const samples = Math.max(8, Math.floor(len / step));
  for (let i = 0; i <= samples; i++) {
    const a = startAngle + (i / samples) * (endAngle - startAngle);
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) arr.push({ x: px, y: py + t });
  }
};

export const pushRectOutline = (arr: Pt[], box: Box, step: number, stroke: number, r = 0) => {
  const { x, y, w, h } = box;
  if (r <= 0) {
    pushHorizontal(arr, y, x, x + w, step, stroke);
    pushHorizontal(arr, y + h, x, x + w, step, stroke);
    pushVertical(arr,   x, y, y + h, step, stroke);
    pushVertical(arr,   x + w, y, y + h, step, stroke);
    return;
  }
  // rounded corners: straight segments reduced by r, plus quarter arcs
  const x1 = x + r, x2 = x + w - r, y1 = y + r, y2 = y + h - r;
  pushHorizontal(arr, y,     x1, x2, step, stroke);
  pushHorizontal(arr, y + h, x1, x2, step, stroke);
  pushVertical(arr,   x,     y1, y2, step, stroke);
  pushVertical(arr,   x + w, y1, y2, step, stroke);
  pushQuarterArc(arr, x1, y1, r, Math.PI, 1.5*Math.PI, step, stroke);
  pushQuarterArc(arr, x2, y1, r, 1.5*Math.PI, 2*Math.PI, step, stroke);
  pushQuarterArc(arr, x1, y2, r, 0.5*Math.PI, Math.PI, step, stroke);
  pushQuarterArc(arr, x2, y2, r, 0, 0.5*Math.PI, step, stroke);
};

export const pushCircle = (arr: Pt[], cx: number, cy: number, r: number, step: number, stroke: number) => {
  const peri = 2 * Math.PI * r;
  const samples = Math.max(20, Math.floor(peri / step));
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
      arr.push({ x: cx + Math.cos(a) * (r + t), y: cy + Math.sin(a) * (r + t) });
    }
  }
};

// shrink steps when P is large (densify), keep ≥1
export const densify = (base: number, factor: number) => Math.max(1, Math.floor(base / factor));


