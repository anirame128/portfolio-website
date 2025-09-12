"use client";

import { useEffect, useState } from "react";

export default function AnimatedCard() {
  const [showOutline, setShowOutline] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hideOutline, setHideOutline] = useState(false);

  useEffect(() => {
    setShowOutline(true);
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      setHideOutline(true);
    }, 400);
    return () => clearTimeout(contentTimer);
  }, []);

  return (
    <div className="relative w-96 h-[36rem]">
      {/* Animated Outline */}
      <svg
        className={`absolute inset-0 transition-opacity duration-500 ${
          showOutline && !hideOutline ? "opacity-100" : "opacity-0"
        }`}
        viewBox="0 0 384 576"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top side - center to left */}
        <path
          d="M192 20 L20 20"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="172"
          strokeDashoffset="172"
          style={{ animation: "drawTopLeft 0.8s ease-in-out forwards" }}
        />
        {/* Top side - center to right */}
        <path
          d="M192 20 L364 20"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="172"
          strokeDashoffset="172"
          style={{ animation: "drawTopRight 0.8s ease-in-out forwards" }}
        />
        {/* Right side - center to top */}
        <path
          d="M364 288 L364 20"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="268"
          strokeDashoffset="268"
          style={{ animation: "drawRightTop 0.8s ease-in-out forwards" }}
        />
        {/* Right side - center to bottom */}
        <path
          d="M364 288 L364 556"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="268"
          strokeDashoffset="268"
          style={{ animation: "drawRightBottom 0.8s ease-in-out forwards" }}
        />
        {/* Bottom side - center to right */}
        <path
          d="M192 556 L364 556"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="172"
          strokeDashoffset="172"
          style={{ animation: "drawBottomRight 0.8s ease-in-out forwards" }}
        />
        {/* Bottom side - center to left */}
        <path
          d="M192 556 L20 556"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="172"
          strokeDashoffset="172"
          style={{ animation: "drawBottomLeft 0.8s ease-in-out forwards" }}
        />
        {/* Left side - center to bottom */}
        <path
          d="M20 288 L20 556"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="268"
          strokeDashoffset="268"
          style={{ animation: "drawLeftBottom 0.8s ease-in-out forwards" }}
        />
        {/* Left side - center to top */}
        <path
          d="M20 288 L20 20"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="268"
          strokeDashoffset="268"
          style={{ animation: "drawLeftTop 0.8s ease-in-out forwards" }}
        />
      </svg>

      {/* Card Content (positioned inside the stroke boundaries) */}
      <div
        className={`absolute bg-white rounded-2xl border-2 border-gray-300 transition-all duration-500 ${
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          left: '16px',
          top: '16px',
          width: '352px',
          height: '544px'
        }}
      >
        {/* Content goes here */}
      </div>
    </div>
  );
}
