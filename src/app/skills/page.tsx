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

            {/* Skills Content */}
            <div className="space-y-12">
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Python</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">JavaScript</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">TypeScript</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">SQL</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">HTML5</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">CSS</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Libraries & Frameworks
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">React</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Next.js</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Node.js</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">FastAPI</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Material-UI</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Tailwind CSS</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Chart.js</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">PostgreSQL</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Pinecone</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Supabase</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Developer Tools
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">AWS</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">GCP</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Azure</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Docker</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Git</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Vercel</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Railway</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">PostHog</span>
                    <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">Playwright</span>
                  </div>
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
