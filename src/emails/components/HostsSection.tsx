import { Column, Heading, Img, Row, Section, Text } from "react-email";
import * as React from "react";
import type { HostProfile } from "../../resolve-hosts.js";

interface HostsSectionProps {
  hosts: HostProfile[];
  sectionLabel: string;
  fontFamily: string;
}

export function HostsSection({ hosts, sectionLabel, fontFamily }: HostsSectionProps) {
  return (
    <Section style={{ marginTop: "8px" }}>
      <Heading as="h2" style={{ fontFamily, fontSize: "18px", marginTop: "24px", marginBottom: "12px" }}>
        {sectionLabel}
      </Heading>
      {hosts.map((host) => (
        <Row key={host.name} style={{ marginBottom: "16px" }}>
          {host.photoUrl ? (
            <Column style={{ width: "72px", verticalAlign: "top", paddingRight: "12px" }}>
              <Img
                src={host.photoUrl}
                alt={host.name}
                width={64}
                height={64}
                style={{ display: "block", borderRadius: "50%", objectFit: "cover" }}
              />
            </Column>
          ) : null}
          <Column style={{ verticalAlign: "top" }}>
            <Text style={{ fontFamily, fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0" }}>
              {host.name}
            </Text>
            {host.role ? (
              <Text style={{ fontFamily, fontSize: "13px", color: "#1A4B8C", margin: "2px 0 0" }}>{host.role}</Text>
            ) : null}
            {host.bio ? (
              <Text style={{ fontFamily, fontSize: "13px", color: "#333333", margin: "6px 0 0", lineHeight: "1.45" }}>
                {host.bio}
              </Text>
            ) : null}
          </Column>
        </Row>
      ))}
    </Section>
  );
}
