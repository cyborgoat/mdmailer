import { Button, Section } from "react-email";
import * as React from "react";

interface CtaButtonProps {
  href?: string;
  label: string;
  color: string;
  fontFamily: string;
}

/**
 * A single centered call-to-action button. Renders nothing when `href` is
 * missing, so templates can pass an optional URL straight through. Uses
 * react-email's `Button` (it emits the MSO/VML padding shim Outlook needs).
 */
export function CtaButton({ href, label, color, fontFamily }: CtaButtonProps) {
  if (!href) return null;

  return (
    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <Button
        href={href}
        style={{
          backgroundColor: color,
          color: "#ffffff",
          fontFamily,
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          display: "inline-block",
          padding: "12px 24px",
          borderRadius: "6px",
        }}
      >
        {label}
      </Button>
    </Section>
  );
}
