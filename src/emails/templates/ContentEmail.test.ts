import assert from "node:assert/strict";
import test from "node:test";
import { render } from "@react-email/render";
import * as React from "react";
import ContentEmail, { type ContentEmailProps } from "./ContentEmail.js";
import { DEFAULT_EMAIL_PREVIEW_THEME } from "../theme.js";

const common = {
  title: "Example title",
  bodyMarkdown: "Body with a [link](https://example.com).",
  organization: { name: "Example", logoUrl: "https://example.com/logo.png" },
  theme: DEFAULT_EMAIL_PREVIEW_THEME,
  footerText: "© Example",
  tagline: "Example tagline",
  social: [],
  locale: "en" as const,
  unsubscribeLabel: "Unsubscribe",
};

async function renderContent(props: ContentEmailProps): Promise<string> {
  return render(React.createElement(ContentEmail, props));
}

test("news variant renders its category, title, and dateline", async () => {
  const html = await renderContent({ ...common, variant: "news", categoryLabel: "News", date: "2026-09-09" });

  assert.match(html, />News<\/p>/);
  assert.match(html, />Example title<\/h1>/);
  assert.match(html, />2026-09-09<\/p>/);
  assert.match(html, /font-size:30px/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /content="width=device-width, initial-scale=1"/);
});

test("release notes and digest variants render their semantic categories", async () => {
  const releaseNotes = await renderContent({
    ...common,
    variant: "release-notes",
    categoryLabel: "Release notes",
    date: "2026-09-09",
  });
  const digest = await renderContent({ ...common, variant: "digest", categoryLabel: "Digest", date: "2026-09-09" });

  assert.match(releaseNotes, />Release notes<\/p>/);
  assert.match(digest, />Digest<\/p>/);
});

test("announcement variant renders banner and headline without a dateline", async () => {
  const html = await renderContent({
    ...common,
    variant: "announcement",
    headline: "Important headline",
    bannerText: "Announcement label",
  });

  assert.match(html, />Announcement label<\/p>/);
  assert.match(html, />Important headline<\/h1>/);
  assert.doesNotMatch(html, /2026-09-09/);
});
