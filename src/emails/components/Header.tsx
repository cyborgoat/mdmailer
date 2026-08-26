import { Img, Section, Text } from "@react-email/components";
import * as React from "react";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
  slogan: string;
}

export function Header({ organizationName, organizationLogoUrl, slogan }: HeaderProps) {
  return (
    <Section style={{ padding: "24px 0", borderBottom: "1px solid #e6e6e6", textAlign: "center" }}>
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        height={110}
        style={{ margin: "0 auto" }}
      />
      <Text style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic", margin: "8px 0 0" }}>
        {slogan}
      </Text>
    </Section>
  );
}
