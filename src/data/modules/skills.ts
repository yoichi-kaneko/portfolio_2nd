import skillsJson from "../../../data/skills.json";
import { assertArrayMinLength } from "@/data/validators/assertArrayMinLength";

const SKILL_CATEGORIES_MIN_COUNT = 1;

export interface Skill {
  name: string;
  level: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

interface SkillsJsonShape {
  categories: SkillCategory[];
}

export function validateSkillCategoriesCount(categories: SkillCategory[]): void {
  assertArrayMinLength("categories", categories, SKILL_CATEGORIES_MIN_COUNT);
}

export function createSkillCategoriesFromJson(source: SkillsJsonShape): SkillCategory[] {
  if (!source || !Array.isArray(source.categories)) {
    throw new Error("[data-validation] categories must be an array.");
  }

  validateSkillCategoriesCount(source.categories);
  return source.categories;
}

export const skillCategories = createSkillCategoriesFromJson(skillsJson as SkillsJsonShape);
