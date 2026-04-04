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

/**
 * ステータス配列の最小件数要件を検証する。
 *
 * @param statuses 検証対象のステータス配列
 * @throws 最小件数を満たさない場合
 */
export function validateStatusesCount(statuses: Status[]): void {
  assertArrayMinLength("statuses", statuses, STATUS_MIN_COUNT);
}

/**
 * JSON 由来データから `Status[]` を生成する。
 *
 * 期待する shape であることを検証し、件数バリデーションを通過した配列のみ返す。
 *
 * @param source `statuses` 配列を持つ入力データ
 * @returns 検証済みの `Status[]`
 * @throws `statuses` が配列でない、または最小件数を満たさない場合
 */
export function createStatusesFromJson(source: StatusJsonShape): Status[] {
  if (!source || !Array.isArray(source.statuses)) {
    throw new Error("[data-validation] statuses must be an array.");
  }

  validateStatusesCount(source.statuses);
  return source.statuses;
}

export const statuses = createStatusesFromJson(statusJson as StatusJsonShape);
