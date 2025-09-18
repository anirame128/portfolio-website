"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedCard from "@/components/AnimatedCard";
import BottomSlopeField from "@/components/BottomSlopeField";
import ParticleBox from "@/components/ParticleBox";
import { motion } from "framer-motion";


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

  const router = useRouter();

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

  // Handle Projects button click - navigate to route
  const handleProjectsClick = () => {
    router.push("/projects");
  };

  // Handle Experience button click - navigate to route
  const handleExperienceClick = () => {
    router.push("/experience");
  };

  // Handle Education button click - navigate to route
  const handleEducationClick = () => {
    router.push("/education");
  };

  // Handle Skills button click - navigate to route
  const handleSkillsClick = () => {
    router.push("/skills");
  };

  // Listen for particle scatter events
  useEffect(() => {
    const onParticleScatter = () => {
      // Trigger particle scatter by clearing all hover states
      setIsLinkedInHovered(false);
      setIsGitHubHovered(false);
      setIsExperienceHovered(false);
      setIsProjectsHovered(false);
      setIsEducationHovered(false);
      setIsSkillsHovered(false);
    };
    
    window.addEventListener("particle-scatter", onParticleScatter);
    
    return () => {
      window.removeEventListener("particle-scatter", onParticleScatter);
    };
  }, []);



  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <div className="relative min-h-screen flex items-start justify-start p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
        >
          <BottomSlopeField />
        </motion.div>

        <div className="flex items-start gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
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
              onProjectsClick={handleProjectsClick}
              onExperienceClick={handleExperienceClick}
              onEducationClick={handleEducationClick}
              onSkillsClick={handleSkillsClick}
            />
          </motion.div>

          <motion.div
            className="mr-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ParticleBox
              isLinkedInHovered={isLinkedInHovered}
              isGitHubHovered={isGitHubHovered}
              isExperienceHovered={isExperienceHovered}
              isProjectsHovered={isProjectsHovered}
              isEducationHovered={isEducationHovered}
              isSkillsHovered={isSkillsHovered}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}

