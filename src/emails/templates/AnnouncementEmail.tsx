import { Body, Container, Head, Heading, Html, Preview } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CalloutBanner } from "../components/CalloutBanner.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import { fmString } from "../../frontmatter.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY, type Brand, type SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";

export interface AnnouncementEmailProps {
  title: string;
  headline: string;
  bannerText: string;
  bodyMarkdown: string;
  organization: Brand;
  primaryColor: string;
  footerText: string;
  tagline: string;
  fontFamily: string;
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
  primaryColor,
  footerText,
  tagline,
  fontFamily,
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
      <Body style={{ backgroundColor: "#f4f4f4", fontFamily }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", maxWidth: "680px" }}>
          <Header organizationName={organization.name} organizationLogoUrl={organization.logoUrl} />
          <CalloutBanner text={bannerText} color={primaryColor} fontFamily={fontFamily} />
          <Heading as="h1" style={{ fontFamily, color: primaryColor, marginTop: "24px" }}>
            {headline}
          </Heading>
          <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organization.name}
            tagline={tagline}
            footerText={footerText}
            fontFamily={fontFamily}
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
  primaryColor: "#1A4B8C",
  footerText: "© 2026 {{organization}}",
  tagline: "Flowing intelligence across the network.",
  fontFamily: DEFAULT_FONT_FAMILY,
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
    primaryColor: theme.primaryColor,
    footerText: theme.footerText,
    tagline: theme.tagline,
    fontFamily: theme.fontFamily,
    social: theme.social,
    address: theme.address,
    unsubscribeUrl: theme.unsubscribeUrl,
    locale,
    unsubscribeLabel: t(locale, "footer.unsubscribe"),
  };
}
