import { Img, Section } from "react-email";
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
}

const LOGO_HEIGHT = 144;
const FALLBACK_ASPECT_RATIO = 1.2;

export function Header({ organizationName, organizationLogoUrl, logoAspectRatio, theme }: HeaderProps) {
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
        borderRadius: "12px",
        display: "block",
      }}
    />
  );

  return (
    <Section style={{ padding: "16px 0 20px", borderBottom: `1px solid ${theme.border}`, textAlign: "center" }}>
      {logo}
    </Section>
  );
}
