import { Heading, Link, Text } from "react-email";
import type { EmailTheme } from "./theme.js";

// Outlook desktop (the Word rendering engine) doesn't reliably inherit
// font-family from ancestor elements, so every text-bearing override below
// sets it explicitly instead of relying on inheritance from Body.
//
// Shared by every email template for rendering the free-form Markdown body.
export function buildMarkdownOverrides(theme: EmailTheme) {
  const { fontFamily } = theme;
  const bodyText = { fontFamily, fontSize: "14px", lineHeight: "22px", color: theme.foreground };

  return {
    h1: { component: Heading, props: { as: "h1", style: { fontFamily, color: theme.foreground, fontSize: "24px" } } },
    h2: { component: Heading, props: { as: "h2", style: { fontFamily, color: theme.foreground, fontSize: "18px", marginTop: "24px" } } },
    h3: { component: Heading, props: { as: "h3", style: { fontFamily, color: theme.foreground, fontSize: "16px", marginTop: "20px" } } },
    p: { component: Text, props: { style: bodyText } },
    ul: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
    ol: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
    li: { props: { style: { fontFamily, margin: "0 0 4px" } } },
    a: { component: Link, props: { style: { fontFamily, color: theme.accent } } },
    img: { props: { style: { maxWidth: "100%", height: "auto", display: "block", margin: "16px 0" } } },
    del: { props: { style: { fontFamily, color: theme.mutedForeground } } },
    blockquote: {
      props: {
        style: {
          ...bodyText,
          margin: "16px 0",
          padding: "4px 16px",
          backgroundColor: theme.appearance === "contrast" ? theme.surface : undefined,
          borderLeft: `3px solid ${theme.border}`,
          color: theme.foreground,
        },
      },
    },
    code: {
      props: {
        style: {
          fontFamily: "Consolas, Menlo, Monaco, monospace",
          fontSize: "13px",
          backgroundColor: theme.surface,
          color: theme.foreground,
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
          backgroundColor: theme.surface,
          color: theme.foreground,
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
          fontFamily,
          textAlign: "left",
          padding: "8px",
          color: theme.foreground,
          borderBottom: `2px solid ${theme.border}`,
          fontWeight: "bold",
        },
      },
    },
    td: {
      props: { style: { fontFamily, color: theme.foreground, padding: "8px", borderBottom: `1px solid ${theme.border}` } },
    },
    input: { props: { disabled: true, style: { marginRight: "6px" } } },
  };
}
