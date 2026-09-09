import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_CONFIG = `{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}. Internal use only.",
    "tagline": "Flowing intelligence across the network.",
    "fontFamily": "\\"Microsoft YaHei\\", \\"Helvetica Neue\\", Helvetica, Arial, \\"PingFang SC\\", sans-serif",
    "social": []
  }
}
`;

const PLACEHOLDER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100" role="img" aria-label="Your Organization logo placeholder">
  <rect width="240" height="100" rx="12" fill="#1a73e8"/>
  <text x="120" y="57" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff">Your Logo</text>
</svg>
`;

const EXAMPLE_CONTENT = `---
title: "Example Update"
date: 2026-01-01
type: regular
lang: en
theme: classic
---

# Headline

Write your update here using regular Markdown. This example touches every element mdmailer knows how to style — replace it with your own content.

## Text formatting

You get **bold**, *italic*, ~~strikethrough~~, and \`inline code\`, plus [links](https://example.com).

## Lists

- Unordered items
- Support nesting:
  - Like this
  - And this
1. Ordered items
2. Work too

## Task list

- [x] Draft the update
- [x] Get it reviewed
- [ ] Send it out

## Table

| Metric | Before | After |
| --- | --- | --- |
| Deploy time | 22 min | 13 min |
| Latency | 800ms | 220ms |

## Blockquote

> Heads up: this is what a callout looks like.

## Code block

\`\`\`bash
npx mdmailer generate --input content/example.md
\`\`\`

---

Questions? Reply to this email.
`;

const EXAMPLE_EVENT = `---
title: "You're invited: Intro to the Design System"
type: workshop
lang: en
theme: navy-gold
eventName: "Intro to the Design System"
startsAt: 2026-02-18
time: "15:00–16:00 UTC"
location: "Room 2A — or join on the call"
joinUrl: "https://example.com/call/design-system"
hosts:
  - name: Jordan Lee
    role: Design Systems Lead
    bio: Leads the component library and helps product teams turn shared design patterns into accessible interfaces.
agenda:
  - time: "15:00"
    title: "Tokens, components, and when to use which"
  - time: "15:30"
    title: "Hands-on: build a screen from the kit"
  - time: "15:50"
    title: "Q&A"
---

A one-hour intro for anyone building UI. We'll walk through the component library,
then build a screen together so you leave knowing how the pieces fit.

## Who it's for

- Engineers and designers new to the system
- Anyone copying old markup who wants the supported way

> Bring a laptop. The recording and notes go out to all attendees.
`;

const EXAMPLE_WEBINAR = `---
title: "You're invited: Shipping reliable APIs in 2026"
type: webinar
lang: en
theme: forest-cream
eventName: "Shipping reliable APIs in 2026"
startsAt: 2026-10-15
time: "16:00–17:00 UTC"
location: "Online — Zoom"
joinUrl: "https://example.com/zoom/api-webinar"
hosts:
  - name: Priya Nair
    role: Staff Platform Engineer
    photo: assets/images/hosts/priya-nair.jpg
    bio: Leads API reliability work across our edge services.
  - name: Marcus Cole
    role: Principal Engineer, Observability
    photo: assets/images/hosts/marcus-cole.jpg
    bio: Designs the tracing and SLO tooling we use on-call.
agenda:
  - time: "16:00"
    title: "What breaks at scale (and what doesn't)"
  - time: "16:25"
    title: "Patterns we use in production"
  - time: "16:45"
    title: "Live Q&A"
---

A one-hour online session on designing APIs that stay calm under load. We'll cover
timeouts, retries, idempotency, and the observability signals that actually help
on-call — then take questions live.

## Who it's for

- Backend and platform engineers shipping public or partner APIs
- Anyone who's been burned by cascading timeouts and wants a clearer playbook

> Nothing to install — join from a browser when it's time.
`;

const EXAMPLE_ANNOUNCEMENT = `---
title: "All-hands moves to Thursdays"
type: announcement
lang: en
theme: plum-rose
headline: "All-hands moves to Thursdays, starting March"
banner: "Schedule change"
date: 2026-02-24
---

Starting **March 5**, the company all-hands runs **Thursdays at 16:00 UTC** instead
of Mondays. The format and length don't change.

## Why

Mondays collided with regional holidays too often, pushing recordings to Tuesday.
Thursday keeps it live for more people.

- Calendar invites update automatically — no action needed.
- Can't attend live? The recording and notes post within the hour.

[See the new calendar](https://example.com/all-hands)
`;

const EXAMPLE_MINIMAL = `---
title: "Heads up: brief API slowdown tonight"
type: minimal
lang: en
date: 2026-01-06
theme: cobalt-mint
---

We're migrating a database tonight at **23:00 UTC**. Expect slower API responses for
about 15 minutes. No downtime is planned and no action is needed on your side.

I'll reply here once it's done.
`;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeIfMissing(path: string, contents: string) {
  if (await exists(path)) {
    console.log(`Skipped (already exists): ${path}`);
    return;
  }
  await writeFile(path, contents, "utf-8");
  console.log(`Created: ${path}`);
}

export async function runInit() {
  const configPath = resolve("mdmailer.config.json");
  const contentDir = resolve("content");
  const assetsDir = resolve("assets");
  const logoPath = resolve(assetsDir, "logo.svg");

  await writeIfMissing(configPath, DEFAULT_CONFIG);
  await mkdir(contentDir, { recursive: true });
  await writeIfMissing(resolve(contentDir, "example.md"), EXAMPLE_CONTENT);
  await writeIfMissing(resolve(contentDir, "example-workshop.md"), EXAMPLE_EVENT);
  await writeIfMissing(resolve(contentDir, "example-webinar.md"), EXAMPLE_WEBINAR);
  await writeIfMissing(resolve(contentDir, "example-announcement.md"), EXAMPLE_ANNOUNCEMENT);
  await writeIfMissing(resolve(contentDir, "example-minimal.md"), EXAMPLE_MINIMAL);
  await mkdir(assetsDir, { recursive: true });
  await writeIfMissing(logoPath, PLACEHOLDER_LOGO_SVG);

  console.log(
    "\nNext steps:\n" +
      "  1. Replace assets/logo.svg with your real logo (or point logoUrl at a hosted image).\n" +
      "  2. Edit mdmailer.config.json with your organization's name, theme, and tagline.\n" +
      "  3. Edit content/example.md with your update.\n" +
      "  4. Run: npm run generate -- --input content/example.md\n" +
      "\n" +
      "Every Markdown file must declare its layout and language in frontmatter. Each example above shows one:\n" +
      "  example.md              regular update              (type: regular)\n" +
      "  example-workshop.md     workshop / event invitation  (type: workshop)\n" +
      "  example-webinar.md      webinar invitation           (type: webinar)\n" +
      "  example-announcement.md single high-impact notice     (type: announcement)\n" +
      "  example-minimal.md      short plain-text note         (type: minimal)\n" +
      "Set the required layout with `type:` in frontmatter.\n" +
      "Set the required language with `lang: en` or `lang: zh` (English or Chinese).\n",
  );
}
