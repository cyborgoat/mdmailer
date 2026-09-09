import { Body, Container, Head, Heading, Html, Preview } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CalloutBanner } from "../components/CalloutBanner.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import { fmString } from "../../frontmatter.js";
import type { TemplateContext } from "../template-context.js";
import type { ResolvedOrganization } from "../../resolve-logo.js";
import type { SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";
import { DEFAULT_EMAIL_PREVIEW_THEME, headingColor, type EmailTheme } from "../theme.js";

export interface AnnouncementEmailProps {
  title: string;
  headline: string;
  bannerText: string;
  bodyMarkdown: string;
  organization: ResolvedOrganization;
  theme: EmailTheme;
  footerText: string;
  tagline: string;
  social: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  locale: Locale;
  unsubscribeLabel: string;
}

// A single high-impact message: a colored callout strip, one headline, and a
// short Markdown body. Authors add links directly in Markdown when needed.
export default function AnnouncementEmail({
  title,
  headline,
  bannerText,
  bodyMarkdown,
  organization,
  theme,
  footerText,
  tagline,
  social,
  address,
  unsubscribeUrl,
  locale,
  unsubscribeLabel,
}: AnnouncementEmailProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: theme.fontFamily }}>
        <Container style={{ backgroundColor: theme.background, padding: "24px", maxWidth: `${theme.contentWidth}px` }}>
          <Header
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            logoAspectRatio={organization.logoAspectRatio}
            theme={theme}
            useLogoPlate={theme.appearance === "contrast" && !organization.logoUrlOnDark}
          />
          <CalloutBanner text={bannerText} theme={theme} />
          <Heading as="h1" style={{ fontFamily: theme.fontFamily, color: headingColor(theme), marginTop: "24px" }}>
            {headline}
          </Heading>
          <Markdown options={{ overrides: buildMarkdownOverrides(theme) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organization.name}
            tagline={tagline}
            footerText={footerText}
            theme={theme}
            social={social}
            address={address}
            unsubscribeUrl={unsubscribeUrl}
            unsubscribeLabel={unsubscribeLabel}
          />
        </Container>
      </Body>
    </Html>
  );
}

AnnouncementEmail.PreviewProps = {
  title: "Office closed Monday for the long weekend",
  headline: "Office closed Monday, Sept 7",
  bannerText: "Announcement",
  bodyMarkdown:
    "All offices are **closed Monday, September 7** for the public holiday. Support coverage runs as normal via the on-call rota.\n\nRegular hours resume Tuesday.\n\n[See the holiday calendar](https://example.com/holidays)",
  organization: { name: "People Ops", logoUrl: "https://placehold.co/80x40" },
  theme: DEFAULT_EMAIL_PREVIEW_THEME,
  footerText: "© 2026 {{organization}}",
  tagline: "Flowing intelligence across the network.",
  social: [],
  locale: "en",
  unsubscribeLabel: "Unsubscribe",
} satisfies AnnouncementEmailProps;

export function buildAnnouncementProps(ctx: TemplateContext): AnnouncementEmailProps {
  const fm = ctx.frontmatter;
  const theme = ctx.config.theme;
  const { locale } = ctx;

  return {
    title: ctx.title,
    headline: fmString(fm.headline) ?? ctx.title,
    bannerText: fmString(fm.banner ?? fm.bannerText ?? fm.kicker) ?? t(locale, "banner.announcement"),
    bodyMarkdown: ctx.bodyMarkdown,
    organization: ctx.organization,
    theme: ctx.theme,
    footerText: theme.footerText,
    tagline: theme.tagline,
    social: theme.social,
    address: theme.address,
    unsubscribeUrl: theme.unsubscribeUrl,
    locale,
    unsubscribeLabel: t(locale, "footer.unsubscribe"),
  };
}
