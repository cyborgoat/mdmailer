import type { Brand, Config } from "../config-schema.js";

/**
 * Everything a template's prop-builder needs, assembled once by `generate.ts`
 * before dispatch. Images are already resolved (data URIs inlined in the body,
 * logo swapped to a data URI or left as a remote URL); `title` and `date` are
 * already defaulted/formatted.
 */
export interface TemplateContext {
  /** Raw parsed YAML frontmatter — dates are `Date`, lists are arrays. */
  frontmatter: Record<string, unknown>;
  bodyMarkdown: string;
  config: Config;
  organization: Brand;
  title: string;
  date: string;
}
