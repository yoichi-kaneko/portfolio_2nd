import projectsJson from "../../../data/projects.json";
import { assertArrayMinLength } from "@/data/validators/assertArrayMinLength";

const PROJECTS_MIN_COUNT = 1;

export type ProjectType = "contract" | "employee" | "personal";

export interface Project {
  id: string;
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

/**
 * projects 配列の最小件数要件を検証する。
 *
 * @param projects 検証対象のプロジェクト配列
 * @throws 最小件数を満たさない場合
 */
export function validateProjectsCount(projects: Project[]): void {
  assertArrayMinLength("projects", projects, PROJECTS_MIN_COUNT);
}

/**
 * JSON 由来データから `Project[]` を生成する。
 *
 * 期待する shape であることを検証し、件数バリデーションを通過した配列のみ返す。
 *
 * @param source `projects` 配列を持つ入力データ
 * @returns 検証済みの `Project[]`
 * @throws `projects` が配列でない、または最小件数を満たさない場合
 */
export function createProjectsFromJson(source: ProjectsJsonShape): Project[] {
  if (!source || !Array.isArray(source.projects)) {
    throw new Error("[data-validation] projects must be an array.");
  }

  validateProjectsCount(source.projects);
  return source.projects;
}

export const projects = createProjectsFromJson(projectsJson as ProjectsJsonShape);
