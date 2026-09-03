import { Img, Section } from "react-email";
import * as React from "react";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
  // Defaults reproduce the original centered 110px logo band; the event
  // template passes a smaller left-aligned bar.
  height?: number;
  align?: "center" | "left";
}

export function Header({ organizationName, organizationLogoUrl, height = 110, align = "center" }: HeaderProps) {
  return (
    <Section style={{ padding: "24px 0", borderBottom: "1px solid #e6e6e6", textAlign: align }}>
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        height={height}
        style={{ margin: align === "center" ? "0 auto" : "0" }}
      />
    </Section>
  );
}
