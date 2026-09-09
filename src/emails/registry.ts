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
  news: { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "news") },
  "release-notes": { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "release-notes") },
  digest: { component: ContentEmail, buildProps: (ctx) => buildContentProps(ctx, "digest") },
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
} satisfies Record<string, TemplateEntry>;

export type TemplateName = keyof typeof templates;
export const TEMPLATE_NAMES = Object.keys(templates) as TemplateName[];

/** Resolves the required frontmatter `type:` value. */
export function resolveTemplateName(frontmatterType: unknown): TemplateName | null {
  const raw = typeof frontmatterType === "string" ? frontmatterType.toLowerCase().trim() : "";
  if (!raw) return null;
  return raw in templates ? (raw as TemplateName) : null;
}
