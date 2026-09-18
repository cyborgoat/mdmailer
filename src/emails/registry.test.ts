import assert from "node:assert/strict";
import test from "node:test";
import ContentEmail, { type ContentEmailProps } from "./templates/ContentEmail.js";
import EventEmail, { type EventEmailProps } from "./templates/EventEmail.js";
import { resolveTemplateName, templates } from "./registry.js";
import { configSchema, frontmatterThemeSchema } from "../config-schema.js";
import { normalizeThemeSelection, resolveEmailTheme } from "./theme.js";
import type { TemplateContext } from "./template-context.js";

test("content types share one physical template", () => {
  assert.equal(templates.news.component, ContentEmail);
  assert.equal(templates.notification.component, ContentEmail);
});

test("event types share one physical template", () => {
  assert.equal(templates.event.component, EventEmail);
  assert.equal(templates.invitation.component, EventEmail);
  assert.equal(templates.meeting.component, EventEmail);
  assert.equal(templates.webinar.component, EventEmail);
});

test("template resolution requires a valid frontmatter type", () => {
  assert.equal(resolveTemplateName(undefined), null);
  assert.equal(resolveTemplateName(""), null);
  for (const type of ["news", "notification", "meeting", "event", "invitation", "webinar"]) {
    assert.equal(resolveTemplateName(type), type);
  }
  for (const type of ["release-notes", "digest", "announcement", "workshop", "constructor", "toString", "__proto__"]) {
    assert.equal(resolveTemplateName(type), null);
  }
  assert.equal(resolveTemplateName(" MEETING "), "meeting");
  assert.equal(resolveTemplateName("regular"), null);
  assert.equal(resolveTemplateName("minimal"), null);
  assert.equal(resolveTemplateName("unknown"), null);
});

test("meeting, invitation, and webinar types preserve their event defaults", () => {
  const config = configSchema.parse({
    organization: { name: "Example", logoUrl: "assets/logo.svg" },
    theme: { primaryColor: "#1a73e8", footerText: "© Example" },
  });
  const ctx: TemplateContext = {
    frontmatter: {},
    bodyMarkdown: "",
    config,
    theme: resolveEmailTheme(config.theme, normalizeThemeSelection(frontmatterThemeSchema.parse("classic"))),
    organization: config.organization,
    title: "Example",
    date: "2026-09-09",
    locale: "en",
    hostProfiles: [],
  };

  const meeting = templates.meeting.buildProps(ctx) as EventEmailProps;
  const invitation = templates.invitation.buildProps({
    ...ctx,
    frontmatter: { type: "invitation", rsvpUrl: "https://example.com/rsvp" },
  }) as EventEmailProps;
  const webinar = templates.webinar.buildProps(ctx) as EventEmailProps;

  assert.equal(meeting.kicker, "Meeting");
  assert.equal(meeting.showHostsSection, true);
  assert.equal(invitation.kicker, "Invitation");
  assert.equal(invitation.joinUrl, "https://example.com/rsvp");
  assert.equal(invitation.labels.join, "RSVP");
  assert.equal(invitation.labels.joinLink, "Respond to invitation");
  assert.equal(webinar.kicker, "Webinar");
  assert.equal(webinar.showHostsSection, false);
});

test("content types receive localized semantic labels", () => {
  const config = configSchema.parse({
    organization: { name: "Example", logoUrl: "assets/logo.svg" },
    theme: { primaryColor: "#1a73e8", footerText: "© Example" },
  });
  const base: TemplateContext = {
    frontmatter: {},
    bodyMarkdown: "",
    config,
    theme: resolveEmailTheme(config.theme, normalizeThemeSelection(frontmatterThemeSchema.parse("classic"))),
    organization: config.organization,
    title: "Example",
    date: "2026-09-09",
    locale: "en",
    hostProfiles: [],
  };

  const news = templates.news.buildProps(base) as ContentEmailProps;
  const notification = templates.notification.buildProps({ ...base, locale: "zh" }) as ContentEmailProps;
  const meeting = templates.meeting.buildProps({ ...base, locale: "zh" }) as EventEmailProps;

  assert.equal(news.variant === "notification" ? "" : news.categoryLabel, "News");
  assert.equal(notification.variant === "notification" ? notification.bannerText : "", "通知");
  assert.equal(meeting.kicker, "会议");
});
