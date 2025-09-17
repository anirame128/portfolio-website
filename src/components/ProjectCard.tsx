"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Animation timing constants
const ANIMATION_TIMING = {
  CARD_POP_DELAY: 400,
} as const;

// Card dimensions - horizontal/landscape layout
const CARD_DIMENSIONS = {
  WIDTH: 1000, // Even larger width to fit more information
  HEIGHT: 450, // Increased height for better content fit
  MARGIN: 16,
  IMAGE_WIDTH: 500, // Width for the image section (left side)
  CONTENT_WIDTH: 500, // Width for the content section (right side)
} as const;

interface ProjectCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  projectUrl: string;
  liveUrl?: string; // Optional live demo URL
  skills: string[];
  delay?: number; // For staggered animations
}

export default function ProjectCard({
  title,
  description,
  imageSrc,
  imageAlt,
  projectUrl,
  liveUrl,
  skills,
  delay = 0,
}: ProjectCardProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, ANIMATION_TIMING.CARD_POP_DELAY + delay);
    return () => clearTimeout(contentTimer);
  }, [delay]);

  return (
    <div
      className={`relative transition-all duration-500 ${
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ 
        width: CARD_DIMENSIONS.WIDTH, 
        height: CARD_DIMENSIONS.HEIGHT 
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
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden flex flex-row">
          {/* Image Section - Left Side */}
          <div 
            className="relative flex-shrink-0" 
            style={{ width: CARD_DIMENSIONS.IMAGE_WIDTH }}
          >
            <ProjectImage src={imageSrc} alt={imageAlt} />
          </div>

          {/* Content Section - Right Side */}
          <div
            className="relative bg-white px-6 py-5 flex flex-col flex-grow"
            style={{ width: CARD_DIMENSIONS.CONTENT_WIDTH }}
          >
            <ProjectContent
              title={title}
              description={description}
              projectUrl={projectUrl}
              liveUrl={liveUrl}
              skills={skills}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Image Component
function ProjectImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full h-full relative">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}

// Project Content Component
function ProjectContent({
  title,
  description,
  projectUrl,
  liveUrl,
  skills,
}: {
  title: string;
  description: string;
  projectUrl: string;
  liveUrl?: string;
  skills: string[];
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <h3 className="text-xl font-semibold text-black font-bricolage mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 font-bricolage leading-relaxed flex-grow">
        {description}
      </p>

      {/* Skills */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2 font-bricolage">
          Skills Used:
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bricolage"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Project Link Buttons */}
      <div className="flex gap-3 mt-auto pt-2">
        <ProjectButton url={projectUrl} label="View Code" icon="code" />
        {liveUrl && (
          <ProjectButton url={liveUrl} label="Live Demo" icon="external" />
        )}
      </div>
    </div>
  );
}

// Project Button Component
function ProjectButton({ 
  url, 
  label, 
  icon 
}: { 
  url: string; 
  label: string; 
  icon: 'code' | 'external'; 
}) {
  const iconSvg = icon === 'code' ? (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <button
      className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-transform duration-300 relative overflow-hidden shimmer-flow glow-pulse button-hover cursor-pointer flex-1"
      style={{
        background: "linear-gradient(45deg,#7dd3fc,#3b82f6,#1e40af,#3b82f6,#7dd3fc)",
        backgroundSize: "200% 200%",
      }}
      onClick={() => window.open(url, '_blank')}
    >
      {iconSvg}
      <span className="text-sm font-medium text-white font-bricolage">{label}</span>
    </button>
  );
}
