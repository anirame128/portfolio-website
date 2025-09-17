"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RightSlopeField from "../../components/RightSlopeField";
import ProjectCard from "../../components/ProjectCard";

export default function ProjectsPage() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start animation after page loads
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Project data with detailed descriptions
  const projects = [
    {
      title: "Aven Support Agent",
      description: "AI-powered customer support system for Aven financial services featuring RAG-based Q&A, voice interfaces, and call scheduling. Built with FastAPI, OpenAI, and Pinecone for intelligent 24/7 customer support.",
      imageSrc: "/aven_support_agent.png",
      imageAlt: "Aven Support Agent Screenshot",
      projectUrl: "https://github.com/anirame128/aven-support-agent",
      liveUrl: "https://aven-support-agent.vercel.app",
      skills: ["Python", "FastAPI", "OpenAI", "Pinecone", "Next.js", "TypeScript", "Google Calendar API"],
    },
    {
      title: "PR Agent",
      description: "AI-powered GitHub repository automation tool that clones repositories, analyzes codebases, and creates pull requests based on natural language prompts. Features secure E2B sandboxing and Groq AI integration.",
      imageSrc: "/pr_agent.png",
      imageAlt: "PR Agent Screenshot",
      projectUrl: "https://github.com/anirame128/pr-agent",
      skills: ["Python", "FastAPI", "E2B", "Groq AI", "GitHub API", "Docker"],
    },
    {
      title: "Portfolio Website",
      description: "Modern portfolio website with interactive particle animations, dynamic workspaces, and immersive user experiences. Built with Next.js, TypeScript, and Three.js featuring custom animations and responsive design.",
      imageSrc: "/portfolio_website.png",
      imageAlt: "Portfolio Website Screenshot",
      projectUrl: "https://github.com/anirame128/portfolio-website",
      skills: ["Next.js", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion", "Web Workers"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-black">
      {/* Right slope field covering the full right side */}
      <RightSlopeField shouldAnimate={shouldAnimate} />
      
      {/* Projects Content with Vertical Scroll */}
      <div className="relative z-10 h-screen overflow-y-auto scrollbar-hide">
        <div className="p-8 pt-20">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white font-bricolage mb-4">
                My Projects
              </h1>
              <p className="text-gray-300 text-lg font-bricolage">
                A collection of projects showcasing my skills and passion for development
              </p>
            </div>

            {/* Projects Grid - Left aligned with better spacing */}
            <div className="space-y-12">
              {projects.map((project, index) => (
                <div key={index} className="flex justify-start pl-4">
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    imageSrc={project.imageSrc}
                    imageAlt={project.imageAlt}
                    projectUrl={project.projectUrl}
                    liveUrl={project.liveUrl}
                    skills={project.skills}
                    delay={index * 200} // Staggered animation
                  />
                </div>
              ))}
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
