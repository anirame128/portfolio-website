"use client";
import React, { useRef, useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import RightSlopeField from "@/components/RightSlopeField";
import TVPreview from "@/components/TVPreview";

export default function Page() {
  const [linkedinHovered, setLinkedinHovered] = useState(false);
  const [hoverLocked, setHoverLocked] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const linkedinBtnRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple hover handlers with debouncing and hover lock
  const handleLinkedinHover = (hovered: boolean) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (hovered) {
      setHoverLocked(true);
      setLinkedinHovered(true);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = setTimeout(() => setHoverLocked(false), 250); // lock ~250ms
    } else {
      // only allow leaving if not locked
      hoverTimeoutRef.current = setTimeout(() => {
        if (!hoverLocked) setLinkedinHovered(false);
      }, 150);
    }
  };

  // Handle LinkedIn button click - zoom and redirect
  const handleLinkedinClick = () => {
    if (!linkedinHovered) return; // Only allow click when preview is visible

    setIsZooming(true);

    // Redirect mid-zoom for seamless transition effect
    setTimeout(() => {
      window.location.href = "https://www.linkedin.com/in/anirudh-ramesh123/";
    }, 400); // Redirect at 2/3 of zoom animation for "entering" effect
  };

  // Reset zoom state when component mounts (handles back button navigation)
  React.useEffect(() => {
    setIsZooming(false);
    setLinkedinHovered(false);

    // Reset on page visibility change (handles back button)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsZooming(false);
        setLinkedinHovered(false);
      }
    };

    // Reset when window loses focus (handles clicking off the webpage)
    const handleWindowBlur = () => {
      setLinkedinHovered(false);
      setHoverLocked(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);


  return (
    <main className="relative min-h-screen flex items-center justify-start p-4 bg-black">
      <RightSlopeField />

      <AnimatedCard
        cardRef={cardRef}
        linkedinBtnRef={linkedinBtnRef}
        setLinkedinHovered={handleLinkedinHover}
        onLinkedinClick={handleLinkedinClick}
      />


      {/* TV Preview Overlay (line + rectangle + screenshot) */}
      <TVPreview 
        visible={linkedinHovered} 
        cardRef={cardRef} 
        isZooming={isZooming}
      />
    </main>
  );
}

