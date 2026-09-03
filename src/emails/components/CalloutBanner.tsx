import { Section, Text } from "react-email";
import * as React from "react";

interface CalloutBannerProps {
  text: string;
  color: string;
  fontFamily: string;
}

/** A full-width colored strip with bold white text — the announcement header. */
export function CalloutBanner({ text, color, fontFamily }: CalloutBannerProps) {
  return (
    <Section style={{ backgroundColor: color, padding: "16px 24px", margin: "24px 0 0" }}>
      <Text
        style={{
          fontFamily,
          fontSize: "13px",
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#ffffff",
          margin: "0",
        }}
      >
        {text}
      </Text>
    </Section>
  );
}
