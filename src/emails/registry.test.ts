import assert from "node:assert/strict";
import test from "node:test";
import ContentEmail from "./templates/ContentEmail.js";
import EventEmail, { type EventEmailProps } from "./templates/EventEmail.js";
import { resolveTemplateName, templates } from "./registry.js";
import { configSchema, frontmatterThemeSchema } from "../config-schema.js";
import { normalizeThemeSelection, resolveEmailTheme } from "./theme.js";
import type { TemplateContext } from "./template-context.js";

test("content type aliases share one physical template", () => {
  assert.equal(templates.regular.component, ContentEmail);
  assert.equal(templates.minimal.component, ContentEmail);
  assert.equal(templates.announcement.component, ContentEmail);
});

test("event type aliases share one physical template", () => {
  assert.equal(templates.event.component, EventEmail);
  assert.equal(templates.workshop.component, EventEmail);
  assert.equal(templates.webinar.component, EventEmail);
});

test("template resolution preserves aliases and precedence", () => {
  assert.equal(resolveTemplateName(undefined, undefined), "regular");
  assert.equal(resolveTemplateName(undefined, "minimal"), "minimal");
  assert.equal(resolveTemplateName("event", "announcement"), "event");
  assert.equal(resolveTemplateName(undefined, "unknown"), null);
});

test("workshop and webinar aliases preserve their event defaults", () => {
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

  const workshop = templates.workshop.buildProps(ctx) as EventEmailProps;
  const webinar = templates.webinar.buildProps(ctx) as EventEmailProps;

  assert.equal(workshop.kicker, "Workshop");
  assert.equal(workshop.showHostsSection, true);
  assert.equal(webinar.kicker, "Webinar");
  assert.equal(webinar.showHostsSection, false);
});
