import ProjectsWorkspace from "./ProjectsWorkspace";
import ExperienceWorkspace from "./ExperienceWorkspace";
import EducationWorkspace from "./EducationWorkspace";
import SkillsWorkspace from "./SkillsWorkspace";

type WorkspaceName = "projects" | "experience" | "education" | "skills";

interface WorkspaceContentProps {
  workspace: WorkspaceName;
  onClose: () => void;
}

export default function WorkspaceContent({ workspace, onClose }: WorkspaceContentProps) {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Content */}
      <div className="h-full">
        {workspace === "projects" && <ProjectsWorkspace onClose={onClose} />}
        {workspace === "experience" && <ExperienceWorkspace />}
        {workspace === "education" && <EducationWorkspace />}
        {workspace === "skills" && <SkillsWorkspace />}
      </div>
    </div>
  );
}

