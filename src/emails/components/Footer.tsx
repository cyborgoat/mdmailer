import { Column, Hr, Img, Link, Row, Text } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";
import { SocialLinks } from "./SocialLinks.js";

interface FooterProps {
  organizationName: string;
  organizationLogoUrl: string;
  slogan: string;
  footerText: string;
  fontFamily: string;
  // Optional extras for the event/announcement templates. Each block only
  // renders when its prop is provided, so the default `regular` footer is
  // unchanged.
  social?: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
}

export function Footer({
  organizationName,
  organizationLogoUrl,
  slogan,
  footerText,
  fontFamily,
  social,
  address,
  unsubscribeUrl,
}: FooterProps) {
  return (
    <>
      <Hr style={{ borderColor: "#e6e6e6", margin: "32px 0 16px" }} />
      <Row>
        <Column style={{ width: "28px", verticalAlign: "middle" }}>
          <Img
            src={organizationLogoUrl}
            alt={organizationName}
            width={20}
            height={20}
            style={{
              display: "block",
              objectFit: "contain",
            }}
          />
        </Column>
        <Column style={{ verticalAlign: "middle", paddingLeft: "8px" }}>
          <Text style={{ fontFamily, fontSize: "13px", fontWeight: 600, color: "#17352b", margin: "0" }}>
            {organizationName}
          </Text>
        </Column>
      </Row>
      <Text
        style={{
          fontSize: "12px",
          color: "#52665d",
          fontStyle: "italic",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.2px",
          margin: "2px 0 8px",
        }}
      >
        {slogan}
      </Text>
      <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", margin: "0" }}>
        {footerText.replaceAll("{{organization}}", organizationName)}
      </Text>
      {social && social.length > 0 ? <SocialLinks links={social} fontFamily={fontFamily} /> : null}
      {address ? (
        <Text style={{ fontFamily, fontSize: "11px", color: "#52665d", margin: "8px 0 0" }}>{address}</Text>
      ) : null}
      {unsubscribeUrl ? (
        <Text style={{ fontFamily, fontSize: "11px", color: "#52665d", margin: "4px 0 0" }}>
          <Link href={unsubscribeUrl} style={{ fontFamily, color: "#52665d" }}>
            Unsubscribe
          </Link>
        </Text>
      ) : null}
    </>
  );
}
