import { Body, Container, Head, Heading, Html, Preview, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import type { TemplateContext } from "../template-context.js";
import type { ResolvedOrganization } from "../../resolve-logo.js";
import type { SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";
import { DEFAULT_EMAIL_PREVIEW_THEME, headingColor, type EmailTheme } from "../theme.js";

export interface OrganizationEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  organization: ResolvedOrganization;
  theme: EmailTheme;
  footerText: string;
  tagline: string;
  social: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  locale: Locale;
}

export default function OrganizationEmail({
  title,
  date,
  bodyMarkdown,
  organization,
  theme,
  footerText,
  tagline,
  social,
  address,
  unsubscribeUrl,
  locale,
}: OrganizationEmailProps) {
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
          <Heading as="h1" style={{ fontFamily: theme.fontFamily, color: headingColor(theme), marginTop: "24px" }}>
            {title}
          </Heading>
          <Text style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.mutedForeground, marginTop: "-8px" }}>{date}</Text>
          <Markdown options={{ overrides: buildMarkdownOverrides(theme) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organization.name}
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

// Sample props so `npm run email:dev` has something to preview.
OrganizationEmail.PreviewProps = {
  title: "August Engineering Update",
  date: "2026-08-26",
  bodyMarkdown: "# What shipped this month\n\nSample content for preview.",
  organization: { name: "Engineering", logoUrl: "https://placehold.co/80x40" },
  theme: DEFAULT_EMAIL_PREVIEW_THEME,
  footerText: "© 2026 {{organization}}",
  tagline: "Flowing intelligence across the network.",
  social: [],
  locale: "en",
} satisfies OrganizationEmailProps;

// The default `regular` template: title, dateline, Markdown body, branded
// header/footer — the original mdmailer layout, unchanged.
export function buildRegularProps(ctx: TemplateContext): OrganizationEmailProps {
  return {
    title: ctx.title,
    date: ctx.date,
    bodyMarkdown: ctx.bodyMarkdown,
    organization: ctx.organization,
    theme: ctx.theme,
    footerText: ctx.config.theme.footerText,
    tagline: ctx.config.theme.tagline,
    social: ctx.config.theme.social,
    address: ctx.config.theme.address,
    unsubscribeUrl: ctx.config.theme.unsubscribeUrl,
    locale: ctx.locale,
  };
}
