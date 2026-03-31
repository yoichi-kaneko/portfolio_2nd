import { describe, expect, it } from "vitest";
import { createMountainsFromJson, type Mountain } from "../mountains";

function createDummyMountain(index: number): Mountain {
  return {
    name: `山${index}`,
    date: "2026-01-01",
    url: `https://example.com/${index}`,
    latitude: 35 + index / 1000,
    longitude: 138 + index / 1000,
  };
}

describe("mountains data module", () => {
  it("1件のデータは受け入れる", () => {
    const result = createMountainsFromJson({ mountains: [createDummyMountain(1)] });
    expect(result).toHaveLength(1);
  });

  it("100件のデータは受け入れる", () => {
    const mountains = Array.from({ length: 100 }, (_, idx) => createDummyMountain(idx + 1));
    const result = createMountainsFromJson({ mountains });
    expect(result).toHaveLength(100);
  });

  it("0件のデータは例外を投げる", () => {
    expect(() => createMountainsFromJson({ mountains: [] })).toThrowError(
      "[data-validation] mountains must contain between 1 and 100 items, but received 0."
    );
  });

  it("101件のデータは例外を投げる", () => {
    const mountains = Array.from({ length: 101 }, (_, idx) => createDummyMountain(idx + 1));
    expect(() => createMountainsFromJson({ mountains })).toThrowError(
      "[data-validation] mountains must contain between 1 and 100 items, but received 101."
    );
  });
});
