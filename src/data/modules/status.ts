import statusJson from "../../../data/status.json";
import { assertArrayMinLength } from "@/data/validators/assertArrayMinLength";

const STATUS_MIN_COUNT = 1;

export interface Status {
  label: string;
  description: string;
}

interface StatusJsonShape {
  statuses: Status[];
}

export function validateStatusesCount(statuses: Status[]): void {
  assertArrayMinLength("statuses", statuses, STATUS_MIN_COUNT);
}

export function createStatusesFromJson(source: StatusJsonShape): Status[] {
  if (!source || !Array.isArray(source.statuses)) {
    throw new Error("[data-validation] statuses must be an array.");
  }

  validateStatusesCount(source.statuses);
  return source.statuses;
}

export const statuses = createStatusesFromJson(statusJson as StatusJsonShape);
