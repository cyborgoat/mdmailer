import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY } from "../../config-schema.js";
import type { Locale } from "../../i18n/index.js";

export interface MinimalEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  footerText: string;
  organizationName: string;
  primaryColor: string;
  fontFamily: string;
  locale: Locale;
}

// A text-forward layout: no logo band, just a title, dateline, the Markdown
// body, and a one-line footer. For short, personal-feeling notes.
export default function MinimalEmail({
  title,
  date,
  bodyMarkdown,
  footerText,
  organizationName,
  primaryColor,
  fontFamily,
  locale,
}: MinimalEmailProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily }}>
        <Container style={{ padding: "24px", maxWidth: "680px" }}>
          <Heading as="h1" style={{ fontFamily, color: primaryColor }}>
            {title}
          </Heading>
          {date ? (
            <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", marginTop: "-8px" }}>{date}</Text>
          ) : null}
          <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{bodyMarkdown}</Markdown>
          <Hr style={{ borderColor: "#e6e6e6", margin: "32px 0 16px" }} />
          <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", margin: "0" }}>
            {footerText.replaceAll("{{organization}}", organizationName)}
          </Text>
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
  primaryColor: "#1A4B8C",
  fontFamily: DEFAULT_FONT_FAMILY,
  locale: "en",
} satisfies MinimalEmailProps;

export function buildMinimalProps(ctx: TemplateContext): MinimalEmailProps {
  return {
    title: ctx.title,
    date: ctx.date,
    bodyMarkdown: ctx.bodyMarkdown,
    footerText: ctx.config.theme.footerText,
    organizationName: ctx.organization.name,
    primaryColor: ctx.config.theme.primaryColor,
    fontFamily: ctx.config.theme.fontFamily,
    locale: ctx.locale,
  };
}
