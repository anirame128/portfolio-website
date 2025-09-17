"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { generateInLetterTargets, type LetterConfig } from "./drawings/inLetters";
import { generateGitLogoTargets, type GitVizConfig } from "./drawings/gitBranches";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  isVisible: boolean;
  targetX?: number;
  targetY?: number;
  isForming?: boolean;
}

interface PhysicsParams {
  maxSpeed: number;
  driftMax: number;
  wander: number;
  springK: number;
  springC: number;
  minSpeed: number;
  snapRadius: number;
  scatterImpulse: { min: number; max: number };
}

interface ParticleConfig {
  count: number;
  size: number;
  colors: string[];
  opacity: number;
}

interface BoxConfig {
  height: number;
  minWidth: number;
  maxWidth: number;
  maxDevicePixelRatio: number;
}

interface LayoutConfig {
  cardWidth: number;
  gap: number;
  margin: number;
  rightMargin: number;
  padding: number;
}

const PARTICLE_CONFIG: ParticleConfig = {
  count: 400,
  size: 1.25,
  colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
  opacity: 0.9,
};

const BOX_CONFIG: BoxConfig = {
  height: 520,
  minWidth: 400,
  maxWidth: 1500,
  maxDevicePixelRatio: 2,
};

const LAYOUT_CONFIG: LayoutConfig = {
  cardWidth: 320,
  gap: 32,
  margin: 32,
  rightMargin: 16,
  padding: 16,
};

const PHYSICS_PARAMS: PhysicsParams = {
  maxSpeed: 4.0,
  driftMax: 1.8,
  wander: 0.10,
  springK: 14,
  springC: 2 * Math.sqrt(14),
  minSpeed: 0.15,
  snapRadius: 0.8,
  scatterImpulse: { min: 2.0, max: 4.0 },
};

const applySpringForces = (particle: Particle, physics: PhysicsParams, dt: number): void => {
  if (particle.targetX == null || particle.targetY == null) return;

  const dx = particle.targetX - particle.x;
  const dy = particle.targetY - particle.y;

  const ax = physics.springK * dx - physics.springC * particle.vx;
  const ay = physics.springK * dy - physics.springC * particle.vy;

  particle.vx += ax * dt;
  particle.vy += ay * dt;
};

const applyDriftPhysics = (particle: Particle, physics: PhysicsParams, dt: number): void => {
  // free drift: add tiny random wander; no friction decay
  particle.vx += (Math.random() - 0.5) * physics.wander * dt * 60;
  particle.vy += (Math.random() - 0.5) * physics.wander * dt * 60;

  // keep some motion alive
  const s2 = particle.vx * particle.vx + particle.vy * particle.vy;
  const min2 = physics.minSpeed * physics.minSpeed;
  if (s2 < min2) {
    const angle = Math.random() * Math.PI * 2;
    const impulse = physics.minSpeed * (1.0 + Math.random());
    particle.vx += Math.cos(angle) * impulse;
    particle.vy += Math.sin(angle) * impulse;
  }

  // cap free-drift speed lower than forming speed
  const driftMax2 = physics.driftMax * physics.driftMax;
  if (s2 > driftMax2) {
    const scale = physics.driftMax / Math.sqrt(s2);
    particle.vx *= scale;
    particle.vy *= scale;
  }
};

const clampSpeed = (particle: Particle, maxSpeed: number): void => {
  const s2 = particle.vx * particle.vx + particle.vy * particle.vy;
  const max2 = maxSpeed * maxSpeed;
  if (s2 > max2) {
    const k = maxSpeed / Math.sqrt(s2);
    particle.vx *= k;
    particle.vy *= k;
  }
};

const snapToTarget = (particle: Particle, snapRadius: number): void => {
  if (particle.targetX == null || particle.targetY == null) return;

  const dx = particle.targetX - particle.x;
  const dy = particle.targetY - particle.y;
  const distance = Math.hypot(dx, dy);

  if (distance < snapRadius) {
    particle.x = particle.targetX;
    particle.y = particle.targetY;
    particle.vx *= 0.2;
    particle.vy *= 0.2;
  }
};

const applyScatterImpulse = (particle: Particle, scatterConfig: { min: number; max: number }): void => {
  const angle = Math.random() * Math.PI * 2;
  const impulse = scatterConfig.min + Math.random() * (scatterConfig.max - scatterConfig.min);
  particle.vx += Math.cos(angle) * impulse;
  particle.vy += Math.sin(angle) * impulse;
};

const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number, maxDpr: number): void => {
  const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

// Pre-render a crisp dot sprite for batched drawing
function makeDotSprite(radius: number, dpr: number) {
  const r = Math.ceil(radius * dpr);
  const size = r * 2 + 2; // small pad
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  ctx.fill();
  return { canvas: c, drawOffset: (size / 2) / dpr };
}

const handleWallCollisions = (particle: Particle, nx: number, ny: number, boxWidth: number, boxHeight: number): void => {
  if (nx < 0) {
    particle.x = 0;
    particle.vx = Math.abs(particle.vx);
  } else if (nx > boxWidth) {
    particle.x = boxWidth;
    particle.vx = -Math.abs(particle.vx);
  } else {
    particle.x = nx;
  }

  if (ny < 0) {
    particle.y = 0;
    particle.vy = Math.abs(particle.vy);
  } else if (ny > boxHeight) {
    particle.y = boxHeight;
    particle.vy = -Math.abs(particle.vy);
  } else {
    particle.y = ny;
  }
};

export default function ParticleBox({ 
  isLinkedInHovered, 
  isGitHubHovered 
}: { 
  isLinkedInHovered: boolean;
  isGitHubHovered: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const [boxWidth, setBoxWidth] = useState<number>(800);

  const calculateWidth = useCallback(() => {
    const screenWidth = window.innerWidth;
    const availableWidth = screenWidth -
      LAYOUT_CONFIG.padding * 2 -
      LAYOUT_CONFIG.margin -
      LAYOUT_CONFIG.cardWidth -
      LAYOUT_CONFIG.gap -
      LAYOUT_CONFIG.rightMargin;

    return Math.max(BOX_CONFIG.minWidth, Math.min(availableWidth, BOX_CONFIG.maxWidth));
  }, []);

  // Calculate responsive width
  useEffect(() => {
    const updateWidth = () => setBoxWidth(calculateWidth());

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [calculateWidth]);

  const createParticle = useCallback((id: number, boxWidth: number): Particle => {
    return {
      id,
      x: Math.random() * boxWidth,
      y: Math.random() * BOX_CONFIG.height,
      vx: (Math.random() - 0.5) * 2.0,
      vy: (Math.random() - 0.5) * 2.0,
      size: PARTICLE_CONFIG.size,
      opacity: PARTICLE_CONFIG.opacity,
      color: PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)],
      isVisible: true,
    };
  }, []);

  const initializeParticles = useCallback((boxWidth: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      particles.push(createParticle(i, boxWidth));
    }
    return particles;
  }, [createParticle]);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = initializeParticles(boxWidth);
  }, [boxWidth, initializeParticles]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cap DPR based on width for better performance on wide screens
    const maxDpr = boxWidth > 1100 ? 1.5 : BOX_CONFIG.maxDevicePixelRatio;
    setupCanvas(canvas, ctx, boxWidth, BOX_CONFIG.height, maxDpr);

    // Create sprite once for batched drawing
    const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
    const { canvas: dotSprite, drawOffset } = makeDotSprite(PARTICLE_CONFIG.size, dpr);

    const particles = particlesRef.current;
    const physics = PHYSICS_PARAMS;

    let last = performance.now();
    let wanderToggle = false;

    const animate = () => {
      const now = performance.now();
      // clamp dt to avoid big jumps after tab switch
      const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
      last = now;

      // Set canvas state once per frame
      ctx.clearRect(0, 0, boxWidth, BOX_CONFIG.height);
      ctx.globalAlpha = PARTICLE_CONFIG.opacity;

      wanderToggle = !wanderToggle;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.isVisible) continue;

        if (p.isForming && p.targetX != null && p.targetY != null) {
          applySpringForces(p, physics, dt);
          clampSpeed(p, physics.maxSpeed);
          snapToTarget(p, physics.snapRadius);
        } else {
          // Halve wander frequency for better performance
          if (wanderToggle) {
            applyDriftPhysics(p, physics, dt);
          } else {
            // Still integrate and clamp without new randoms
            const s2 = p.vx * p.vx + p.vy * p.vy;
            const driftMax2 = physics.driftMax * physics.driftMax;
            if (s2 > driftMax2) {
              const scale = physics.driftMax / Math.sqrt(s2);
              p.vx *= scale;
              p.vy *= scale;
            }
          }
        }

        // integrate
        const nx = p.x + p.vx * dt * 60; // scale for visual feel
        const ny = p.y + p.vy * dt * 60;

        // walls: reflect and keep inside (no sticking)
        handleWallCollisions(p, nx, ny, boxWidth, BOX_CONFIG.height);

        // Batched sprite drawing
        ctx.drawImage(dotSprite, p.x - drawOffset, p.y - drawOffset);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [boxWidth]);

  // Generate letter formation targets
  const generateLetterTargets = useCallback(() => {
    const config: LetterConfig = {
      boxWidth: boxWidth,
      boxHeight: BOX_CONFIG.height,
      particleCount: PARTICLE_CONFIG.count,
    };
    return generateInLetterTargets(config);
  }, [boxWidth]);

  // Generate Git logo targets
  const generateGitTargets = useCallback(() => {
    const config: GitVizConfig = {
      boxWidth,
      boxHeight: BOX_CONFIG.height,
      particleCount: PARTICLE_CONFIG.count,
      // Git logo styling - bolder look
      stroke: 9,
      step: 5,
      nodeRadius: 11,
      nodeStep: 5,
    };
    return generateGitLogoTargets(config);
  }, [boxWidth]);

  // Assign particles to targets based on hover state
  useEffect(() => {
    const particles = particlesRef.current;
    
    if (isLinkedInHovered) {
      const targets = generateLetterTargets();

      // stable mapping: sort views, but don't mutate backing arrays
      const idxs = particles.map((_, i) => i).sort((a, b) => particles[a].x - particles[b].x);
      const tids = targets.map((_, i) => i).sort((a, b) => targets[a].x - targets[b].x);

      const N = Math.min(idxs.length, tids.length);
      for (let i = 0; i < N; i++) {
        const p = particles[idxs[i]];
        const t = targets[tids[i]];
        p.targetX = t.x;
        p.targetY = t.y;
        p.isForming = true;
      }
      for (let i = N; i < particles.length; i++) {
        const p = particles[idxs[i]];
        p.targetX = undefined; p.targetY = undefined; p.isForming = false;
      }
    } else if (isGitHubHovered) {
      const targets = generateGitTargets();

      // stable mapping: sort views, but don't mutate backing arrays
      const idxs = particles.map((_, i) => i).sort((a, b) => particles[a].x - particles[b].x);
      const tids = targets.map((_, i) => i).sort((a, b) => targets[a].x - targets[b].x);

      const N = Math.min(idxs.length, tids.length);
      for (let i = 0; i < N; i++) {
        const p = particles[idxs[i]];
        const t = targets[tids[i]];
        p.targetX = t.x;
        p.targetY = t.y;
        p.isForming = true;
      }
      for (let i = N; i < particles.length; i++) {
        const p = particles[idxs[i]];
        p.targetX = undefined; p.targetY = undefined; p.isForming = false;
      }
    } else {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // if it was forming, add a small scatter impulse
        if (p.isForming) {
          applyScatterImpulse(p, PHYSICS_PARAMS.scatterImpulse);
        }
        p.isForming = false;
        p.targetX = p.targetY = undefined;
      }
    }
  }, [isLinkedInHovered, isGitHubHovered, boxWidth, generateLetterTargets, generateGitTargets]);

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden bg-black"
        style={{
          width: boxWidth,
          height: BOX_CONFIG.height,
          border: "0.5px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={boxWidth}
          height={BOX_CONFIG.height}
          className="absolute inset-0 rounded-2xl"
        />
      </div>
    </div>
  );
}