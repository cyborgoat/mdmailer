import { Body, Container, Head, Heading, Html, Preview } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CalloutBanner } from "../components/CalloutBanner.js";
import { CtaButton } from "../components/Button.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import { fmString, fmStringOr } from "../../frontmatter.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY, type Brand, type SocialLink } from "../../config-schema.js";

export interface AnnouncementEmailProps {
  title: string;
  headline: string;
  bannerText: string;
  bodyMarkdown: string;
  ctaUrl?: string;
  ctaLabel: string;
  organization: Brand;
  primaryColor: string;
  accentColor: string;
  footerText: string;
  slogan: string;
  fontFamily: string;
  social: SocialLink[];
}

// A single high-impact message: a colored callout strip, one headline, a short
// Markdown body, and one call-to-action button.
export default function AnnouncementEmail({
  title,
  headline,
  bannerText,
  bodyMarkdown,
  ctaUrl,
  ctaLabel,
  organization,
  primaryColor,
  accentColor,
  footerText,
  slogan,
  fontFamily,
  social,
}: AnnouncementEmailProps) {
  return (
    <Html>
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
          <CtaButton href={ctaUrl} label={ctaLabel} color={accentColor} fontFamily={fontFamily} />
          <Footer
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            slogan={slogan}
            footerText={footerText}
            fontFamily={fontFamily}
            social={social}
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
    "All offices are **closed Monday, September 7** for the public holiday. Support coverage runs as normal via the on-call rota.\n\nRegular hours resume Tuesday.",
  ctaUrl: "https://example.com/holidays",
  ctaLabel: "See the holiday calendar",
  organization: { name: "People Ops", logoUrl: "https://placehold.co/80x40" },
  primaryColor: "#145A45",
  accentColor: "#0F4938",
  footerText: "© 2026 {{organization}}",
  slogan: "Flowing intelligence across the network",
  fontFamily: DEFAULT_FONT_FAMILY,
  social: [],
} satisfies AnnouncementEmailProps;

export function buildAnnouncementProps(ctx: TemplateContext): AnnouncementEmailProps {
  const fm = ctx.frontmatter;
  const theme = ctx.config.theme;

  return {
    title: ctx.title,
    headline: fmString(fm.headline) ?? ctx.title,
    bannerText: fmStringOr(fm.banner ?? fm.bannerText ?? fm.kicker, "Announcement"),
    bodyMarkdown: ctx.bodyMarkdown,
    ctaUrl: fmString(fm.ctaUrl ?? fm.url),
    ctaLabel: fmStringOr(fm.ctaLabel, "Learn more"),
    organization: ctx.organization,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor ?? theme.primaryColor,
    footerText: theme.footerText,
    slogan: theme.slogan,
    fontFamily: theme.fontFamily,
    social: theme.social,
  };
}
