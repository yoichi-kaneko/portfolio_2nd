import { describe, expect, it } from "vitest";
import { createSocialLinksFromJson, type SocialLink } from "../social";

function createDummySocialLink(index: number): SocialLink {
  return {
    label: `label-${index}`,
    url: `https://example.com/${index}`,
  };
}

describe("social data module", () => {
  it("1件のデータは受け入れる", () => {
    const result = createSocialLinksFromJson({ links: [createDummySocialLink(1)] });
    expect(result).toHaveLength(1);
  });

  it("0件のデータは例外を投げる", () => {
    expect(() => createSocialLinksFromJson({ links: [] })).toThrowError(
      "[data-validation] links must contain at least 1 items, but received 0."
    );
  });

  it("linksが配列でない場合は例外を投げる", () => {
    expect(() => createSocialLinksFromJson({ links: null as unknown as SocialLink[] })).toThrowError(
      "[data-validation] links must be an array."
    );
  });
});
