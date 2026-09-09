import { Heading, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { fmString } from "../../frontmatter.js";
import { t } from "../../i18n/index.js";
import type { TemplateContext } from "../template-context.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import { DEFAULT_EMAIL_PREVIEW_THEME, headingColor } from "../theme.js";
import { CalloutBanner } from "../components/CalloutBanner.js";
import { EmailShell, type EmailChromeProps } from "../components/EmailShell.js";

export type ContentVariant = "news" | "release-notes" | "digest" | "announcement";

interface ContentEmailBaseProps extends EmailChromeProps {
  title: string;
  bodyMarkdown: string;
}

interface DatedContentEmailProps extends ContentEmailBaseProps {
  variant: "news" | "release-notes" | "digest";
  categoryLabel: string;
  date: string;
}

interface AnnouncementContentEmailProps extends ContentEmailBaseProps {
  variant: "announcement";
  headline: string;
  bannerText: string;
}

export type ContentEmailProps = DatedContentEmailProps | AnnouncementContentEmailProps;

export default function ContentEmail(props: ContentEmailProps) {
  const { variant, title, bodyMarkdown, theme } = props;

  return (
    <EmailShell {...props} previewText={title}>
      {variant === "announcement" ? <CalloutBanner text={props.bannerText} theme={theme} /> : null}
      {variant !== "announcement" ? (
        <Text
          style={{
            color: theme.accent,
            fontFamily: theme.fontFamily,
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
            margin: "28px 0 4px",
            textTransform: "uppercase",
          }}
        >
          {props.categoryLabel}
        </Text>
      ) : null}
      <Heading
        as="h1"
        style={{
          color: headingColor(theme),
          fontFamily: theme.fontFamily,
          fontSize: "30px",
          lineHeight: "38px",
          margin: variant === "announcement" ? "24px 0 0" : "0",
        }}
      >
        {variant === "announcement" ? props.headline : title}
      </Heading>
      {variant !== "announcement" && props.date ? (
        <Text
          style={{
            color: theme.mutedForeground,
            fontFamily: theme.fontFamily,
            fontSize: "12px",
            lineHeight: "18px",
            margin: "8px 0 0",
          }}
        >
          {props.date}
        </Text>
      ) : null}
      <Markdown options={{ overrides: buildMarkdownOverrides(theme) }}>{bodyMarkdown}</Markdown>
    </EmailShell>
  );
}

ContentEmail.PreviewProps = {
  variant: "news",
  categoryLabel: "News",
  title: "August Engineering Update",
  date: "2026-08-26",
  bodyMarkdown: "# What shipped this month\n\nSample content for preview.",
  organization: { name: "Engineering", logoUrl: "https://placehold.co/80x40" },
  theme: DEFAULT_EMAIL_PREVIEW_THEME,
  footerText: "© 2026 {{organization}}",
  tagline: "Flowing intelligence across the network.",
  social: [],
  locale: "en",
  unsubscribeLabel: "Unsubscribe",
} satisfies ContentEmailProps;

export function buildContentProps(ctx: TemplateContext, variant: ContentVariant): ContentEmailProps {
  const common: ContentEmailBaseProps = {
    title: ctx.title,
    bodyMarkdown: ctx.bodyMarkdown,
    organization: ctx.organization,
    theme: ctx.theme,
    footerText: ctx.config.theme.footerText,
    tagline: ctx.config.theme.tagline,
    social: ctx.config.theme.social,
    address: ctx.config.theme.address,
    unsubscribeUrl: ctx.config.theme.unsubscribeUrl,
    locale: ctx.locale,
    unsubscribeLabel: t(ctx.locale, "footer.unsubscribe"),
  };

  if (variant === "announcement") {
    return {
      ...common,
      variant,
      headline: fmString(ctx.frontmatter.headline) ?? ctx.title,
      bannerText: fmString(
        ctx.frontmatter.banner ?? ctx.frontmatter.bannerText ?? ctx.frontmatter.kicker,
      ) ?? t(ctx.locale, "banner.announcement"),
    };
  }

  const categoryLabel = {
    news: t(ctx.locale, "kicker.news"),
    "release-notes": t(ctx.locale, "kicker.releaseNotes"),
    digest: t(ctx.locale, "kicker.digest"),
  }[variant];

  return { ...common, variant, categoryLabel, date: ctx.date };
}
