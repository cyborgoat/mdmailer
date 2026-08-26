import { Hr, Text } from "@react-email/components";
import * as React from "react";

interface FooterProps {
  footerText: string;
}

export function Footer({ footerText }: FooterProps) {
  return (
    <>
      <Hr style={{ borderColor: "#e6e6e6", margin: "32px 0 16px" }} />
      <Text style={{ fontSize: "12px", color: "#8a8a8a" }}>{footerText}</Text>
    </>
  );
}
