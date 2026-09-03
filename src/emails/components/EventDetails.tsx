import { Column, Row, Section, Text } from "react-email";
import * as React from "react";

export interface EventDetailItem {
  label: string;
  value: React.ReactNode;
}

interface EventDetailsProps {
  items: EventDetailItem[];
  fontFamily: string;
}

/**
 * A bordered "card" of label/value rows (When / Where / Join / Hosts). The
 * caller filters out empty entries; an empty list renders nothing.
 */
export function EventDetails({ items, fontFamily }: EventDetailsProps) {
  if (items.length === 0) return null;

  return (
    <Section
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: "8px",
        padding: "8px 16px",
        margin: "16px 0",
      }}
    >
      {items.map((item, index) => (
        <Row key={item.label} style={index === items.length - 1 ? undefined : { marginBottom: "4px" }}>
          <Column style={{ width: "72px", verticalAlign: "top", padding: "6px 0" }}>
            <Text style={{ fontFamily, fontSize: "13px", fontWeight: "bold", color: "#111827", margin: "0" }}>
              {item.label}
            </Text>
          </Column>
          <Column style={{ verticalAlign: "top", padding: "6px 0" }}>
            <Text style={{ fontFamily, fontSize: "13px", color: "#333333", margin: "0" }}>{item.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
