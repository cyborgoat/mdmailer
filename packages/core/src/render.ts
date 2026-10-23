import * as React from "react";
import { render } from "@react-email/render";
import { frontmatterThemeSchema, type ThemePresetName, type Config } from "./config-schema.js";
import { templates, TEMPLATE_NAMES, resolveTemplateName, type TemplateEntry } from "./emails/registry.js";
import type { TemplateContext } from "./emails/template-context.js";
import { formatDate, parseFrontmatter } from "./frontmatter.js";
import { resolveLocale, t } from "./i18n/index.js";
import {
  resolveBrandLogo, resolveContentImages, resolveHosts,
  type EmbeddedImage, type ImageIO, type LogoAttachment, type ResolvedOrganization,
} from "./images.js";
import { normalizeThemeSelection, resolveEmailTheme, selectLogoUrl } from "./emails/theme.js";

export interface RenderOptions {
  /** Already parsed (see `parseConfig`) with logo paths resolved however `images` expects them. */
  config: Config;
  images: ImageIO;
  /** Overrides the theme preset chosen by frontmatter / config. */
  theme?: ThemePresetName;
  /** Also render the plain-text alternative for the EML. Default false. */
  plainText?: boolean;
}

export interface RenderedEmail {
  /** Pure React render, BEFORE DOM post-processing (QR codes, image dimensions). */
  html: string;
  /** Plain-text alternative; empty unless `plainText` was requested. */
  text: string;
  title: string;
  /** Layout width of the email in CSS pixels; a good viewport width for post-processing. */
  contentWidth: number;
  organization: ResolvedOrganization;
  /** Local images that must travel as CID parts in the EML. */
  logoAttachment?: LogoAttachment;
  contentImages: EmbeddedImage[];
  hostImages: EmbeddedImage[];
}

export async function renderEmail(rawMarkdown: string, opts: RenderOptions): Promise<RenderedEmail> {
  const { config, images: io, theme: themeFlag, plainText = false } = opts;
  const { data: frontmatter, content: rawBodyMarkdown } = parseFrontmatter(rawMarkdown);
  const rawTemplateName = frontmatter.type;
  if (typeof rawTemplateName !== "string" || !rawTemplateName.trim()) {
    throw new Error(`Missing required frontmatter field "type". Valid types: ${TEMPLATE_NAMES.join(", ")}`);
  }
  const templateName = resolveTemplateName(rawTemplateName);
  if (!templateName) {
    throw new Error(`Unknown frontmatter type "${String(rawTemplateName)}". Valid types: ${TEMPLATE_NAMES.join(", ")}`);
  }

  const rawLocale = frontmatter.lang ?? frontmatter.locale ?? frontmatter.language;
  if (typeof rawLocale !== "string" || !rawLocale.trim()) {
    throw new Error('Missing required frontmatter field "lang". Available languages: English (en) and Chinese (zh).');
  }
  const locale = resolveLocale(rawLocale);
  if (!locale) {
    throw new Error(`Unsupported frontmatter language "${String(rawLocale)}". Available languages: English (en) and Chinese (zh).`);
  }

  // Frontmatter omitting `theme:` entirely falls back to the config's default
  // preset; zod's own `.default("classic")` can't tell "omitted" from an
  // explicit `theme: classic`, so that distinction has to be made here.
  const themeSource = frontmatter.theme === undefined ? config.theme.preset : frontmatter.theme;
  const frontmatterTheme = normalizeThemeSelection(frontmatterThemeSchema.parse(themeSource));
  const themeSelection = themeFlag
    ? normalizeThemeSelection(frontmatterThemeSchema.parse({ ...frontmatterTheme, preset: themeFlag }))
    : frontmatterTheme;
  const { markdown: bodyMarkdown, attachments: contentImages } = await resolveContentImages(rawBodyMarkdown, io);
  const { profiles: hostProfiles, attachments: hostImages } = await resolveHosts(
    frontmatter.hosts ?? frontmatter.speakers,
    io,
  );

  const title = typeof frontmatter.title === "string" && frontmatter.title.trim()
    ? frontmatter.title
    : t(locale, "fallback.untitled");
  const date = formatDate(frontmatter.date);
  const theme = resolveEmailTheme(config.theme, themeSelection);
  const selectedLogoUrl = selectLogoUrl(config.organization, theme.appearance);
  const { brand: organization, logoAttachment } = await resolveBrandLogo({
    ...config.organization,
    logoUrl: selectedLogoUrl,
  }, io);

  const ctx: TemplateContext = {
    frontmatter,
    bodyMarkdown,
    config,
    theme,
    organization,
    title,
    date,
    locale,
    hostProfiles,
  };
  const { component, buildProps }: TemplateEntry = templates[templateName];
  const element = React.createElement(component, buildProps(ctx));

  const html = await render(element);
  const text = plainText ? await render(element, { plainText: true }) : "";

  return { html, text, title, contentWidth: theme.contentWidth, organization, logoAttachment, contentImages, hostImages };
}
