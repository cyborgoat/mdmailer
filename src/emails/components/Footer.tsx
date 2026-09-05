import { Hr, Img, Link, Section, Text } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";
import { SocialLinks } from "./SocialLinks.js";

interface FooterProps {
  organizationName: string;
  organizationLogoUrl: string;
  tagline: string;
  footerText: string;
  fontFamily: string;
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
  organizationLogoUrl,
  tagline,
  footerText,
  fontFamily,
  social,
  address,
  unsubscribeUrl,
  unsubscribeLabel = "Unsubscribe",
}: FooterProps) {
  return (
    <Section style={{ textAlign: "center" }}>
      <Hr style={{ borderColor: "#e6e6e6", margin: "40px 0 24px" }} />
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        width={64}
        height={64}
        style={{ display: "block", objectFit: "contain", margin: "0 auto" }}
      />
      <Text
        style={{ fontFamily, fontSize: "13px", fontWeight: 600, color: "#17352b", textAlign: "center", margin: "12px 0 0" }}
      >
        {organizationName}
      </Text>
      <Text
        style={{
          fontSize: "13px",
          lineHeight: "20px",
          color: "#52665d",
          fontStyle: "italic",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          margin: "6px 0 0",
        }}
      >
        {tagline}
      </Text>
      {social && social.length > 0 ? <SocialLinks links={social} fontFamily={fontFamily} /> : null}
      {address ? (
        <Text style={{ fontFamily, fontSize: "11px", lineHeight: "17px", color: "#52665d", textAlign: "center", margin: "16px 0 0" }}>
          {address}
        </Text>
      ) : null}
      <Text style={{ fontFamily, fontSize: "12px", lineHeight: "18px", color: "#52665d", textAlign: "center", margin: "24px 0 0" }}>
        {footerText.replaceAll("{{organization}}", organizationName)}
      </Text>
      {unsubscribeUrl ? (
        <Text style={{ fontFamily, fontSize: "11px", lineHeight: "17px", color: "#52665d", textAlign: "center", margin: "8px 0 0" }}>
          <Link href={unsubscribeUrl} style={{ fontFamily, color: "#52665d" }}>
            {unsubscribeLabel}
          </Link>
        </Text>
      ) : null}
    </Section>
  );
}
