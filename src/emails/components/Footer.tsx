import { Column, Hr, Img, Row, Text } from "@react-email/components";
import * as React from "react";

interface FooterProps {
  organizationName: string;
  organizationLogoUrl: string;
  slogan: string;
  footerText: string;
}

export function Footer({ organizationName, organizationLogoUrl, slogan, footerText }: FooterProps) {
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
            style={{ display: "block", objectFit: "contain" }}
          />
        </Column>
        <Column style={{ verticalAlign: "middle", paddingLeft: "8px" }}>
          <Text style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0" }}>
            {organizationName}
          </Text>
        </Column>
      </Row>
      <Text
        style={{
          fontSize: "12px",
          color: "#6b7280",
          fontStyle: "italic",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "0.2px",
          margin: "2px 0 8px",
        }}
      >
        {slogan}
      </Text>
      <Text style={{ fontSize: "12px", color: "#8a8a8a", margin: "0" }}>
        {footerText.replaceAll("{{organization}}", organizationName)}
      </Text>
    </>
  );
}
