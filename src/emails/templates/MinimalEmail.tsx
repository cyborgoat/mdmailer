import { Body, Container, Head, Heading, Html, Preview, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY, type SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";

export interface MinimalEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  footerText: string;
  organizationName: string;
  organizationLogoUrl: string;
  tagline: string;
  primaryColor: string;
  fontFamily: string;
  social: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  locale: Locale;
}

// A text-forward layout with the shared brand header/footer, a title, a
// dateline, and the Markdown body. For short, personal-feeling notes.
export default function MinimalEmail({
  title,
  date,
  bodyMarkdown,
  footerText,
  organizationName,
  organizationLogoUrl,
  tagline,
  primaryColor,
  fontFamily,
  social,
  address,
  unsubscribeUrl,
  locale,
}: MinimalEmailProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily }}>
        <Container style={{ padding: "24px", maxWidth: "680px" }}>
          <Header organizationName={organizationName} organizationLogoUrl={organizationLogoUrl} />
          <Heading as="h1" style={{ fontFamily, color: primaryColor }}>
            {title}
          </Heading>
          {date ? (
            <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", marginTop: "-8px" }}>{date}</Text>
          ) : null}
          <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organizationName}
            organizationLogoUrl={organizationLogoUrl}
            tagline={tagline}
            footerText={footerText}
            fontFamily={fontFamily}
            social={social}
            address={address}
            unsubscribeUrl={unsubscribeUrl}
            unsubscribeLabel={t(locale, "footer.unsubscribe")}
          />
        </Container>
      </Body>
    </Html>
  );
}

MinimalEmail.PreviewProps = {
  title: "Quick note on Friday's deploy",
  date: "2026-09-04",
  bodyMarkdown:
    "We're pushing the search reindex tonight at 22:00 UTC. Expect ~10 minutes of stale results; nothing else is affected.\n\nPing me if you see anything odd afterwards.",
  footerText: "© 2026 {{organization}}",
  organizationName: "Platform",
  organizationLogoUrl: "https://placehold.co/144x120",
  tagline: "Flowing intelligence across the network.",
  primaryColor: "#1A4B8C",
  fontFamily: DEFAULT_FONT_FAMILY,
  social: [],
  locale: "en",
} satisfies MinimalEmailProps;

export function buildMinimalProps(ctx: TemplateContext): MinimalEmailProps {
  return {
    title: ctx.title,
    date: ctx.date,
    bodyMarkdown: ctx.bodyMarkdown,
    footerText: ctx.config.theme.footerText,
    organizationName: ctx.organization.name,
    organizationLogoUrl: ctx.organization.logoUrl,
    tagline: ctx.config.theme.tagline,
    primaryColor: ctx.config.theme.primaryColor,
    fontFamily: ctx.config.theme.fontFamily,
    social: ctx.config.theme.social,
    address: ctx.config.theme.address,
    unsubscribeUrl: ctx.config.theme.unsubscribeUrl,
    locale: ctx.locale,
  };
}
