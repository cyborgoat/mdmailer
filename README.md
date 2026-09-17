# mdmailer

Turn Markdown into branded HTML and EML emails. Preview the HTML in a browser, then open the EML in your mail client to add recipients and send. mdmailer does not send email itself.

Requires **Node.js 24 or later**.

## Quick start

From this repository:

```bash
npm install
npm run build
npm link
mdmailer content/news.md
```

Edit `mdmailer.config.json` for your branding and a file in `content/` for your message. Generate all templates with:

```bash
mdmailer content/
```

Outputs go to `output/<name>.html` and `output/<name>.eml`. Matching output files are replaced. Folder generation reads immediate `.md` files in filename order, skips subfolders, and stops on the first error.

For a new email workspace, run `mdmailer init`. It creates missing config, a placeholder logo, and the five templates below without overwriting existing files.

## Templates and themes

| File | Type | Theme | Use for |
| --- | --- | --- | --- |
| [news.md](content/news.md) | `news` | `classic` | Updates, release notes, and digests |
| [notification.md](content/notification.md) | `notification` | `classic` | A notice with a banner and headline |
| [meeting.md](content/meeting.md) | `meeting` | `navy-gold` | Meeting details, hosts, and an agenda |
| [event.md](content/event.md) | `event` | `forest-cream` | An event invitation |
| [webinar.md](content/webinar.md) | `webinar` | `forest-cream` | An online session with speaker bios |

Any type can use any of the three themes:

- `classic` — light background with your brand color; the default.
- `navy-gold` — navy background with gold accents.
- `forest-cream` — forest background with cream text and gold accents.

Choose the theme in frontmatter or override it for one run:

```bash
mdmailer content/meeting.md --theme classic
mdmailer content/ --config path/to/config.json
```

Run `mdmailer --help` for usage. The older `mdmailer generate --input <file.md>` command still works.

## Write an email

Each Markdown file starts with YAML frontmatter:

```markdown
---
title: "Team update"
type: news
lang: en
theme: classic
date: 2026-10-01
---

## What's new

Write your message with **formatting**, lists, tables, and [links](https://example.com).
```

| Field | Meaning |
| --- | --- |
| `type` | Required: `news`, `notification`, `meeting`, `event`, or `webinar` |
| `lang` | Required: `en` or `zh` (Simplified Chinese) |
| `title` | Email subject and default heading |
| `theme` | `classic`, `navy-gold`, or `forest-cream`; defaults to `classic` |
| `date` | News dateline; also a fallback for an event's `startsAt` |

Language changes built-in labels, not your message. Write titles, body text, and host bios in the intended language. Type and language are set in frontmatter only.

For **notifications**, use `headline` to override the heading and `banner` for the callout text. Notifications do not display a dateline.

For **meetings, events, and webinars**:

| Field | Meaning |
| --- | --- |
| `eventName` | Heading; defaults to `title` |
| `kicker` | Small label above the heading; meetings and webinars have localized defaults |
| `startsAt` | Event date, such as `2026-10-15` |
| `time` | Quoted time, such as `"16:00–17:00 UTC"` |
| `location` | Venue or online location |
| `joinUrl` | Meeting or registration link |
| `hosts` | Names or objects with `name`, optional `role`, `bio`, and `photo` |
| `agenda` | Markdown text, a list of strings, or a list of `{ time, title }` objects |

Date and time appear inside the details box with location and the join link. Missing details are omitted. Meetings show hosts in a separate section; events and webinars do so when host profiles include photos, roles, or bios.

Older files should change `release-notes` and `digest` to `news`, `announcement` to `notification`, and `workshop` to `meeting`. The old type names are no longer accepted.

## Branding and images

Edit `mdmailer.config.json`:

```json
{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1A73E8",
    "tagline": "Your tagline",
    "footerText": "© 2026 {{organization}}"
  }
}
```

Optional settings include `organization.logoUrlOnDark` for dark themes, and `theme.fontFamily`, `contentWidth`, `social` (`{ label, url }` entries), `address`, and `unsubscribeUrl`.

Use local paths or hosted HTTPS URLs for logos, Markdown images, and host photos. Local images are embedded in both outputs; HTML uses data URLs and EML uses inline attachments. Local SVGs are converted to PNG. All local paths, the default config, and `output/` resolve from the current working directory.

For custom theme colors, use an object instead of a preset name:

```yaml
theme:
  preset: navy-gold
  colors:
    accent: "#FFE099"
```

Supported color keys are `background`, `foreground`, `mutedForeground`, `accent`, `surface`, and `border`. Quote six-digit hex values. Dark themes enforce WCAG AA text contrast. `--theme` changes the preset while retaining frontmatter color overrides.

## Development

```bash
npm run generate -- content/   # Run from source without linking
npm run email:dev              # Live template previews
npm run typecheck
npm test
npm run build
```

The linked `mdmailer` command uses `dist/cli.js`; rebuild after changing source code. Generated output and personal drafts are gitignored; the five starter files are tracked.
