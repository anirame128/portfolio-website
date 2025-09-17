// drawings/gitBranches.ts
export type Point = { x: number; y: number };

export type BranchSpec = {
  // Which trunk commit index this branch forks from
  forkAt: number;
  // How many commits along this branch
  commits: number;
  // horizontal spacing per commit on branch (px)
  dx?: number;
  // vertical spacing per commit on branch (px) (positive = down)
  dy?: number;
  // draw a merge line back to trunk at this trunk commit (optional)
  mergeToTrunkAt?: number;
  // side hint for layout readability ("right" | "left")
  side?: "right" | "left";
};

export type GitVizConfig = {
  boxWidth: number;
  boxHeight: number;
  particleCount: number;

  // Trunk layout
  trunkCommits?: number;       // total commits on trunk
  trunkSpacing?: number;       // vertical spacing between trunk commits
  trunkX?: number;             // x position of trunk (px from left)

  // Commit node + line style
  stroke?: number;             // thickness of lines
  step?: number;               // sampling step for lines
  nodeRadius?: number;         // commit circle radius (px)
  nodeStep?: number;           // sampling step for circles

  // Branches
  branches?: BranchSpec[];

  // Budgets (how many particles to allocate roughly)
  budgetNodesRatio?: number;   // fraction of particles for nodes (0..1)
  budgetLinesRatio?: number;   // fraction for lines (rest goes to branches evenly)
};

type Pt = Point;

const jitter = (pts: Pt[], j=0.8) => {
  for (const p of pts) { p.x += (Math.random()-0.5)*j; p.y += (Math.random()-0.5)*j; }
  return pts;
};

const evenPick = (pts: Pt[], k: number) => {
  if (k >= pts.length) return pts;
  const out: Pt[] = [];
  const step = (pts.length - 1) / Math.max(1, k - 1);
  for (let i = 0; i < k; i++) out.push(pts[Math.round(i*step)]);
  return out;
};

const pushVertical = (arr: Pt[], x: number, y1: number, y2: number, step: number, stroke: number) => {
  const [minY, maxY] = y1 <= y2 ? [y1, y2] : [y2, y1];
  for (let y = minY; y <= maxY; y += step) {
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
      arr.push({ x: x + t, y });
    }
  }
};

const pushHorizontal = (arr: Pt[], y: number, x1: number, x2: number, step: number, stroke: number) => {
  const [minX, maxX] = x1 <= x2 ? [x1, x2] : [x2, x1];
  for (let x = minX; x <= maxX; x += step) {
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
      arr.push({ x, y: y + t });
    }
  }
};

const pushLine = (arr: Pt[], x1:number, y1:number, x2:number, y2:number, step:number, stroke:number) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const samples = Math.max(2, Math.floor(len / step));
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = x1 + dx*t;
    const y = y1 + dy*t;
    for (let s = -Math.floor(stroke/2); s <= Math.floor(stroke/2); s += step) {
      // thickness approximated orthogonally (vertical thickening is fine visually)
      arr.push({ x, y: y + s });
    }
  }
};

const pushCircle = (arr: Pt[], cx:number, cy:number, r:number, step:number, stroke:number) => {
  const peri = 2 * Math.PI * r;
  const samples = Math.max(18, Math.floor(peri / step));
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
      arr.push({ x: cx + Math.cos(a) * (r + t), y: cy + Math.sin(a) * (r + t) });
    }
  }
};

export function generateGitBranchTargets(cfg: GitVizConfig): Pt[] {
  const W = cfg.boxWidth, H = cfg.boxHeight, P = cfg.particleCount;

  // defaults
  const trunkCommits = cfg.trunkCommits ?? 10;
  const trunkSpacing = cfg.trunkSpacing ?? Math.max(48, Math.floor(H * 0.07));
  const stroke = cfg.stroke ?? 6;
  const step = cfg.step ?? 6;
  const nodeR = cfg.nodeRadius ?? 7;
  const nodeStep = cfg.nodeStep ?? 6;
  const centerX = W * 0.45;
  const trunkX = cfg.trunkX ?? centerX;
  const topY = Math.max(24, H * 0.12);
  const branches: BranchSpec[] = cfg.branches ?? [
    { forkAt: 2, commits: 4, dx: 70, dy: 36, side: "right", mergeToTrunkAt: 7 },
    { forkAt: 4, commits: 3, dx: 65, dy: 40, side: "left",  mergeToTrunkAt: 8 },
    { forkAt: 6, commits: 2, dx: 80, dy: 32, side: "right" }, // no merge
  ];

  // particle budget
  const BUDGET = Math.min(P, 600);
  const nodesRatio = cfg.budgetNodesRatio ?? 0.30; // 30% to nodes
  const linesRatio = cfg.budgetLinesRatio ?? 0.20; // 20% to trunk path (lines)
  const nodeBudget = Math.round(BUDGET * nodesRatio);
  const trunkLineBudget = Math.round(BUDGET * linesRatio);
  const branchBudget = BUDGET - nodeBudget - trunkLineBudget;

  // build arrays
  const trunkLine: Pt[] = [];
  const trunkNodes: Pt[] = [];
  const branchLines: Pt[] = [];
  const branchNodes: Pt[] = [];
  const mergeLines: Pt[] = [];

  // trunk points
  const trunkYs: number[] = [];
  for (let i = 0; i < trunkCommits; i++) {
    trunkYs.push(topY + i * trunkSpacing);
  }

  // draw trunk vertical + nodes
  pushVertical(trunkLine, trunkX, trunkYs[0], trunkYs[trunkYs.length - 1], step, stroke);
  for (let i = 0; i < trunkYs.length; i++) {
    pushCircle(trunkNodes, trunkX, trunkYs[i], nodeR, nodeStep, Math.max(2, Math.floor(stroke * 0.6)));
  }

  // branches
  for (const b of branches) {
    const forkIdx = Math.max(0, Math.min(trunkCommits - 1, b.forkAt));
    const forkY = trunkYs[forkIdx];
    const dir = b.side === "left" ? -1 : 1;
    const dx = (b.dx ?? 70) * dir;
    const dy = b.dy ?? 36;

    // angled branch line out of trunk
    const startX = trunkX;
    const startY = forkY;
    const endX = trunkX + dx * b.commits;
    const endY = forkY + dy * b.commits;
    pushLine(branchLines, startX, startY, endX, endY, step, Math.max(4, stroke - 1));

    // commit nodes along the branch
    for (let i = 1; i <= b.commits; i++) {
      const cx = trunkX + dx * i;
      const cy = forkY + dy * i;
      pushCircle(branchNodes, cx, cy, nodeR, nodeStep, Math.max(2, Math.floor(stroke * 0.6)));
    }

    // optional merge back to trunk
    if (typeof b.mergeToTrunkAt === "number") {
      const mergeIdx = Math.max(0, Math.min(trunkCommits - 1, b.mergeToTrunkAt));
      const mergeY = trunkYs[mergeIdx];
      // route a polyline: from last branch commit horizontally to trunk, then vertical snap
      const lastX = endX;
      const lastY = endY;
      pushHorizontal(mergeLines, lastY, lastX, trunkX, step, Math.max(3, stroke - 2));
      pushVertical(mergeLines, trunkX, lastY, mergeY, step, Math.max(3, stroke - 2));
      // add a node at merge point for visual clarity
      pushCircle(trunkNodes, trunkX, mergeY, nodeR, nodeStep, Math.max(2, Math.floor(stroke * 0.6)));
    }
  }

  // budgets per group
  const trunkNodesB = Math.round(nodeBudget * 0.55);
  const branchNodesB = nodeBudget - trunkNodesB;

  const trunkLinePts = evenPick(jitter(trunkLine), trunkLineBudget);
  const trunkNodePts = evenPick(jitter(trunkNodes), trunkNodesB);
  const branchLinePts = evenPick(jitter(branchLines), Math.round(branchBudget * 0.65));
  const mergePts = evenPick(jitter(mergeLines), Math.round(branchBudget * 0.15));
  const branchNodePts = evenPick(jitter(branchNodes), branchNodesB);

  const targets: Pt[] = [
    ...trunkLinePts,
    ...mergePts,
    ...branchLinePts,
    ...trunkNodePts,
    ...branchNodePts,
  ];

  if (targets.length > P) targets.length = P;
  return targets;
}

export function generateGitLogoTargets(cfg: GitVizConfig): Pt[] {
  const W = cfg.boxWidth, H = cfg.boxHeight, P = cfg.particleCount;

  // Style close to the logo
  const stroke   = cfg.stroke ?? 9;
  const step     = cfg.step ?? 5;
  const nodeR    = cfg.nodeRadius ?? 11;
  const nodeStep = cfg.nodeStep ?? 5;

  // Layout (vertical trunk + 45° branch up-right)
  const trunkX   = cfg.trunkX ?? W * 0.46;
  const centerY  = H * 0.50;
  const yBottom  = centerY + H * 0.16;
  const yMid     = centerY + H * 0.02;
  const yTop     = centerY - H * 0.18;

  const branchDx = Math.max(80, W * 0.16);
  const bx       = trunkX + branchDx;  // branch end x
  const by       = yTop;               // branch end y

  // --- build raw point clouds ---
  const trunkLine: Pt[] = [];
  const branchLine: Pt[] = [];
  const nodes: Pt[] = [];

  const jitterAmt = 0.3;
  const jitter = (pts: Pt[], j=jitterAmt) => {
    for (const p of pts) { p.x += (Math.random()-0.5)*j; p.y += (Math.random()-0.5)*j; }
    return pts;
  };

  const pushVertical = (arr: Pt[], x: number, y1: number, y2: number, step: number, stroke: number) => {
    const [minY, maxY] = y1 <= y2 ? [y1, y2] : [y2, y1];
    for (let y = minY; y <= maxY; y += step) {
      for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
        arr.push({ x: x + t, y });
      }
    }
  };

  const pushLine = (arr: Pt[], x1:number, y1:number, x2:number, y2:number, step:number, stroke:number) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const samples = Math.max(2, Math.floor(len / step));
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = x1 + dx*t;
      const y = y1 + dy*t;
      for (let s = -Math.floor(stroke/2); s <= Math.floor(stroke/2); s += step) {
        arr.push({ x, y: y + s });
      }
    }
  };

  const pushCircle = (arr: Pt[], cx:number, cy:number, r:number, step:number, stroke:number) => {
    const peri = 2 * Math.PI * r;
    const samples = Math.max(18, Math.floor(peri / step));
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      for (let t = -Math.floor(stroke/2); t <= Math.floor(stroke/2); t += step) {
        arr.push({ x: cx + Math.cos(a) * (r + t), y: cy + Math.sin(a) * (r + t) });
      }
    }
  };

  // geometry
  pushVertical(trunkLine, trunkX, yBottom, yTop, step, stroke);
  pushLine(branchLine, trunkX, yMid, bx, by, step, stroke);
  pushCircle(nodes, trunkX, yBottom, nodeR, nodeStep, Math.max(2, Math.floor(stroke*0.7)));
  pushCircle(nodes, trunkX, yMid,    nodeR, nodeStep, Math.max(2, Math.floor(stroke*0.7)));
  pushCircle(nodes, bx,     by,      nodeR, nodeStep, Math.max(2, Math.floor(stroke*0.7)));

  // --- exact-budget sampler ---
  const pickExact = (src: Pt[], want: number): Pt[] => {
    // evenly sample when enough points exist
    if (src.length >= want) {
      const out: Pt[] = [];
      const stepF = (src.length - 1) / Math.max(1, want - 1);
      for (let i = 0; i < want; i++) {
        const idx = Math.round(i * stepF);
        const p = src[idx];
        out.push({ x: p.x + (Math.random()-0.5)*jitterAmt, y: p.y + (Math.random()-0.5)*jitterAmt });
      }
      return out;
    }
    // not enough: repeat with small jitter
    const out: Pt[] = [];
    const n = Math.max(1, src.length);
    for (let i = 0; i < want; i++) {
      const p = src[i % n];
      out.push({ x: p.x + (Math.random()-0.5)*jitterAmt, y: p.y + (Math.random()-0.5)*jitterAmt });
    }
    return out;
  };

  // weights across groups; feel free to tweak for your eye
  const wTrunk   = 0.40; // bold vertical
  const wBranch  = 0.22; // diagonal
  const wNodes   = 0.38; // three circles (used implicitly in askNodes calculation)

  // initial asks
  const askTrunk  = Math.round(P * wTrunk);
  const askBranch = Math.round(P * wBranch);
  const askNodes  = Math.round(P * wNodes);

  // sample each group
  const trunkPts  = pickExact(jitter(trunkLine),  askTrunk);
  const branchPts = pickExact(jitter(branchLine), askBranch);
  const nodePts   = pickExact(jitter(nodes),      askNodes);

  // combine (always exactly P)
  return [...trunkPts, ...branchPts, ...nodePts];
}
