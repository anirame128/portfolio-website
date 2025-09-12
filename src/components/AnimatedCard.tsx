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
    <div className="relative w-[28rem] h-[48rem] ml-8">
      {/* Animated Outline */}
      <svg
        className={`absolute inset-0 transition-opacity duration-500 ${
          showOutline && !hideOutline ? "opacity-100" : "opacity-0"
        }`}
        viewBox="0 0 448 768"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top side - center to left */}
        <path
          d="M224 24 L24 24"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animation: "drawTopLeft 0.8s ease-in-out forwards" }}
        />
        {/* Top side - center to right */}
        <path
          d="M224 24 L424 24"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animation: "drawTopRight 0.8s ease-in-out forwards" }}
        />
        {/* Right side - center to top */}
        <path
          d="M424 384 L424 24"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="360"
          strokeDashoffset="360"
          style={{ animation: "drawRightTop 0.8s ease-in-out forwards" }}
        />
        {/* Right side - center to bottom */}
        <path
          d="M424 384 L424 744"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="360"
          strokeDashoffset="360"
          style={{ animation: "drawRightBottom 0.8s ease-in-out forwards" }}
        />
        {/* Bottom side - center to right */}
        <path
          d="M224 744 L424 744"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animation: "drawBottomRight 0.8s ease-in-out forwards" }}
        />
        {/* Bottom side - center to left */}
        <path
          d="M224 744 L24 744"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animation: "drawBottomLeft 0.8s ease-in-out forwards" }}
        />
        {/* Left side - center to bottom */}
        <path
          d="M24 384 L24 744"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="360"
          strokeDashoffset="360"
          style={{ animation: "drawLeftBottom 0.8s ease-in-out forwards" }}
        />
        {/* Left side - center to top */}
        <path
          d="M24 384 L24 24"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="360"
          strokeDashoffset="360"
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
          width: '416px',
          height: '736px'
        }}
      >
        {/* Profile Picture Circle */}
        <div className="flex justify-center pt-12">
          <div className="relative w-32 h-32">
            {/* Glowing revolving outline */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-400 to-blue-600 animate-spin" 
                 style={{
                   background: 'conic-gradient(from 0deg, #60a5fa, #3b82f6, #1d4ed8, #60a5fa)',
                   animation: 'spin 3s linear infinite',
                   filter: 'blur(1px) drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))'
                 }}>
            </div>
            {/* Profile image */}
            <div className="absolute inset-1 w-30 h-30 rounded-full border-2 border-gray-300 overflow-hidden bg-white">
              <img 
                src="/profile_pic.jpeg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
