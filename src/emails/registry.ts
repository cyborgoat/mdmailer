import type { ComponentType } from "react";
import type { TemplateContext } from "./template-context.js";
import ContentEmail, { buildContentProps } from "./templates/ContentEmail.js";
import EventEmail, { buildEventProps } from "./templates/EventEmail.js";
import { t } from "../i18n/index.js";

export interface TemplateEntry {
  component: ComponentType<any>;
  // `object` (not Record<string, unknown>): the typed prop interfaces are
  // assignable to `object`, and `React.createElement(component, props)` accepts it.
  buildProps: (ctx: TemplateContext) => object;
}

export const templates = {
  regular: { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "regular") },
  event: { component: EventEmail, buildProps: (ctx) => buildEventProps(ctx) },
  workshop: {
    component: EventEmail,
    buildProps: (ctx) =>
      buildEventProps(ctx, { defaultKicker: t(ctx.locale, "kicker.workshop"), showHostsSection: true }),
  },
  webinar: {
    component: EventEmail,
    buildProps: (ctx) => buildEventProps(ctx, { defaultKicker: t(ctx.locale, "kicker.webinar") }),
  },
  announcement: { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "announcement") },
  minimal: { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "minimal") },
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
