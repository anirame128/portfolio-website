import { useState, useEffect } from "react";
import RightSlopeField from "../RightSlopeField";
import ProjectCard from "../ProjectCard";

interface ProjectsWorkspaceProps {
  onClose: () => void;
}

export default function ProjectsWorkspace({ onClose }: ProjectsWorkspaceProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Start animation after workspace transition begins (0.1s delay to match transition timing)
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Sample project data - replace with your actual projects
  const projects = [
    {
      title: "AI-Powered Portfolio",
      description: "A modern portfolio website with interactive particle animations and dynamic content management. Built with Next.js, TypeScript, and Three.js for immersive user experiences.",
      imageSrc: "/project1.jpg", // You'll need to add actual project images
      imageAlt: "AI-Powered Portfolio Screenshot",
      projectUrl: "https://github.com/anirame128/portfolio-website",
      skills: ["Next.js", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-black">
      {/* Right slope field covering the full right side */}
      <RightSlopeField shouldAnimate={shouldAnimate} />
      
      {/* Projects Content */}
      <div className="relative z-10 p-8 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white font-bricolage mb-4">
              My Projects
            </h1>
            <p className="text-gray-300 text-lg font-bricolage">
              A collection of projects showcasing my skills and passion for development
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                imageSrc={project.imageSrc}
                imageAlt={project.imageAlt}
                projectUrl={project.projectUrl}
                skills={project.skills}
                delay={index * 200} // Staggered animation
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Down arrow at the bottom to go back */}
      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-gray-300 transition-colors z-20"
        aria-label="Go back to main page"
      >
        <svg 
          className="w-8 h-8 animate-bounce" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </button>
    </div>
  );
}

