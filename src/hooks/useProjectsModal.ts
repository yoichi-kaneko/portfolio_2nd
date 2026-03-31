import { useCallback, useEffect, useMemo, useState } from "react";
import { projects, type Project, type ProjectType } from "@/data/modules/projects";

export type ProjectsTab = "all" | ProjectType;

interface UseProjectsModalProps {
  onClose: () => void;
}

export function useProjectsModal({ onClose }: UseProjectsModalProps) {
  const [activeTab, setActiveTab] = useState<ProjectsTab>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
    setActiveTab("all");
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const filteredProjects = useMemo(
    () => (activeTab === "all" ? projects : projects.filter((p) => p.type === activeTab)),
    [activeTab]
  );

  const handleTabChange = useCallback((tab: ProjectsTab) => {
    setActiveTab(tab);
    setSelectedProject(null);
  }, []);

  return {
    activeTab,
    selectedProject,
    filteredProjects,
    setSelectedProject,
    handleClose,
    handleTabChange,
  };
}
