import socialJson from "../../../data/social.json";
import { assertArrayMinLength } from "@/data/validators/assertArrayMinLength";

const SOCIAL_LINKS_MIN_COUNT = 1;

export interface SocialLink {
  label: string;
  url: string;
}

interface SocialJsonShape {
  links: SocialLink[];
}

/**
 * ソーシャルリンク配列の最小件数要件を検証する。
 *
 * @param links 検証対象のソーシャルリンク配列
 * @throws 最小件数を満たさない場合
 */
export function validateSocialLinksCount(links: SocialLink[]): void {
  assertArrayMinLength("links", links, SOCIAL_LINKS_MIN_COUNT);
}

/**
 * JSON 由来データから `SocialLink[]` を生成する。
 *
 * 期待する shape であることを検証し、件数バリデーションを通過した配列のみ返す。
 *
 * @param source `links` 配列を持つ入力データ
 * @returns 検証済みの `SocialLink[]`
 * @throws `links` が配列でない、または最小件数を満たさない場合
 */
export function createSocialLinksFromJson(source: SocialJsonShape): SocialLink[] {
  if (!source || !Array.isArray(source.links)) {
    throw new Error("[data-validation] links must be an array.");
  }

  validateSocialLinksCount(source.links);
  return source.links;
}

export const socialLinks = createSocialLinksFromJson(socialJson as SocialJsonShape);
