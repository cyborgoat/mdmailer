import { Body, Container, Head, Heading, Html, Preview, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY, type Brand } from "../../config-schema.js";

export interface OrganizationEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  organization: Brand;
  primaryColor: string;
  footerText: string;
  slogan: string;
  fontFamily: string;
}

export default function OrganizationEmail({
  title,
  date,
  bodyMarkdown,
  organization,
  primaryColor,
  footerText,
  slogan,
  fontFamily,
}: OrganizationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#f4f4f4", fontFamily }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", maxWidth: "680px" }}>
          <Header organizationName={organization.name} organizationLogoUrl={organization.logoUrl} />
          <Heading as="h1" style={{ fontFamily, color: primaryColor, marginTop: "24px" }}>
            {title}
          </Heading>
          <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", marginTop: "-8px" }}>{date}</Text>
          <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            slogan={slogan}
            footerText={footerText}
            fontFamily={fontFamily}
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
  primaryColor: "#145A45",
  footerText: "© 2026 {{organization}}",
  slogan: "Flowing intelligence across the network",
  fontFamily: DEFAULT_FONT_FAMILY,
} satisfies OrganizationEmailProps;

// The default `regular` template: title, dateline, Markdown body, branded
// header/footer — the original mdmailer layout, unchanged.
export function buildRegularProps(ctx: TemplateContext): OrganizationEmailProps {
  return {
    title: ctx.title,
    date: ctx.date,
    bodyMarkdown: ctx.bodyMarkdown,
    organization: ctx.organization,
    primaryColor: ctx.config.theme.primaryColor,
    footerText: ctx.config.theme.footerText,
    slogan: ctx.config.theme.slogan,
    fontFamily: ctx.config.theme.fontFamily,
  };
}
