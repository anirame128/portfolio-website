"use client";
import React from "react";

type Props = {
  visible: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  isZooming?: boolean;
  profileUrl?: string; // optional if you later wire a live screenshot URL
};

export default function TVPreview({ visible, cardRef, isZooming = false, profileUrl }: Props) {
  // TV dimensions (responsive - centered on screen)
  const [dimensions, setDimensions] = React.useState({
    WIDTH: 1000,
    HEIGHT: 600,
    RADIUS: 30
  });

  const tvRef = React.useRef<HTMLDivElement | null>(null);
  const [pathLen, setPathLen] = React.useState(0);
  const [rectLen, setRectLen] = React.useState(0);
  const lineRef = React.useRef<SVGPathElement | null>(null);

  // Start (right edge mid of card) → End (left mid of TV)
  const [pts, setPts] = React.useState<{ sx: number; sy: number; ex: number; ey: number } | null>(null);

  // Sequence states
  const [lineOn, setLineOn] = React.useState(false);
  const [rectOn, setRectOn] = React.useState(false);
  const [imgOn, setImgOn] = React.useState(false);

  // Calculate responsive dimensions
  React.useLayoutEffect(() => {
    function updateDimensions() {
      const WIDTH = Math.min(1000, window.innerWidth * 0.8);
      const HEIGHT = Math.min(600, window.innerHeight * 0.6);
      setDimensions({ WIDTH, HEIGHT, RADIUS: 30 });
    }
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Measure positions & lengths
  React.useLayoutEffect(() => {
    function measure() {
      const cardEl = cardRef.current;
      const tvEl = tvRef.current;
      if (!cardEl || !tvEl) return;

      const c = cardEl.getBoundingClientRect();
      const t = tvEl.getBoundingClientRect();

      const sx = c.right;                // start at right edge of card
      const sy = c.top + c.height / 2;   // mid-height of card
      const ex = t.left;                 // left edge of TV
      const ey = t.top + t.height / 2;   // mid-height of TV

      setPts({ sx, sy, ex, ey });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [cardRef, visible, dimensions]);

  // Compute the horizontal-then-vertical path (but we'll only animate the horizontal part visually)
  const d = React.useMemo(() => {
    if (!pts) return "";
    // Pure horizontal to TV's left edge (simple/clean as requested)
    return `M ${pts.sx} ${pts.sy} L ${pts.ex} ${pts.sy}`;
  }, [pts]);

  // Stroke lengths
  React.useEffect(() => {
    if (!lineRef.current) return;
    try {
      const len = lineRef.current.getTotalLength();
      setPathLen(len);
    } catch {}
    // Perimeter of rounded rect
    const straight = 2 * (dimensions.WIDTH + dimensions.HEIGHT - 2 * dimensions.RADIUS);
    const arcs = 2 * Math.PI * dimensions.RADIUS;
    setRectLen(straight + arcs);
  }, [dimensions, d]);

  // Orchestrate: line → rect → image
  React.useEffect(() => {
    let t1: NodeJS.Timeout | undefined, t2: NodeJS.Timeout | undefined;
    if (visible) {
      setLineOn(true);
      setRectOn(false);
      setImgOn(false);
      // after line draws (~400ms), start rect
      t1 = setTimeout(() => setRectOn(true), 420);
      // after rect draws (~600ms), show image
      t2 = setTimeout(() => setImgOn(true), 420 + 620);
    } else {
      setImgOn(false);
      setRectOn(false);
      setLineOn(false);
    }
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [visible]);

  // Screenshot (placeholder for now)
  const screenshotSrc =
    profileUrl
      ? `https://image.thum.io/get/width/900/${encodeURIComponent(profileUrl)}`
      : "/linkedin_preview.png";


  return (
    <>
      {/* Absolute measuring target for TV position */}
      <div
        ref={tvRef}
        style={{ 
          position: "fixed",
          zIndex: 39, 
          width: isZooming ? "100vw" : dimensions.WIDTH, 
          height: isZooming ? "100vh" : dimensions.HEIGHT,
          left: "50%",
          top: isZooming ? "50%" : "35%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          transition: isZooming ? "all 800ms ease-out" : "none"
        }}
      />


      {/* SVG overlay for line + rect */}
      <svg className="fixed inset-0 pointer-events-none" style={{ zIndex: 40, width: "100vw", height: "100vh" }}>
        <defs>
          <linearGradient id="tvStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="tvGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal line from card → TV left */}
        {pts && !isZooming && !imgOn && (
          <path
            ref={lineRef}
            d={d}
            stroke="url(#tvStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#tvGlow)"
            fill="none"
            style={{
              transition: "stroke-dashoffset 400ms ease-out, opacity 200ms",
              opacity: visible ? 1 : 0,
              strokeDasharray: pathLen || 1,
              strokeDashoffset: lineOn ? 0 : (pathLen || 1),
            }}
          />
        )}

        {/* TV rectangle outline (centered) */}
        {pts && !isZooming && !imgOn && (
          <rect
            x="50%"
            y="35%"
            width={dimensions.WIDTH - 3}
            height={dimensions.HEIGHT - 3}
            rx={dimensions.RADIUS}
            ry={dimensions.RADIUS}
            fill="none"
            stroke="url(#tvStroke)"
            strokeWidth="3"
            filter="url(#tvGlow)"
            transform={`translate(-${(dimensions.WIDTH - 3) / 2}, -${(dimensions.HEIGHT - 3) / 2})`}
            style={{
              transition: "stroke-dashoffset 620ms cubic-bezier(.2,.8,.2,1), opacity 200ms",
              opacity: visible ? 1 : 0,
              strokeDasharray: rectLen || 1,
              strokeDashoffset: rectOn ? 0 : (rectLen || 1),
            }}
          />
        )}
      </svg>

      {/* TV content clipped inside the rounded rect (fades in after outline) */}
      <div
        className={`
          ${visible ? "opacity-100" : "opacity-0"}
          ${isZooming ? "transition-all duration-800 ease-out" : "transition-all duration-600 ease-out"}
        `}
        style={{ 
          position: "fixed",
          zIndex: 41, 
          width: isZooming ? "100vw" : dimensions.WIDTH, 
          height: isZooming ? "100vh" : dimensions.HEIGHT, 
          borderRadius: isZooming ? "0" : dimensions.RADIUS, 
          overflow: "hidden",
          left: "50%",
          top: isZooming ? "50%" : "35%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <img
          src={screenshotSrc}
          alt="LinkedIn preview"
          className="w-full h-full object-cover"
          style={{
            opacity: imgOn ? 1 : 0,
            transition: "opacity 280ms ease-out",
          }}
        />
        {/* optional vignette */}
        <div
          className="absolute inset-0"
          style={{
            pointerEvents: "none",
            background: "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.22))",
          }}
        />
      </div>
    </>
  );
}
