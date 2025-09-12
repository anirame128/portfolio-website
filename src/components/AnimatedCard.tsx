"use client";

import { useEffect, useState } from "react";

// Animation timing constants
const ANIMATION_TIMING = {
  CARD_POP_DELAY: 400,
  OUTLINE_DURATION: 800,
  FADE_DURATION: 500,
} as const;

// Card dimensions
const CARD_DIMENSIONS = {
  WIDTH: 448,
  HEIGHT: 768,
  MARGIN: 16,
} as const;


export default function AnimatedCard() {
  const [showOutline, setShowOutline] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hideOutline, setHideOutline] = useState(false);

  useEffect(() => {
    setShowOutline(true);
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      setHideOutline(true);
    }, ANIMATION_TIMING.CARD_POP_DELAY);
    return () => clearTimeout(contentTimer);
  }, []);

  return (
    <div className="relative w-[28rem] h-[48rem] ml-8">
      <AnimatedOutline 
        showOutline={showOutline} 
        hideOutline={hideOutline} 
      />
      <CardContent showContent={showContent} />
    </div>
  );
}

// Animated Outline Component
function AnimatedOutline({ 
  showOutline, 
  hideOutline 
}: { 
  showOutline: boolean; 
  hideOutline: boolean; 
}) {
  return (
    <svg
      className={`absolute inset-0 transition-opacity duration-${ANIMATION_TIMING.FADE_DURATION} ${
        showOutline && !hideOutline ? "opacity-100" : "opacity-0"
      }`}
      viewBox={`0 0 ${CARD_DIMENSIONS.WIDTH} ${CARD_DIMENSIONS.HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <OutlinePaths />
    </svg>
  );
}

// Outline Path Data
const OUTLINE_PATHS = [
  // Top side paths
  { d: "M224 24 L24 24", animation: "drawFromCenter", dashArray: "200" },
  { d: "M224 24 L424 24", animation: "drawFromCenter", dashArray: "200" },
  // Right side paths
  { d: "M424 384 L424 24", animation: "drawFromCenterVertical", dashArray: "360" },
  { d: "M424 384 L424 744", animation: "drawFromCenterVertical", dashArray: "360" },
  // Bottom side paths
  { d: "M224 744 L424 744", animation: "drawFromCenter", dashArray: "200" },
  { d: "M224 744 L24 744", animation: "drawFromCenter", dashArray: "200" },
  // Left side paths
  { d: "M24 384 L24 744", animation: "drawFromCenterVertical", dashArray: "360" },
  { d: "M24 384 L24 24", animation: "drawFromCenterVertical", dashArray: "360" },
] as const;

// Outline Paths Component
function OutlinePaths() {
  return (
    <>
      {OUTLINE_PATHS.map((path, index) => (
        <path
          key={index}
          d={path.d}
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={path.dashArray}
          strokeDashoffset={path.dashArray}
          style={{ 
            animation: `${path.animation} ${ANIMATION_TIMING.OUTLINE_DURATION}ms ease-in-out forwards` 
          }}
        />
      ))}
    </>
  );
}

// Card Content Component
function CardContent({ showContent }: { showContent: boolean }) {
  return (
    <div
      className={`absolute bg-white rounded-2xl border-2 border-gray-300 transition-all duration-500 ${
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        left: `${CARD_DIMENSIONS.MARGIN}px`,
        top: `${CARD_DIMENSIONS.MARGIN}px`,
        width: `${CARD_DIMENSIONS.WIDTH - (CARD_DIMENSIONS.MARGIN * 2)}px`,
        height: `${CARD_DIMENSIONS.HEIGHT - (CARD_DIMENSIONS.MARGIN * 2)}px`
      }}
    >
      <ProfilePicture />
    </div>
  );
}

// Profile Picture Component
function ProfilePicture() {
  return (
    <div className="flex justify-center pt-12">
      <div className="relative w-32 h-32">
        {/* Glowing revolving outline */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-400 to-blue-600 animate-spin" 
          style={{
            background: 'conic-gradient(from 0deg, #60a5fa, #3b82f6, #1d4ed8, #60a5fa)',
            animation: 'spin 3s linear infinite',
            filter: 'blur(1px) drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))'
          }}
        />
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
  );
}


