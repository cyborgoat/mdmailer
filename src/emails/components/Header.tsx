import { Container, Img, Section } from "react-email";
import * as React from "react";
import type { EmailTheme } from "../theme.js";

interface HeaderProps {
  organizationName: string;
  organizationLogoUrl: string;
  /**
   * Intrinsic width:height of the logo art. Sizes the <img> box so the logo
   * keeps its real proportions; falls back to a 1.2 landscape guess when
   * unknown (remote logos, whose bytes are never fetched).
   */
  logoAspectRatio?: number;
  theme: EmailTheme;
  useLogoPlate?: boolean;
}

const LOGO_HEIGHT = 156;
const FALLBACK_ASPECT_RATIO = 1.2;

export function Header({ organizationName, organizationLogoUrl, logoAspectRatio, theme, useLogoPlate }: HeaderProps) {
  const aspectRatio =
    logoAspectRatio && logoAspectRatio > 0 ? logoAspectRatio : FALLBACK_ASPECT_RATIO;
  const logo = (
    <Img
      src={organizationLogoUrl}
      alt={organizationName}
      width={Math.round(LOGO_HEIGHT * aspectRatio)}
      height={LOGO_HEIGHT}
      style={{
        margin: "0 auto",
        borderRadius: "16px",
        display: "block",
      }}
    />
  );

  return (
    <Section style={{ padding: "20px 0", borderBottom: `1px solid ${theme.border}`, textAlign: "center" }}>
      {useLogoPlate ? (
        <Container style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "12px",
          maxWidth: `${Math.round(LOGO_HEIGHT * aspectRatio) + 24}px`,
        }}>
          {logo}
        </Container>
      ) : logo}
    </Section>
  );
}
