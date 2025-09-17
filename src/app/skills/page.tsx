"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RightSlopeField from "../../components/RightSlopeField";

export default function SkillsPage() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start animation after page loads
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Right slope field covering the full right side */}
      <RightSlopeField shouldAnimate={shouldAnimate} />
      
      {/* Skills Content with Vertical Scroll */}
      <div className="relative z-10 h-screen overflow-y-auto scrollbar-hide">
        <div className="p-8 pt-20">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white font-bricolage mb-4">
                My Skills
              </h1>
              <p className="text-gray-300 text-lg font-bricolage">
                Technical expertise and professional competencies
              </p>
            </div>

            {/* Skills Content - Placeholder */}
            <div className="space-y-12">
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-4">
                    Skills Content Coming Soon
                  </h2>
                  <p className="text-gray-600 font-bricolage">
                    This section will showcase your technical skills, programming languages, frameworks, and professional competencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 text-white hover:text-gray-300 transition-colors z-20"
        aria-label="Go back to main page"
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
      </button>
    </div>
  );
}
