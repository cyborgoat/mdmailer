import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import type { Brand } from "../../config-schema.js";

export interface OrganizationEmailProps {
  title: string;
  date: string;
  bodyMarkdown: string;
  organization: Brand;
  primaryColor: string;
  footerText: string;
  slogan: string;
}

const bodyText = { fontSize: "14px", lineHeight: "22px", color: "#333333" };

const markdownOverrides = {
  h1: { component: Heading, props: { as: "h1", style: { fontSize: "24px" } } },
  h2: { component: Heading, props: { as: "h2", style: { fontSize: "18px", marginTop: "24px" } } },
  h3: { component: Heading, props: { as: "h3", style: { fontSize: "16px", marginTop: "20px" } } },
  p: { component: Text, props: { style: bodyText } },
  ul: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
  ol: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
  li: { props: { style: { margin: "0 0 4px" } } },
  a: { component: Link },
  del: { props: { style: { color: "#8a8a8a" } } },
  blockquote: {
    props: {
      style: {
        ...bodyText,
        margin: "16px 0",
        padding: "4px 16px",
        borderLeft: "3px solid #dcdcdc",
        color: "#5c5c5c",
      },
    },
  },
  code: {
    props: {
      style: {
        fontFamily: "Consolas, Menlo, Monaco, monospace",
        fontSize: "13px",
        backgroundColor: "#f2f2f2",
        padding: "2px 4px",
        borderRadius: "3px",
      },
    },
  },
  pre: {
    props: {
      style: {
        fontFamily: "Consolas, Menlo, Monaco, monospace",
        fontSize: "13px",
        backgroundColor: "#f2f2f2",
        padding: "12px",
        borderRadius: "4px",
        overflowX: "auto",
        margin: "16px 0",
      },
    },
  },
  table: {
    props: {
      border: 0,
      cellPadding: 0,
      cellSpacing: 0,
      style: { ...bodyText, width: "100%", borderCollapse: "collapse", margin: "16px 0" },
    },
  },
  th: {
    props: {
      style: {
        textAlign: "left",
        padding: "8px",
        borderBottom: "2px solid #dcdcdc",
        fontWeight: "bold",
      },
    },
  },
  td: {
    props: { style: { padding: "8px", borderBottom: "1px solid #eaeaea" } },
  },
  input: { props: { disabled: true, style: { marginRight: "6px" } } },
};

export default function OrganizationEmail({
  title,
  date,
  bodyMarkdown,
  organization,
  primaryColor,
  footerText,
  slogan,
}: OrganizationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#f4f4f4", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", maxWidth: "600px" }}>
          <Header organizationName={organization.name} organizationLogoUrl={organization.logoUrl} />
          <Heading as="h1" style={{ color: primaryColor, marginTop: "24px" }}>
            {title}
          </Heading>
          <Text style={{ fontSize: "12px", color: "#8a8a8a", marginTop: "-8px" }}>{date}</Text>
          <Markdown options={{ overrides: markdownOverrides }}>{bodyMarkdown}</Markdown>
          <Footer
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            slogan={slogan}
            footerText={footerText}
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
  primaryColor: "#1a73e8",
  footerText: "© 2026 {{organization}}",
  slogan: "Flowing intelligence across the network",
} satisfies OrganizationEmailProps;
