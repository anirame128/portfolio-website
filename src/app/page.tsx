"use client";
import React, { useRef } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import BottomSlopeField from "@/components/BottomSlopeField";

export default function Page() {
  const cardRef = useRef<HTMLDivElement>(null);
  const linkedinBtnRef = useRef<HTMLButtonElement>(null);

  // Handle LinkedIn button click - redirect
  const handleLinkedinClick = () => {
    window.location.href = "https://www.linkedin.com/in/anirudh-ramesh123/";
  };


  return (
    <main className="relative min-h-screen flex items-start justify-start p-4 bg-black pt-20">
      <BottomSlopeField />

      <AnimatedCard
        cardRef={cardRef}
        linkedinBtnRef={linkedinBtnRef}
        onLinkedinClick={handleLinkedinClick}
      />
    </main>
  );
}

