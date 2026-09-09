import assert from "node:assert/strict";
import test from "node:test";
import { render } from "@react-email/render";
import * as React from "react";
import { configSchema, contrastRatio, frontmatterThemeSchema, THEME_PRESET_NAMES } from "../config-schema.js";
import ContentEmail from "./templates/ContentEmail.js";
import { normalizeThemeSelection, resolveEmailTheme, selectLogoUrl } from "./theme.js";

const baseConfig = {
  organization: { name: "Example", logoUrl: "assets/logo.svg" },
  theme: { primaryColor: "#1a73e8", footerText: "© Example" },
};

function resolveTheme(rawTheme?: unknown) {
  const config = configSchema.parse(baseConfig);
  const selection = normalizeThemeSelection(frontmatterThemeSchema.parse(rawTheme));
  return resolveEmailTheme(config.theme, selection);
}

test("missing frontmatter theme resolves to classic", () => {
  const theme = resolveTheme();

  assert.equal(theme.appearance, "light");
  assert.equal(theme.background, "#ffffff");
  assert.equal(theme.foreground, "#333333");
  assert.equal(theme.accent, "#1a73e8");
});

test("contrast defaults meet AA for every rendered text pairing", () => {
  const theme = resolveTheme("cobalt-mint");

  for (const [text, background] of [
    [theme.foreground, theme.background],
    [theme.mutedForeground, theme.background],
    [theme.accent, theme.background],
    [theme.foreground, theme.surface],
    [theme.accent, theme.surface],
  ]) {
    assert.ok(contrastRatio(text, background) >= 4.5);
  }
});

test("every named contrast preset meets AA", () => {
  for (const preset of THEME_PRESET_NAMES.filter((name) => name !== "classic")) {
    const theme = resolveTheme(preset);
    assert.equal(theme.appearance, "contrast");
  }
});

test("frontmatter object form selects a preset", () => {
  const theme = resolveTheme({ preset: "forest-cream" });

  assert.equal(theme.background, "#173F35");
  assert.equal(theme.accent, "#FFD166");
});

test("contrast configurations reject inaccessible overrides", () => {
  const result = frontmatterThemeSchema.safeParse({
    preset: "cobalt-mint",
    colors: { foreground: "#1A4B8C" },
  });

  assert.equal(result.success, false);
  assert.match(result.error?.issues[0]?.message ?? "", /WCAG AA requires at least 4\.50:1/);
});

test("contrast mode selects a dark-background logo when supplied", () => {
  const organization = {
    name: "Example",
    logoUrl: "assets/logo.svg",
    logoUrlOnDark: "assets/logo-white.svg",
  };

  assert.equal(selectLogoUrl(organization, "light"), organization.logoUrl);
  assert.equal(selectLogoUrl(organization, "contrast"), organization.logoUrlOnDark);
  assert.equal(selectLogoUrl({ name: "Example", logoUrl: "assets/logo.svg" }, "contrast"), "assets/logo.svg");
});

test("contrast rendering applies semantic colors throughout the shell", async () => {
  const config = configSchema.parse({
    ...baseConfig,
    organization: { ...baseConfig.organization, logoUrlOnDark: "https://example.com/logo-white.png" },
  });
  const theme = resolveEmailTheme(
    config.theme,
    normalizeThemeSelection(frontmatterThemeSchema.parse("cobalt-mint")),
  );
  const html = await render(React.createElement(ContentEmail, {
    variant: "news",
    categoryLabel: "News",
    title: "Contrast preview",
    date: "2026-09-09",
    bodyMarkdown: "Read the [details](https://example.com).",
    organization: {
      ...config.organization,
      logoUrl: selectLogoUrl(config.organization, theme.appearance),
    },
    theme,
    footerText: config.theme.footerText,
    tagline: config.theme.tagline,
    social: [],
    locale: "en",
    unsubscribeLabel: "Unsubscribe",
  }));

  assert.match(html, /background-color:#1A4B8C/);
  assert.match(html, /color:#FFFFFF/);
  assert.match(html, /color:#A7F3D0/);
  assert.match(html, /logo-white\.png/);
});

test("contrast rendering adds a white plate when no dark logo exists", async () => {
  const config = configSchema.parse(baseConfig);
  const theme = resolveEmailTheme(
    config.theme,
    normalizeThemeSelection(frontmatterThemeSchema.parse("cobalt-mint")),
  );
  const html = await render(React.createElement(ContentEmail, {
    variant: "news",
    categoryLabel: "News",
    title: "Fallback logo preview",
    date: "2026-09-09",
    bodyMarkdown: "Body",
    organization: config.organization,
    theme,
    footerText: config.theme.footerText,
    tagline: config.theme.tagline,
    social: [],
    locale: "en",
    unsubscribeLabel: "Unsubscribe",
  }));

  assert.match(html, /background-color:#ffffff;border-radius:12px/);
  assert.match(html, /<td style="padding:10px"><img alt="Example"/);
});
