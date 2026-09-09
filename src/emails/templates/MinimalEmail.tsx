import { Body, Container, Head, Heading, Html, Preview, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import type { TemplateContext } from "../template-context.js";
import type { SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";
import { DEFAULT_EMAIL_PREVIEW_THEME, headingColor, type EmailTheme } from "../theme.js";

export interface MinimalEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  footerText: string;
  organizationName: string;
  organizationLogoUrl: string;
  logoUrlOnDark?: string;
  logoAspectRatio?: number;
  tagline: string;
  theme: EmailTheme;
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
  logoUrlOnDark,
  logoAspectRatio,
  tagline,
  theme,
  social,
  address,
  unsubscribeUrl,
  locale,
}: MinimalEmailProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: theme.fontFamily }}>
        <Container style={{ backgroundColor: theme.background, padding: "24px", maxWidth: `${theme.contentWidth}px` }}>
          <Header
            organizationName={organizationName}
            organizationLogoUrl={organizationLogoUrl}
            logoAspectRatio={logoAspectRatio}
            theme={theme}
            useLogoPlate={theme.appearance === "contrast" && !logoUrlOnDark}
          />
          <Heading as="h1" style={{ fontFamily: theme.fontFamily, color: headingColor(theme) }}>
            {title}
          </Heading>
          {date ? (
            <Text style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.mutedForeground, marginTop: "-8px" }}>{date}</Text>
          ) : null}
          <Markdown options={{ overrides: buildMarkdownOverrides(theme) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organizationName}
            tagline={tagline}
            footerText={footerText}
            theme={theme}
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
  theme: DEFAULT_EMAIL_PREVIEW_THEME,
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
    logoUrlOnDark: ctx.organization.logoUrlOnDark,
    logoAspectRatio: ctx.organization.logoAspectRatio,
    tagline: ctx.config.theme.tagline,
    theme: ctx.theme,
    social: ctx.config.theme.social,
    address: ctx.config.theme.address,
    unsubscribeUrl: ctx.config.theme.unsubscribeUrl,
    locale: ctx.locale,
  };
}
