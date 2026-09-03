import { Heading, Link, Text } from "react-email";

// Outlook desktop (the Word rendering engine) doesn't reliably inherit
// font-family from ancestor elements, so every text-bearing override below
// sets it explicitly instead of relying on inheritance from Body.
//
// Shared by every email template for rendering the free-form Markdown body.
export function buildMarkdownOverrides(fontFamily: string) {
  const bodyText = { fontFamily, fontSize: "14px", lineHeight: "22px", color: "#333333" };

  return {
    h1: { component: Heading, props: { as: "h1", style: { fontFamily, fontSize: "24px" } } },
    h2: { component: Heading, props: { as: "h2", style: { fontFamily, fontSize: "18px", marginTop: "24px" } } },
    h3: { component: Heading, props: { as: "h3", style: { fontFamily, fontSize: "16px", marginTop: "20px" } } },
    p: { component: Text, props: { style: bodyText } },
    ul: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
    ol: { props: { style: { ...bodyText, paddingLeft: "20px" } } },
    li: { props: { style: { fontFamily, margin: "0 0 4px" } } },
    a: { component: Link, props: { style: { fontFamily } } },
    img: { props: { style: { maxWidth: "100%", height: "auto", display: "block", margin: "16px 0" } } },
    del: { props: { style: { fontFamily, color: "#52665d" } } },
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
          fontFamily,
          textAlign: "left",
          padding: "8px",
          borderBottom: "2px solid #dcdcdc",
          fontWeight: "bold",
        },
      },
    },
    td: {
      props: { style: { fontFamily, padding: "8px", borderBottom: "1px solid #eaeaea" } },
    },
    input: { props: { disabled: true, style: { marginRight: "6px" } } },
  };
}
