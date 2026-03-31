import projectsJson from "../../../data/projects.json";
import { assertArrayMinLength } from "@/data/validators/assertArrayMinLength";

const PROJECTS_MIN_COUNT = 1;

export type ProjectType = "contract" | "employee" | "personal";

export interface Project {
  name: string;
  period: string;
  type: ProjectType;
  recent: boolean;
  description: string;
  detail: string;
  tags: string[];
}

interface ProjectsJsonShape {
  projects: Project[];
}

export function validateProjectsCount(projects: Project[]): void {
  assertArrayMinLength("projects", projects, PROJECTS_MIN_COUNT);
}

export function createProjectsFromJson(source: ProjectsJsonShape): Project[] {
  if (!source || !Array.isArray(source.projects)) {
    throw new Error("[data-validation] projects must be an array.");
  }

  validateProjectsCount(source.projects);
  return source.projects;
}

export const projects = createProjectsFromJson(projectsJson as ProjectsJsonShape);
