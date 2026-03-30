"use client";

import { useState, useEffect } from "react";
import projectsData from "../../../data/projects.json";

type ProjectType = "contract" | "employee" | "personal";
type Tab = "all" | ProjectType;

interface Project {
  name: string;
  period: string;
  type: ProjectType;
  recent: boolean;
  description: string;
  detail: string;
  tags: string[];
}

const TAB_LABELS: Record<Tab, string> = {
  all: "All",
  contract: "業務委託 / 受託",
  employee: "正社員",
  personal: "個人開発",
};

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectsModal({ isOpen, onClose }: ProjectsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setActiveTab("all");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const projects = projectsData.projects as Project[];
  const filtered =
    activeTab === "all"
      ? projects
      : projects.filter((p) => p.type === activeTab);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedProject(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#161616] border border-[#262626] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
          <h2 className="text-xl font-bold">All Projects</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-[#262626] shrink-0 overflow-x-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Card Grid */}
          <div
            className={`overflow-y-auto p-6 transition-all duration-300 ease-in-out ${
              selectedProject ? "w-1/2" : "w-full"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((project) => (
                <div
                  key={project.name}
                  data-testid="project-card"
                  onClick={() =>
                    setSelectedProject(
                      selectedProject?.name === project.name ? null : project
                    )
                  }
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedProject?.name === project.name
                      ? "bg-blue-500/10 border-blue-500/40"
                      : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-sm leading-snug">
                      {project.name}
                    </p>
                    <span className="text-xs text-gray-500 shrink-0">
                      {project.period}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-white/5 rounded text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs px-1.5 py-0.5 text-gray-500">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div
            className={`border-l border-[#262626] overflow-y-auto transition-all duration-300 ease-in-out shrink-0 ${
              selectedProject ? "w-1/2 opacity-100" : "w-0 opacity-0"
            }`}
          >
            {selectedProject && (
              <div className="p-6 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-base leading-snug">
                      {selectedProject.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedProject.period}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 text-xs"
                    aria-label="Close detail"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-5">
                  {selectedProject.detail}
                </p>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-blue-500/10 rounded text-blue-400 border border-blue-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
