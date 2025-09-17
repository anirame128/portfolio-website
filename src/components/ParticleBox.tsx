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
  const offscreenRef = useRef<OffscreenCanvas | null>(null);
  const transferredRef = useRef(false);
  const initializedRef = useRef(false);

  const [boxWidth, setBoxWidth] = useState(800);

  const calcWidth = useCallback(() => {
    const padding = 16, margin = 32, cardWidth = 320, gap = 32, rightMargin = 16;
    const minW = 400, maxW = 1500;
    const w = window.innerWidth - padding * 2 - margin - cardWidth - gap - rightMargin;
    return Math.max(minW, Math.min(w, maxW));
  }, []);

  useEffect(() => {
    const onResize = () => setBoxWidth(calcWidth());
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [calcWidth]);

  // one-time init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./particles-worker.ts", import.meta.url), { type: "module" });
    }
    const worker = workerRef.current;

    const canTransfer = typeof (canvas as unknown as { transferControlToOffscreen?: () => OffscreenCanvas }).transferControlToOffscreen === "function";
    if (!canTransfer) {
      // You could implement a main-thread fallback here if you need to support Safari <16.4
      return;
    }

    if (!transferredRef.current && !offscreenRef.current) {
      offscreenRef.current = (canvas as unknown as { transferControlToOffscreen: () => OffscreenCanvas }).transferControlToOffscreen();
      transferredRef.current = true;
    }
    if (!offscreenRef.current) return;

    if (!initializedRef.current) {
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
      initializedRef.current = true;
    }

    return () => {
      worker.postMessage({ type: "dispose" });
    };
  }, [boxWidth, boxHeight, particleCount, maxDevicePixelRatio]);

  // propagate hover state
  useEffect(() => {
    workerRef.current?.postMessage({
      type: "hover",
      isLinkedInHovered,
      isGitHubHovered,
      isExperienceHovered,
      isProjectsHovered,
      isEducationHovered,
      isSkillsHovered,
    });
  }, [
    isLinkedInHovered,
    isGitHubHovered,
    isExperienceHovered,
    isProjectsHovered,
    isEducationHovered,
    isSkillsHovered,
  ]);

  // react to size changes
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