import mountainsJson from "../../../data/mountains.json";
import { assertArrayLengthInRange } from "@/data/validators/assertArrayLengthInRange";

const MOUNTAINS_MIN_COUNT = 1;
const MOUNTAINS_MAX_COUNT = 100;

export interface Mountain {
  name: string;
  date: string;
  url: string;
  latitude: number;
  longitude: number;
}

interface MountainsJsonShape {
  mountains: Mountain[];
}

export function validateMountainsCount(mountains: Mountain[]): void {
  assertArrayLengthInRange("mountains", mountains, MOUNTAINS_MIN_COUNT, MOUNTAINS_MAX_COUNT);
}

export function createMountainsFromJson(source: MountainsJsonShape): Mountain[] {
  if (!source || !Array.isArray(source.mountains)) {
    throw new Error("[data-validation] mountains must be an array.");
  }

  validateMountainsCount(source.mountains);
  return source.mountains;
}

export const mountains = createMountainsFromJson(mountainsJson as MountainsJsonShape);
