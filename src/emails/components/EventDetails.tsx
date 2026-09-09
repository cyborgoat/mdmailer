import { Column, Row, Section, Text } from "react-email";
import * as React from "react";
import type { EmailTheme } from "../theme.js";

export interface EventDetailItem {
  label: string;
  value: React.ReactNode;
}

interface EventDetailsProps {
  items: EventDetailItem[];
  theme: EmailTheme;
}

/**
 * A bordered "card" of label/value rows (When / Where / Join / Hosts). The
 * caller filters out empty entries; an empty list renders nothing.
 */
export function EventDetails({ items, theme }: EventDetailsProps) {
  if (items.length === 0) return null;

  return (
    <Section
      style={{
        backgroundColor: theme.appearance === "contrast" ? theme.surface : undefined,
        border: `1px solid ${theme.border}`,
        borderRadius: "8px",
        padding: "8px 16px",
        margin: "16px 0",
      }}
    >
      {items.map((item, index) => (
        <Row key={item.label} style={index === items.length - 1 ? undefined : { marginBottom: "4px" }}>
          <Column style={{ width: "72px", verticalAlign: "top", padding: "6px 0" }}>
            <Text style={{ fontFamily: theme.fontFamily, fontSize: "13px", fontWeight: "bold", color: theme.foreground, margin: "0" }}>
              {item.label}
            </Text>
          </Column>
          <Column style={{ verticalAlign: "top", padding: "6px 0" }}>
            <Text style={{ fontFamily: theme.fontFamily, fontSize: "13px", color: theme.foreground, margin: "0" }}>{item.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
