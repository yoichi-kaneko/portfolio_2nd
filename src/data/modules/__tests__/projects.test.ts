import { describe, expect, it } from "vitest";
import { createProjectsFromJson, type Project } from "../projects";

function createDummyProject(index: number): Project {
  return {
    name: `project-${index}`,
    period: "2026",
    type: "personal",
    recent: true,
    description: `description-${index}`,
    detail: `detail-${index}`,
    tags: ["TypeScript"],
  };
}

describe("projects data module", () => {
  it("1件のデータは受け入れる", () => {
    const result = createProjectsFromJson({ projects: [createDummyProject(1)] });
    expect(result).toHaveLength(1);
  });

  it("0件のデータは例外を投げる", () => {
    expect(() => createProjectsFromJson({ projects: [] })).toThrowError(
      "[data-validation] projects must contain at least 1 items, but received 0."
    );
  });

  it("projectsが配列でない場合は例外を投げる", () => {
    expect(() => createProjectsFromJson({ projects: null as unknown as Project[] })).toThrowError(
      "[data-validation] projects must be an array."
    );
  });
});
