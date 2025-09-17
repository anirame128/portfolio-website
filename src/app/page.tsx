"use client";
import React, { useRef, useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import BottomSlopeField from "@/components/BottomSlopeField";
import ParticleBox from "@/components/ParticleBox";

export default function Page() {
  const cardRef = useRef<HTMLDivElement>(null);
  const linkedinBtnRef = useRef<HTMLButtonElement>(null);
  const githubBtnRef = useRef<HTMLButtonElement>(null);
  const [isLinkedInHovered, setIsLinkedInHovered] = useState(false);
  const [isGitHubHovered, setIsGitHubHovered] = useState(false);
  const [isExperienceHovered, setIsExperienceHovered] = useState(false);
  const [isProjectsHovered, setIsProjectsHovered] = useState(false);
  const [isEducationHovered, setIsEducationHovered] = useState(false);
  const [isSkillsHovered, setIsSkillsHovered] = useState(false);

  // Handle LinkedIn button click - redirect
  const handleLinkedinClick = () => {
    window.location.href = "https://www.linkedin.com/in/anirudh-ramesh123/";
  };

  // Handle GitHub button click - redirect
  const handleGithubClick = () => {
    window.location.href = "https://github.com/anirame128";
  };

  // Handle LinkedIn hover state change
  const handleLinkedInHoverChange = (hovered: boolean) => {
    setIsLinkedInHovered(hovered);
  };

  // Handle GitHub hover state change
  const handleGitHubHoverChange = (hovered: boolean) => {
    setIsGitHubHovered(hovered);
  };

  // Handle Experience hover state change
  const handleExperienceHoverChange = (hovered: boolean) => {
    setIsExperienceHovered(hovered);
  };

  // Handle Projects hover state change
  const handleProjectsHoverChange = (hovered: boolean) => {
    setIsProjectsHovered(hovered);
  };

  // Handle Education hover state change
  const handleEducationHoverChange = (hovered: boolean) => {
    setIsEducationHovered(hovered);
  };

  // Handle Skills hover state change
  const handleSkillsHoverChange = (hovered: boolean) => {
    setIsSkillsHovered(hovered);
  };


  return (
    <main className="relative min-h-screen flex items-start justify-start p-4 bg-black pt-20">
      <BottomSlopeField />

          <div className="flex items-start gap-4">
            <AnimatedCard
              cardRef={cardRef}
              linkedinBtnRef={linkedinBtnRef}
              githubBtnRef={githubBtnRef}
              onLinkedinClick={handleLinkedinClick}
              onGithubClick={handleGithubClick}
              onLinkedInHoverChange={handleLinkedInHoverChange}
              onGitHubHoverChange={handleGitHubHoverChange}
              onExperienceHoverChange={handleExperienceHoverChange}
              onProjectsHoverChange={handleProjectsHoverChange}
              onEducationHoverChange={handleEducationHoverChange}
              onSkillsHoverChange={handleSkillsHoverChange}
            />
            
            <div className="mr-4">
              <ParticleBox 
                isLinkedInHovered={isLinkedInHovered} 
                isGitHubHovered={isGitHubHovered}
                isExperienceHovered={isExperienceHovered}
                isProjectsHovered={isProjectsHovered}
                isEducationHovered={isEducationHovered}
                isSkillsHovered={isSkillsHovered}
              />
            </div>
          </div>
    </main>
  );
}

