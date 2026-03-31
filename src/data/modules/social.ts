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

export function validateSocialLinksCount(links: SocialLink[]): void {
  assertArrayMinLength("links", links, SOCIAL_LINKS_MIN_COUNT);
}

export function createSocialLinksFromJson(source: SocialJsonShape): SocialLink[] {
  if (!source || !Array.isArray(source.links)) {
    throw new Error("[data-validation] links must be an array.");
  }

  validateSocialLinksCount(source.links);
  return source.links;
}

export const socialLinks = createSocialLinksFromJson(socialJson as SocialJsonShape);
