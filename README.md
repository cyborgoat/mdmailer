# mdmailer

Turn Markdown into branded HTML and EML emails. Preview the HTML in a browser, then open the EML in your mail client to add recipients and send. mdmailer does not send email itself.

Requires **Node.js 24 or later**.

## Quick start

Install in your email workspace:

```bash
npm install @cyborgoat/mdmailer
npx mdmailer init
npx mdmailer templates/news.md
```

For a global CLI, use `npm install -g @cyborgoat/mdmailer`, then run `mdmailer` directly. The examples below use that shorter form.

Edit `mdmailer.config.json` for your branding and a file in `templates/` for your message. Generate all templates with:

```bash
mdmailer templates/
```

By default, `<name>.html` and `<name>.eml` are saved in your **current working directory** (where you run the command), not beside the input file. Use `--output <folder>` to choose another destination; missing folders are created. Matching output files are replaced. Folder generation reads immediate `.md` files in filename order, skips subfolders, and stops on the first error.

```bash
mdmailer templates/news.md --output output
mdmailer templates/ --output "/path/to/email exports"
```

Relative output paths resolve from your current working directory; absolute paths work too.

For a new email workspace, run `mdmailer init`. It creates SKILL.md, missing config, a placeholder logo, and the five starters under `templates/` without overwriting existing files. Templates are starting points: your Markdown files can live in any folder.

## Use with an LLM agent

The npm package includes `SKILL.md`, this README, and five starter files in `templates/`, and sample speaker photos. Run `npx mdmailer init` to copy SKILL.md into your workspace, then tell your agent:

> Read `SKILL.md` and use mdmailer to create my email.

Existing SKILL.md files are preserved. You can also point directly to the installed copy:

> Read `node_modules/@cyborgoat/mdmailer/SKILL.md` and use mdmailer to create my email.

For a global install, run `npm root -g`; the skill is at `<that directory>/@cyborgoat/mdmailer/SKILL.md`.

Agents can copy a starter into your workspace, edit the Markdown, and run the installed CLI. They do not need the source repository or a build step. Bundling a skill does not automatically register it with every agent; point your agent to the file or register it using that agent's skill mechanism.

## Configure branding once

```bash
mdmailer init --global
```

Edit `~/.mdmailer/mdmailer.config.json` to set your organization, logo, brand color, and footer. The command also copies the agent guide to `~/.mdmailer/SKILL.md` and creates a placeholder at `~/.mdmailer/assets/logo.svg`; it does not create templates or change your working folder.

The CLI selects one configuration file in this order:

1. The file passed with `--config <file>`.
2. `mdmailer.config.json` in your current working directory.
3. `~/.mdmailer/mdmailer.config.json` in your home directory.

Configurations are not merged. An invalid selected file reports an error instead of silently using another file. A local config lets you use different branding for a particular workspace. No package source files need editing.

Both `logoUrl` and `logoUrlOnDark` resolve relative to the selected JSON file. Absolute paths and hosted URLs also work. After global setup, you can generate from any folder:

```bash
mdmailer /path/to/my-email.md --output ./emails
```

## Templates and themes

| File | Type | Theme | Use for |
| --- | --- | --- | --- |
| [news.md](templates/news.md) | `news` | `classic` | Updates, release notes, and digests |
| [notification.md](templates/notification.md) | `notification` | `classic` | A notice with a banner and headline |
| [meeting.md](templates/meeting.md) | `meeting` | `navy-gold` | Meeting details, hosts, and an agenda |
| [event.md](templates/event.md) | `event` | `forest-cream` | An event invitation |
| [webinar.md](templates/webinar.md) | `webinar` | `forest-cream` | An online session with speaker photos, roles, experience, and an agenda |

Any type can use any of the three themes:

- `classic` — light background with your brand color; the default.
- `navy-gold` — navy background with gold accents.
- `forest-cream` — forest background with cream text and gold accents.

Choose the theme in frontmatter or override it for one run:

```bash
mdmailer templates/meeting.md --theme classic
mdmailer templates/ --config path/to/config.json
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
| `joinUrl` | Meeting or registration link, displayed with a short localized label instead of the raw URL |
| `hosts` | Names or objects with `name`, optional `role`, `bio`, and `photo` |
| `agenda` | Markdown text, a list of strings, or a list of `{ time, title }` objects |

The webinar starter demonstrates rich speaker introductions using `name`, `role` (job title), `bio` (experience), and `photo`. `mdmailer init` copies its two sample photos into `assets/images/hosts/`. Replace them and the example biographies with your speakers’ details. The news starter demonstrates text formatting, lists, tables, quotations, and code blocks; the webinar adds a learning-outcomes table and preparation checklist.

Date and time appear inside the details box with location and the join link. Missing details are omitted. Meetings show hosts in a separate section; events and webinars do so when host profiles include photos, roles, or bios.

Older files should change `release-notes` and `digest` to `news`, `announcement` to `notification`, and `workshop` to `meeting`. The old type names are no longer accepted.

## Branding and images

Edit your selected local or global JSON configuration:

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

Transparent logos remain transparent on every theme; no white backing plate is added. Use a light-colored logo for a dark theme when needed.

Optional settings include `organization.logoUrlOnDark` for dark themes, and `theme.fontFamily`, `contentWidth`, `social` (`{ label, url }` entries), `address`, and `unsubscribeUrl`.

Use local paths or hosted HTTPS URLs for logos, Markdown images, and host photos. Local images are embedded in both outputs; HTML uses data URLs and EML uses inline attachments. Local SVGs are converted to PNG. Logo paths resolve from the configuration file’s folder. Markdown image and host-photo paths resolve from the current working directory.

For custom theme colors, use an object instead of a preset name:

```yaml
theme:
  preset: navy-gold
  colors:
    accent: "#FFE099"
```

Supported color keys are `background`, `foreground`, `mutedForeground`, `accent`, `surface`, and `border`. Quote six-digit hex values. Dark themes enforce WCAG AA text contrast. `--theme` changes the preset while retaining frontmatter color overrides.

## Development

For source checkout setup, run `npm ci`, `npm run build`, and optionally `npm link`.

```bash
npm run generate -- templates/   # Run from source without linking
npm run email:dev              # Live template previews
npm run typecheck
npm test
npm run build
```

The linked `mdmailer` command uses `dist/cli.js`; rebuild after changing source code. The optional `output/` folder and personal drafts are gitignored; files generated elsewhere follow your own ignore rules; the five starter files are tracked.

`npm pack` builds the CLI and includes only the CLI bundle, five starters, SKILL.md, README, license, and package metadata. Only the two sample speaker photos are bundled as assets; personal branding, other assets, drafts, and generated emails are excluded.
