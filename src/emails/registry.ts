import type { ComponentType } from "react";
import type { TemplateContext } from "./template-context.js";
import OrganizationEmail, { buildRegularProps } from "./templates/OrganizationEmail.js";
import EventEmail, { buildEventProps } from "./templates/EventEmail.js";
import AnnouncementEmail, { buildAnnouncementProps } from "./templates/AnnouncementEmail.js";
import MinimalEmail, { buildMinimalProps } from "./templates/MinimalEmail.js";

export interface TemplateEntry {
  component: ComponentType<any>;
  // `object` (not Record<string, unknown>): the typed prop interfaces are
  // assignable to `object`, and `React.createElement(component, props)` accepts it.
  buildProps: (ctx: TemplateContext) => object;
}

export const templates = {
  regular: { component: OrganizationEmail, buildProps: buildRegularProps },
  event: { component: EventEmail, buildProps: (ctx) => buildEventProps(ctx) },
  workshop: { component: EventEmail, buildProps: (ctx) => buildEventProps(ctx, { defaultKicker: "Workshop" }) },
  announcement: { component: AnnouncementEmail, buildProps: buildAnnouncementProps },
  minimal: { component: MinimalEmail, buildProps: buildMinimalProps },
} satisfies Record<string, TemplateEntry>;

export type TemplateName = keyof typeof templates;
export const TEMPLATE_NAMES = Object.keys(templates) as TemplateName[];

/**
 * Resolves the template to render. Precedence: `--template` flag, then the
 * frontmatter `type:` field, then `regular`. Returns `null` for an unknown
 * name so the caller can report it.
 */
export function resolveTemplateName(flag: string | undefined, frontmatterType: unknown): TemplateName | null {
  const raw = (flag ?? (typeof frontmatterType === "string" ? frontmatterType : "")).toString().toLowerCase().trim();
  if (!raw) return "regular";
  return raw in templates ? (raw as TemplateName) : null;
}
