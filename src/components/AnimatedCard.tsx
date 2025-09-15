"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Animation timing constants
const ANIMATION_TIMING = {
  CARD_POP_DELAY: 400,
} as const;

// Card dimensions
const CARD_DIMENSIONS = {
  WIDTH: 320,
  HEIGHT: 520, // Increased to accommodate image + card content
  MARGIN: 16,
  IMAGE_HEIGHT: 240, // Height for the image section
  CARD_CONTENT_HEIGHT: 240, // Height for the card content section
} as const;

export default function AnimatedCard({
  cardRef,
  linkedinBtnRef,
  setLinkedinHovered,
  onLinkedinClick,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  linkedinBtnRef: React.RefObject<HTMLButtonElement | null>;
  setLinkedinHovered: (hovered: boolean) => void;
  onLinkedinClick: () => void;
}) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, ANIMATION_TIMING.CARD_POP_DELAY);
    return () => clearTimeout(contentTimer);
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative ml-8"
      style={{ width: CARD_DIMENSIONS.WIDTH, height: CARD_DIMENSIONS.HEIGHT }}
    >
      <CardContent
        showContent={showContent}
        linkedinBtnRef={linkedinBtnRef}
        setLinkedinHovered={setLinkedinHovered}
        onLinkedinClick={onLinkedinClick}
      />
    </div>
  );
}


// Card Content Component
function CardContent({
  showContent,
  linkedinBtnRef,
  setLinkedinHovered,
  onLinkedinClick,
}: {
  showContent: boolean;
  linkedinBtnRef: React.RefObject<HTMLButtonElement | null>;
  setLinkedinHovered: (hovered: boolean) => void;
  onLinkedinClick: () => void;
}) {
  return (
    <div
      className={`absolute transition-all duration-500 ${
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        left: CARD_DIMENSIONS.MARGIN,
        top: CARD_DIMENSIONS.MARGIN,
        width: CARD_DIMENSIONS.WIDTH - CARD_DIMENSIONS.MARGIN * 2,
        height: CARD_DIMENSIONS.HEIGHT - CARD_DIMENSIONS.MARGIN * 2,
      }}
    >
      {/* Animated Gradient Border */}
      <div
        className="relative w-full h-full rounded-2xl p-[2px] shimmer-border shadow-[0_0_25px_rgba(125,211,252,0.5)]"
        style={{
          background: "linear-gradient(90deg,#7dd3fc,#3b82f6,#1e40af)",
        }}
      >
        {/* Inner Card */}
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
          {/* Image Section */}
          <div className="relative" style={{ height: CARD_DIMENSIONS.IMAGE_HEIGHT }}>
            <ProfilePicture />
          </div>

          {/* Card Content Section */}
          <div
            className="relative bg-white px-6 py-4"
            style={{ height: CARD_DIMENSIONS.CARD_CONTENT_HEIGHT }}
          >
            <CardInfo
              linkedinBtnRef={linkedinBtnRef}
              setLinkedinHovered={setLinkedinHovered}
              onLinkedinClick={onLinkedinClick}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

// Profile Picture Component
function ProfilePicture() {
  return (
    <div className="w-full h-full">
      <Image
        src="/profile_pic.jpeg"
        alt="Profile"
        fill
        className="object-cover"
      />
    </div>
  );
}

// Card Info Component
function CardInfo({
  linkedinBtnRef,
  setLinkedinHovered,
  onLinkedinClick,
}: {
  linkedinBtnRef: React.RefObject<HTMLButtonElement | null>;
  setLinkedinHovered: (hovered: boolean) => void;
  onLinkedinClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Name with checkmark */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-black font-bricolage">Anirudh Ramesh</h3>
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-2 font-bricolage">
        swe building in public • crafting digital experiences • exploring ai/ml
      </p>

      {/* Modern Button Grid */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {/* LinkedIn */}
        <button
          ref={linkedinBtnRef}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-transform duration-300 relative overflow-hidden shimmer-flow glow-pulse button-hover cursor-pointer"
          style={{
            background:
              "linear-gradient(45deg,#7dd3fc,#3b82f6,#1e40af,#3b82f6,#7dd3fc)",
            backgroundSize: "200% 200%",
          }}
          onMouseEnter={() => setLinkedinHovered(true)}
          onMouseLeave={() => setLinkedinHovered(false)}
          onClick={onLinkedinClick}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">LinkedIn</span>
        </button>
        
        {/* GitHub */}
        <button className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden shimmer-flow glow-pulse button-hover" 
               style={{ 
                 background: 'linear-gradient(45deg, #7dd3fc, #3b82f6, #1e40af, #3b82f6, #7dd3fc)',
                 backgroundSize: '200% 200%'
               }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">GitHub</span>
        </button>
        
        {/* Projects */}
        <button className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden shimmer-flow glow-pulse button-hover" 
               style={{ 
                 background: 'linear-gradient(45deg, #7dd3fc, #3b82f6, #1e40af, #3b82f6, #7dd3fc)',
                 backgroundSize: '200% 200%'
               }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">Projects</span>
        </button>
        
        {/* Education */}
        <button className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden shimmer-flow glow-pulse button-hover" 
               style={{ 
                 background: 'linear-gradient(45deg, #7dd3fc, #3b82f6, #1e40af, #3b82f6, #7dd3fc)',
                 backgroundSize: '200% 200%'
               }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">Education</span>
        </button>
        
        {/* Work Experience */}
        <button className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden shimmer-flow glow-pulse button-hover" 
               style={{ 
                 background: 'linear-gradient(45deg, #7dd3fc, #3b82f6, #1e40af, #3b82f6, #7dd3fc)',
                 backgroundSize: '200% 200%'
               }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2V4c0-1.11-.89-2-2-2H8c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM8 4h8v2H8V4zm12 15H4V8h16v11z"/>
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">Experience</span>
        </button>
        
        {/* Skills */}
        <button className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden shimmer-flow glow-pulse button-hover" 
               style={{ 
                 background: 'linear-gradient(45deg, #7dd3fc, #3b82f6, #1e40af, #3b82f6, #7dd3fc)',
                 backgroundSize: '200% 200%'
               }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          <span className="text-xs font-medium text-white font-bricolage">Skills</span>
        </button>
      </div>
    </div>
  );
}


