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
  assert.equal(templates["release-notes"].component, ContentEmail);
  assert.equal(templates.digest.component, ContentEmail);
  assert.equal(templates.announcement.component, ContentEmail);
});

test("event types share one physical template", () => {
  assert.equal(templates.event.component, EventEmail);
  assert.equal(templates.workshop.component, EventEmail);
  assert.equal(templates.webinar.component, EventEmail);
});

test("template resolution requires a valid frontmatter type", () => {
  assert.equal(resolveTemplateName(undefined), null);
  assert.equal(resolveTemplateName(""), null);
  assert.equal(resolveTemplateName("release-notes"), "release-notes");
  assert.equal(resolveTemplateName(" WORKSHOP "), "workshop");
  assert.equal(resolveTemplateName("regular"), null);
  assert.equal(resolveTemplateName("minimal"), null);
  assert.equal(resolveTemplateName("unknown"), null);
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
  const releaseNotes = templates["release-notes"].buildProps(base) as ContentEmailProps;
  const digest = templates.digest.buildProps({ ...base, locale: "zh" }) as ContentEmailProps;

  assert.equal(news.variant === "announcement" ? "" : news.categoryLabel, "News");
  assert.equal(releaseNotes.variant === "announcement" ? "" : releaseNotes.categoryLabel, "Release notes");
  assert.equal(digest.variant === "announcement" ? "" : digest.categoryLabel, "简报");
});
