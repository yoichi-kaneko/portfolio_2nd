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

/**
 * スキルカテゴリ配列の最小件数要件を検証する。
 *
 * @param categories 検証対象のスキルカテゴリ配列
 * @throws 最小件数を満たさない場合
 */
export function validateSkillCategoriesCount(categories: SkillCategory[]): void {
  assertArrayMinLength("categories", categories, SKILL_CATEGORIES_MIN_COUNT);
}

/**
 * JSON 由来データから `SkillCategory[]` を生成する。
 *
 * 期待する shape であることを検証し、件数バリデーションを通過した配列のみ返す。
 *
 * @param source `categories` 配列を持つ入力データ
 * @returns 検証済みの `SkillCategory[]`
 * @throws `categories` が配列でない、または最小件数を満たさない場合
 */
export function createSkillCategoriesFromJson(source: SkillsJsonShape): SkillCategory[] {
  if (!source || !Array.isArray(source.categories)) {
    throw new Error("[data-validation] categories must be an array.");
  }

  validateSkillCategoriesCount(source.categories);
  return source.categories;
}

export const skillCategories = createSkillCategoriesFromJson(skillsJson as SkillsJsonShape);
