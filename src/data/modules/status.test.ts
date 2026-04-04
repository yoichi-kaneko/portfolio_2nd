import { describe, expect, it } from "vitest";
import { createStatusesFromJson, type Status } from "./status";

function createDummyStatus(index: number): Status {
  return {
    label: `label-${index}`,
    description: `description-${index}`,
  };
}

describe("status data module", () => {
  it("1件のデータは受け入れる", () => {
    const result = createStatusesFromJson({ statuses: [createDummyStatus(1)] });
    expect(result).toHaveLength(1);
  });

  it("0件のデータは例外を投げる", () => {
    expect(() => createStatusesFromJson({ statuses: [] })).toThrowError(
      "[data-validation] statuses must contain at least 1 items, but received 0."
    );
  });

  it("statusesが配列でない場合は例外を投げる", () => {
    expect(() => createStatusesFromJson({ statuses: null as unknown as Status[] })).toThrowError(
      "[data-validation] statuses must be an array."
    );
  });
});
