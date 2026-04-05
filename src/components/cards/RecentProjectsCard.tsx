"use client";

import { useState } from "react";
import { projects } from "@/data/modules/projects";
import { ProjectsModal } from "./ProjectsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderTree } from "@fortawesome/free-solid-svg-icons";

const recentProjects = projects.filter((p) => p.recent);

export function RecentProjectsCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">
          <FontAwesomeIcon icon={faFolderTree} className="w-4 h-4 mr-2" />
          Recent Projects
        </h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-sm text-blue-400 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recentProjects.map((project) => (
          <div
            key={project.name}
            className="p-3 bg-white/5 rounded-lg border border-white/5"
          >
            <p className="font-bold text-sm">{project.name}</p>
            <p className="text-xs text-gray-400 mt-1">{project.description}</p>
          </div>
        ))}
      </div>
      <ProjectsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
