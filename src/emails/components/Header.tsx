import { Img, Section } from "react-email";
import * as React from "react";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
}

const LOGO_HEIGHT = 120;

export function Header({ organizationName, organizationLogoUrl }: HeaderProps) {
  return (
    <Section style={{ padding: "20px 0", borderBottom: "1px solid #e6e6e6", textAlign: "center" }}>
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        width={Math.round(LOGO_HEIGHT * 1.2)}
        height={LOGO_HEIGHT}
        style={{
          margin: "0 auto",
          borderRadius: "16px",
          display: "block",
        }}
      />
    </Section>
  );
}
