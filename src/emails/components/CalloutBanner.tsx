import { Section, Text } from "react-email";
import * as React from "react";
import type { EmailTheme } from "../theme.js";

interface CalloutBannerProps {
  text: string;
  theme: EmailTheme;
}

/** A full-width colored strip with bold white text — the announcement header. */
export function CalloutBanner({ text, theme }: CalloutBannerProps) {
  const isContrast = theme.appearance === "contrast";

  return (
    <Section style={{
      backgroundColor: isContrast ? theme.surface : theme.accent,
      border: isContrast ? `1px solid ${theme.border}` : undefined,
      borderRadius: "10px",
      padding: "14px 18px",
      margin: "24px 0 0",
    }}>
      <Text
        style={{
          fontFamily: theme.fontFamily,
          fontSize: "13px",
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: isContrast ? theme.foreground : "#ffffff",
          margin: "0",
        }}
      >
        {text}
      </Text>
    </Section>
  );
}
