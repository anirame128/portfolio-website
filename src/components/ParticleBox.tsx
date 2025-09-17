"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

type Props = {
  isLinkedInHovered: boolean;
  isGitHubHovered: boolean;
  isExperienceHovered?: boolean;
  isProjectsHovered?: boolean;
  isEducationHovered?: boolean;
  isSkillsHovered?: boolean;
  boxHeight?: number;
  particleCount?: number;
  maxDevicePixelRatio?: number;
};

export default function ParticleBox({
  isLinkedInHovered,
  isGitHubHovered,
  isExperienceHovered = false,
  isProjectsHovered = false,
  isEducationHovered = false,
  isSkillsHovered = false,
  boxHeight = 520,
  particleCount = 2000,
  maxDevicePixelRatio = 2,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const transferredRef = useRef(false);
  const offscreenRef = useRef<OffscreenCanvas | null>(null);
  const workerInitializedRef = useRef(false);
  const [boxWidth, setBoxWidth] = useState(800);

  // match your layout logic
  const calcWidth = useCallback(() => {
    const padding = 16, margin = 32, cardWidth = 320, gap = 32, rightMargin = 16;
    const minW = 400, maxW = 1500;
    const w = window.innerWidth - padding * 2 - margin - cardWidth - gap - rightMargin;
    return Math.max(minW, Math.min(w, maxW));
  }, []);

  useEffect(() => {
    const onResize = () => setBoxWidth(calcWidth());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcWidth]);

  // One-time init: create worker and transfer control exactly once (survives StrictMode double-invoke)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create worker once
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./particles.worker.ts", import.meta.url), { type: "module" });
    }
    const worker = workerRef.current;

    // Guard for OffscreenCanvas availability
    const hasOffscreen = typeof (canvas as unknown as { transferControlToOffscreen?: () => OffscreenCanvas }).transferControlToOffscreen === "function";
    if (!hasOffscreen) {
      // If not supported, do nothing (could add a canvas main-thread fallback here if desired)
      return;
    }

    // Transfer once, or reuse saved OffscreenCanvas (avoid StrictMode double-transfer)
    if (!transferredRef.current && !offscreenRef.current) {
      type CanvasWithOffscreen = HTMLCanvasElement & { transferControlToOffscreen: () => OffscreenCanvas };
      offscreenRef.current = (canvas as CanvasWithOffscreen).transferControlToOffscreen();
      transferredRef.current = true;
    }

    if (!offscreenRef.current) return;

    // Initialize worker only once
    if (!workerInitializedRef.current) {
      worker.postMessage(
        {
          type: "init",
          canvas: offscreenRef.current,
          config: {
            width: boxWidth,
            height: boxHeight,
            particleCount,
            maxDevicePixelRatio,
            physics: {
              maxSpeed: 4.0,
              driftMax: 1.8,
              wander: 0.10,
              springK: 14.0,
              springC: 2 * Math.sqrt(14.0),
              minSpeed: 0.15,
              snapRadius: 0.8,
              scatterMin: 2.0,
              scatterMax: 4.0,
            },
            dotSize: 1.25,
            opacity: 0.9,
          },
        },
        [offscreenRef.current as unknown as Transferable]
      );
      workerInitializedRef.current = true;
    }

    return () => {
      // In dev StrictMode, effects run twice: don't reset transferred/offscreen to avoid double-transfer
      worker.postMessage({ type: "dispose" });
    };
  }, [boxWidth, boxHeight, particleCount, maxDevicePixelRatio]);

  // Forward hover state changes without blocking
  useEffect(() => {
    workerRef.current?.postMessage({ 
      type: "hover", 
      isLinkedInHovered, 
      isGitHubHovered,
      isExperienceHovered,
      isProjectsHovered,
      isEducationHovered,
      isSkillsHovered
    });
  }, [isLinkedInHovered, isGitHubHovered, isExperienceHovered, isProjectsHovered, isEducationHovered, isSkillsHovered]);

  // If size changes, notify worker to resize (no re-transfer)
  useEffect(() => {
    workerRef.current?.postMessage({ type: "resize", width: boxWidth, height: boxHeight });
  }, [boxWidth, boxHeight]);

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden bg-black"
        style={{ width: boxWidth, height: boxHeight, border: "0.5px solid rgba(255,255,255,0.3)" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 rounded-2xl" />
      </div>
    </div>
  );
}