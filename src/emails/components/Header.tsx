import { Img, Section } from "react-email";
import * as React from "react";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
  // Defaults: roomy centered logo band; the event template passes a
  // smaller left-aligned bar.
  height?: number;
  align?: "center" | "left";
}

export function Header({ organizationName, organizationLogoUrl, height = 120, align = "center" }: HeaderProps) {
  return (
    <Section style={{ padding: "20px 0", borderBottom: "1px solid #e6e6e6", textAlign: align }}>
      <Img
        src={organizationLogoUrl}
        alt={organizationName}
        width={Math.round(height * 1.2)}
        height={height}
        style={{
          margin: align === "center" ? "0 auto" : "0",
          borderRadius: "16px",
          display: "block",
        }}
      />
    </Section>
  );
}
