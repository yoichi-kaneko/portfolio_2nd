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

/**
 * mountains 配列の件数が許容範囲内か検証する。
 *
 * @param mountains 検証対象の山データ配列
 * @throws 件数が最小/最大の範囲外の場合
 */
export function validateMountainsCount(mountains: Mountain[]): void {
  assertArrayLengthInRange("mountains", mountains, MOUNTAINS_MIN_COUNT, MOUNTAINS_MAX_COUNT);
}

/**
 * JSON 由来データから `Mountain[]` を生成する。
 *
 * 期待する shape であることを検証し、件数バリデーションを通過した配列のみ返す。
 *
 * @param source `mountains` 配列を持つ入力データ
 * @returns 検証済みの `Mountain[]`
 * @throws `mountains` が配列でない、または件数が許容範囲外の場合
 */
export function createMountainsFromJson(source: MountainsJsonShape): Mountain[] {
  if (!source || !Array.isArray(source.mountains)) {
    throw new Error("[data-validation] mountains must be an array.");
  }

  validateMountainsCount(source.mountains);
  return source.mountains;
}

export const mountains = createMountainsFromJson(mountainsJson as MountainsJsonShape);
