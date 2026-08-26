import { Img, Section } from "react-email";
import * as React from "react";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
}

export function Header({ organizationName, organizationLogoUrl }: HeaderProps) {
  return (
    <Section style={{ padding: "24px 0", borderBottom: "1px solid #e6e6e6", textAlign: "center" }}>
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        height={110}
        style={{ margin: "0 auto" }}
      />
    </Section>
  );
}
