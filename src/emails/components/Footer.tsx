import { Hr, Link, Section, Text } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";
import { SocialLinks } from "./SocialLinks.js";
import type { EmailTheme } from "../theme.js";

interface FooterProps {
  organizationName: string;
  tagline: string;
  footerText: string;
  theme: EmailTheme;
  // Optional metadata shared by every template. Each block only renders when
  // its corresponding config value is provided.
  social?: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  /** Localized label for the unsubscribe link. Defaults to English. */
  unsubscribeLabel?: string;
}

export function Footer({
  organizationName,
  tagline,
  footerText,
  theme,
  social,
  address,
  unsubscribeUrl,
  unsubscribeLabel = "Unsubscribe",
}: FooterProps) {
  return (
    <Section style={{ textAlign: "center" }}>
      <Hr style={{ borderTop: `1px solid ${theme.border}`, margin: "40px 0 24px" }} />
      <Text
        style={{
          fontFamily: theme.fontFamily,
          fontSize: "18px",
          lineHeight: "24px",
          fontWeight: 600,
          letterSpacing: "2px",
          color: theme.appearance === "contrast" ? theme.foreground : "#17352b",
          textAlign: "center",
          margin: "0",
        }}
      >
        {organizationName}
      </Text>
      <Text
        style={{
          fontSize: "13px",
          lineHeight: "20px",
          color: theme.mutedForeground,
          fontStyle: "italic",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          margin: "8px 0 0",
        }}
      >
        {tagline}
      </Text>
      {social && social.length > 0 ? <SocialLinks links={social} theme={theme} /> : null}
      {address ? (
        <Text style={{ fontFamily: theme.fontFamily, fontSize: "11px", lineHeight: "17px", color: theme.mutedForeground, textAlign: "center", margin: "16px 0 0" }}>
          {address}
        </Text>
      ) : null}
      <Text style={{ fontFamily: theme.fontFamily, fontSize: "12px", lineHeight: "18px", color: theme.mutedForeground, textAlign: "center", margin: "24px 0 0" }}>
        {footerText.replaceAll("{{organization}}", organizationName)}
      </Text>
      {unsubscribeUrl ? (
        <Text style={{ fontFamily: theme.fontFamily, fontSize: "11px", lineHeight: "17px", color: theme.mutedForeground, textAlign: "center", margin: "8px 0 0" }}>
          <Link href={unsubscribeUrl} style={{ fontFamily: theme.fontFamily, color: theme.accent }}>
            {unsubscribeLabel}
          </Link>
        </Text>
      ) : null}
    </Section>
  );
}
