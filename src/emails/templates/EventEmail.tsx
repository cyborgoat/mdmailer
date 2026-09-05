import { Body, Column, Container, Head, Heading, Html, Link, Preview, Row, Section, Text } from "react-email";
import * as React from "react";
import Markdown from "markdown-to-jsx";
import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { EventDetails, type EventDetailItem } from "../components/EventDetails.js";
import { HostsSection } from "../components/HostsSection.js";
import { buildMarkdownOverrides } from "../markdown-overrides.js";
import { fmString, formatDate } from "../../frontmatter.js";
import type { TemplateContext } from "../template-context.js";
import { DEFAULT_FONT_FAMILY, type Brand, type SocialLink } from "../../config-schema.js";
import { t, type Locale } from "../../i18n/index.js";
import type { HostProfile } from "../../resolve-hosts.js";

type AgendaEntry = { time?: string; title: string };
type Agenda = { kind: "markdown"; markdown: string } | { kind: "list"; entries: AgendaEntry[] } | null;

export interface EventEmailProps {
  title: string;
  kicker: string;
  eventName: string;
  bodyMarkdown: string;
  startsAt: string;
  time?: string;
  location?: string;
  joinUrl?: string;
  /** Plain host names for the details card (hidden when rich profiles are shown). */
  hosts: string[];
  /** Rich host cards with photo + bio (webinar). */
  hostProfiles: HostProfile[];
  showHostsSection: boolean;
  agenda: Agenda;
  organization: Brand;
  primaryColor: string;
  footerText: string;
  tagline: string;
  fontFamily: string;
  social: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  locale: Locale;
  labels: {
    where: string;
    join: string;
    hosts: string;
    hostsSection: string;
    agenda: string;
    unsubscribe: string;
  };
}

// Structure adapted from react.email's "01-Barebone/welcome": a compact top
// logo bar, a hero, a details card, the free-form body,
// optional host intros, an optional agenda, and a richer footer.
export default function EventEmail({
  title,
  kicker,
  eventName,
  bodyMarkdown,
  startsAt,
  time,
  location,
  joinUrl,
  hosts,
  hostProfiles,
  showHostsSection,
  agenda,
  organization,
  primaryColor,
  footerText,
  tagline,
  fontFamily,
  social,
  address,
  unsubscribeUrl,
  locale,
  labels,
}: EventEmailProps) {
  const whenLine = [startsAt, time].filter(Boolean).join(" · ");
  const richHosts = hostProfiles.some((host) => host.photoUrl || host.bio || host.role);
  const renderHostsSection = hostProfiles.length > 0 && (showHostsSection || richHosts);

  // "When" isn't in the card — it's already the subline under the heading.
  // The dedicated host section replaces the plain "Hosts" row in the details card.
  const details: EventDetailItem[] = [
    { label: labels.where, value: location },
    {
      label: labels.join,
      value: joinUrl ? (
        <Link href={joinUrl} style={{ fontFamily }}>
          {joinUrl}
        </Link>
      ) : (
        ""
      ),
    },
    ...(renderHostsSection ? [] : [{ label: labels.hosts, value: hosts.join(", ") }]),
  ].filter((item) => Boolean(item.value));

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#f4f4f4", fontFamily }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", maxWidth: "680px" }}>
          <Header organizationName={organization.name} organizationLogoUrl={organization.logoUrl} />
          <Section style={{ marginTop: "32px" }}>
            {kicker ? (
              <Text
                style={{
                  fontFamily,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: primaryColor,
                  margin: "0 0 4px",
                }}
              >
                {kicker}
              </Text>
            ) : null}
            <Heading as="h1" style={{ fontFamily, color: primaryColor, margin: "0" }}>
              {eventName}
            </Heading>
            {whenLine ? (
              <Text style={{ fontFamily, fontSize: "14px", color: "#52665d", margin: "8px 0 0" }}>{whenLine}</Text>
            ) : null}
          </Section>
          <EventDetails items={details} fontFamily={fontFamily} />
          {bodyMarkdown.trim() ? (
            <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{bodyMarkdown}</Markdown>
          ) : null}
          {renderHostsSection ? (
            <HostsSection hosts={hostProfiles} sectionLabel={labels.hostsSection} fontFamily={fontFamily} />
          ) : null}
          {agenda ? <AgendaSection agenda={agenda} agendaLabel={labels.agenda} fontFamily={fontFamily} /> : null}
          <Footer
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            tagline={tagline}
            footerText={footerText}
            fontFamily={fontFamily}
            social={social}
            address={address}
            unsubscribeUrl={unsubscribeUrl}
            unsubscribeLabel={labels.unsubscribe}
          />
        </Container>
      </Body>
    </Html>
  );
}

function AgendaSection({
  agenda,
  agendaLabel,
  fontFamily,
}: {
  agenda: Agenda;
  agendaLabel: string;
  fontFamily: string;
}) {
  if (!agenda) return null;

  return (
    <Section style={{ marginTop: "8px" }}>
      <Heading as="h2" style={{ fontFamily, fontSize: "18px", marginTop: "24px" }}>
        {agendaLabel}
      </Heading>
      {agenda.kind === "markdown" ? (
        <Markdown options={{ overrides: buildMarkdownOverrides(fontFamily) }}>{agenda.markdown}</Markdown>
      ) : (
        agenda.entries.map((entry, index) => (
          <Row key={index} style={{ marginBottom: "4px" }}>
            {entry.time ? (
              <Column style={{ width: "88px", verticalAlign: "top", padding: "4px 0" }}>
                <Text style={{ fontFamily, fontSize: "13px", fontWeight: "bold", color: "#111827", margin: "0" }}>
                  {entry.time}
                </Text>
              </Column>
            ) : null}
            <Column style={{ verticalAlign: "top", padding: "4px 0" }}>
              <Text style={{ fontFamily, fontSize: "13px", color: "#333333", margin: "0" }}>{entry.title}</Text>
            </Column>
          </Row>
        ))
      )}
    </Section>
  );
}

function normalizeAgenda(raw: unknown): Agenda {
  if (raw == null) return null;

  if (Array.isArray(raw)) {
    const entries: AgendaEntry[] = raw
      .map((item): AgendaEntry | null => {
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const title = fmString(record.title ?? record.item ?? record.name);
          if (!title) return null;
          return { time: fmString(record.time ?? record.at), title };
        }
        const title = fmString(item);
        return title ? { title } : null;
      })
      .filter((entry): entry is AgendaEntry => entry !== null);

    return entries.length > 0 ? { kind: "list", entries } : null;
  }

  const markdown = fmString(raw);
  return markdown ? { kind: "markdown", markdown } : null;
}

EventEmail.PreviewProps = {
  title: "You're invited: Hands-on with the new CLI",
  kicker: "Workshop",
  eventName: "Hands-on with the new CLI",
  bodyMarkdown:
    "A 90-minute working session for anyone shipping with the toolchain. Bring a laptop with Node 24 installed — we'll build a small integration together.\n\nSeats are limited to 20.",
  startsAt: "2026-09-24",
  time: "14:00–15:30 UTC",
  location: "Room 4B / Zoom",
  joinUrl: "https://example.com/zoom/cli-workshop",
  hosts: ["Alex Rivera", "Sam Chen"],
  hostProfiles: [{ name: "Alex Rivera" }, { name: "Sam Chen" }],
  showHostsSection: true,
  agenda: {
    kind: "list",
    entries: [
      { time: "14:00", title: "Setup & orientation" },
      { time: "14:20", title: "Build your first integration" },
      { time: "15:00", title: "Debugging & Q&A" },
    ],
  },
  organization: { name: "Developer Relations", logoUrl: "https://placehold.co/80x40" },
  primaryColor: "#1A4B8C",
  footerText: "© 2026 {{organization}}",
  tagline: "Flowing intelligence across the network.",
  fontFamily: DEFAULT_FONT_FAMILY,
  social: [{ label: "GitHub", url: "https://example.com/gh" }],
  address: "123 Market Street, Floor 1, Tech City, CA 94102",
  unsubscribeUrl: "https://example.com/unsubscribe",
  locale: "en",
  labels: {
    where: "Where",
    join: "Join",
    hosts: "Hosts",
    hostsSection: "Meet the hosts",
    agenda: "Agenda",
    unsubscribe: "Unsubscribe",
  },
} satisfies EventEmailProps;

export function buildEventProps(
  ctx: TemplateContext,
  opts: { defaultKicker?: string; showHostsSection?: boolean } = {},
): EventEmailProps {
  const fm = ctx.frontmatter;
  const theme = ctx.config.theme;
  const { locale } = ctx;
  return {
    title: ctx.title,
    kicker: fmString(fm.kicker ?? fm.eyebrow) ?? opts.defaultKicker ?? "",
    eventName: fmString(fm.eventName ?? fm.name) ?? ctx.title,
    bodyMarkdown: ctx.bodyMarkdown,
    startsAt: formatDate(fm.startsAt ?? fm.date) || ctx.date,
    time: fmString(fm.time),
    location: fmString(fm.location ?? fm.venue),
    joinUrl: fmString(fm.joinUrl ?? fm.onlineUrl),
    hosts: ctx.hostProfiles.map((host) => host.name),
    hostProfiles: ctx.hostProfiles,
    showHostsSection: opts.showHostsSection ?? false,
    agenda: normalizeAgenda(fm.agenda),
    organization: ctx.organization,
    primaryColor: theme.primaryColor,
    footerText: theme.footerText,
    tagline: theme.tagline,
    fontFamily: theme.fontFamily,
    social: theme.social,
    address: theme.address,
    unsubscribeUrl: theme.unsubscribeUrl,
    locale,
    labels: {
      where: t(locale, "detail.where"),
      join: t(locale, "detail.join"),
      hosts: t(locale, "detail.hosts"),
      hostsSection: t(locale, "section.hosts"),
      agenda: t(locale, "section.agenda"),
      unsubscribe: t(locale, "footer.unsubscribe"),
    },
  };
}
