import { describe, expect, it } from "vitest";
import { createSkillCategoriesFromJson, type SkillCategory } from "../skills";

function createDummySkillCategory(index: number): SkillCategory {
  return {
    name: `category-${index}`,
    skills: [{ name: `skill-${index}`, level: "Intermediate" }],
  };
}

describe("skills data module", () => {
  it("1件のデータは受け入れる", () => {
    const result = createSkillCategoriesFromJson({ categories: [createDummySkillCategory(1)] });
    expect(result).toHaveLength(1);
  });

  it("0件のデータは例外を投げる", () => {
    expect(() => createSkillCategoriesFromJson({ categories: [] })).toThrowError(
      "[data-validation] categories must contain at least 1 items, but received 0."
    );
  });

  it("categoriesが配列でない場合は例外を投げる", () => {
    expect(() =>
      createSkillCategoriesFromJson({ categories: null as unknown as SkillCategory[] })
    ).toThrowError("[data-validation] categories must be an array.");
  });
});
