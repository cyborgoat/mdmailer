import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { copyAgentSkill, copyStarterPhotos } from "../template-assets.js";
import { globalConfigPath } from "../config.js";

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
type: news
lang: en
theme: classic
---

# Headline

Write your update here using normal Markdown. This example touches every element mdmailer knows how to style — replace it with your own content.

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
mdmailer templates/news.md
\`\`\`

---

Questions? Reply to this email.
`;

const EXAMPLE_MEETING = `---
title: "You're invited: Intro to the Design System"
type: meeting
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
    bio: Leads API reliability across our edge services, with eight years of experience building distributed systems. Previously developed the timeout and retry libraries used by our product teams.
  - name: Marcus Cole
    role: Principal Engineer, Observability
    photo: assets/images/hosts/marcus-cole.jpg
    bio: Has spent ten years helping teams run reliable production services. Designs tracing and SLO tools, coaches incident responders, and turns noisy dashboards into useful signals.
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

## What you will learn

| Topic | Takeaway |
| --- | --- |
| **Timeouts and retries** | Choose safe defaults and avoid retry storms |
| **Observability** | Connect traces, metrics, and service objectives |
| **Incident reviews** | Turn production lessons into practical improvements |

## Before the session

- [ ] Read the [session overview](https://example.com/webinar/overview).
- [ ] Bring one reliability question for the live Q&A.

> **No installation needed.** Join from your browser. The recording and slides will be shared afterward.
`;

const EXAMPLE_NOTIFICATION = `---
title: "All-hands moves to Thursdays"
type: notification
lang: en
theme: classic
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

const EXAMPLE_EVENT = `---
title: "You're invited: Community open house"
type: event
lang: en
theme: forest-cream
eventName: "Community open house"
startsAt: 2026-10-22
time: "17:00–19:00 UTC"
location: "Main hall"
joinUrl: "https://example.com/events/open-house"
hosts:
  - Community Team
---

Meet the team, explore recent projects, and share ideas over refreshments.
`;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
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

export async function runInit(argv: string[] = []) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--global")) {
    throw new Error("Usage: mdmailer init [--global]");
  }
  if (argv[0] === "--global") {
    const configPath = globalConfigPath();
    const assetsDir = resolve(dirname(configPath), "assets");
    await mkdir(assetsDir, { recursive: true });
    await writeIfMissing(configPath, DEFAULT_CONFIG);
    await copyAgentSkill(dirname(configPath));
    await writeIfMissing(resolve(assetsDir, "logo.svg"), PLACEHOLDER_LOGO_SVG);
    console.log(`\nEdit ${configPath} to set your organization, logo, brand color, and footer.\nRelative logo paths are resolved from ${dirname(configPath)}.\nGenerate any Markdown file with: mdmailer <file.md>\nFor agent integration, ask your agent to read ${resolve(dirname(configPath), "SKILL.md")}.`);
    return;
  }
  const configPath = resolve("mdmailer.config.json");
  const templatesDir = resolve("templates");
  const assetsDir = resolve("assets");
  const logoPath = resolve(assetsDir, "logo.svg");

  await writeIfMissing(configPath, DEFAULT_CONFIG);
  await mkdir(templatesDir, { recursive: true });
  await writeIfMissing(resolve(templatesDir, "news.md"), EXAMPLE_CONTENT);
  await writeIfMissing(resolve(templatesDir, "meeting.md"), EXAMPLE_MEETING);
  await writeIfMissing(resolve(templatesDir, "event.md"), EXAMPLE_EVENT);
  await writeIfMissing(resolve(templatesDir, "webinar.md"), EXAMPLE_WEBINAR);
  await writeIfMissing(resolve(templatesDir, "notification.md"), EXAMPLE_NOTIFICATION);
  await mkdir(assetsDir, { recursive: true });
  await writeIfMissing(logoPath, PLACEHOLDER_LOGO_SVG);
  await copyStarterPhotos(assetsDir);
  await copyAgentSkill(resolve("."));

  console.log(
    "\nNext steps:\n" +
      "  1. Replace assets/logo.svg with your real logo (or point logoUrl at a hosted image).\n" +
      "  2. Edit mdmailer.config.json with your organization's branding and footer.\n" +
      "  3. Edit templates/news.md with your update.\n" +
      "  4. Run: mdmailer templates/news.md\n" +
      "  5. For agent integration, ask your agent to read SKILL.md.\n" +
      "\n" +
      "Every Markdown file must declare its layout and language in frontmatter. Each example above shows one:\n" +
      "  news.md              news update                  (type: news)\n" +
      "  notification.md notice with a headline       (type: notification)\n" +
      "  meeting.md      meeting invitation           (type: meeting)\n" +
      "  event.md        event invitation             (type: event)\n" +
      "  webinar.md      webinar invitation           (type: webinar)\n" +
      "Set the required layout with `type:` in frontmatter.\n" +
      "Set the required language with `lang: en` or `lang: zh` (English or Chinese).\n",
  );
}
