# mdmailer

Turn Markdown into branded HTML and EML emails, plus PNG promotional cards with QR codes. Preview the HTML in a browser, then open the EML in your mail client to add recipients and send. mdmailer does not send email itself.

Requires **Node.js 24 or later**.

## Quick start

Install in your email workspace:

```bash
npm install @cyborgoat/mdmailer
npx mdmailer init
npx mdmailer templates/news.md --output emails
```

For a global CLI, use `npm install -g @cyborgoat/mdmailer`, then run `mdmailer` directly. The examples below use that shorter form.

Edit `mdmailer.config.json` for your branding and a file in `templates/` for your message. Generate all templates with:

```bash
mdmailer templates/ --output emails
```

`--output <folder>` is required; missing folders are created. Use `--output .` to explicitly save to your current directory. By default, all three files are generated: `<name>.html`, `<name>.eml`, and `<name>.png`. Select a subset with `--format html`, `--format eml,png`, or any comma-separated combination of `html`, `eml`, and `png` (leading dots are accepted). Only selected formats are written; existing files of other formats are left untouched. Matching selected files are replaced. Folder generation reads immediate `.md` files in filename order, skips subfolders, and stops on the first error.

```bash
mdmailer templates/news.md --output emails --format eml
mdmailer templates/ --output images --format png
mdmailer templates/news.md --output emails --format html,eml
```

The PNG includes the full email with URLs replaced by QR codes, at twice the configured email width and a height that fits all content. All formats share browser-based layout preparation; selecting HTML or EML alone skips screenshot capture.

Puppeteer is included as a dependency; users do not need to install it separately. It normally downloads Chrome during npm installation. If that browser is missing, mdmailer automatically uses installed Google Chrome (or Chromium on macOS/Linux), or downloads the required Chrome version on first PNG generation. The first download needs internet access and can take a few minutes; later runs reuse the cached browser. No separate browser setup command is normally required.

Explicit Puppeteer download-disable settings are respected. Restricted networks can prevent automatic setup, and minimal Linux/container systems may still require Chrome’s operating-system libraries. Hosted images must be reachable during generation. Browser rendering prepares the shared layout before any files for that email are written; rerun the same command after resolving a reported setup or rendering issue.

To use an existing Chrome installation instead, set `PUPPETEER_EXECUTABLE_PATH` to its executable path.

### Promotional cards

The PNG reuses the rendered email, including all body content, images, tables, agenda, host profiles, and footer. There is no separate summary template, text truncation, or fixed-height crop. No `promotion` frontmatter is needed; earlier promotional-copy overrides no longer apply.

HTML, EML, and PNG share the same full-content layout. HTTP/HTTPS links keep their readable labels with small numbered references. URL-only labels and plain HTTP/HTTPS or `www.` URLs become numbered references. Matching labeled QR codes appear just above the branding footer, once per unique destination, in all three formats. Links and QR captions remain clickable in HTML and EML. Email and telephone links also receive QR codes. QR codes are generated locally with a white quiet zone, and embedded as inline CID attachments in EML. Email-client rendering can vary, but all outputs use the same layout and content.

```bash
mdmailer templates/news.md --output output
mdmailer templates/ --output "/path/to/email exports"
```

Relative output paths resolve from your current working directory; absolute paths work too.

For a new email workspace, run `mdmailer init`. It creates SKILL.md, missing config, a placeholder logo, and twelve starters under `templates/`: one English and one Chinese example for each email type. Existing files are preserved. Templates are starting points; your Markdown files can live in any folder.

## Use with an LLM agent

The npm package includes `SKILL.md`, this README, all twelve English and Chinese starter files in `templates/`, and sample host photos. Run `npx mdmailer init` to copy SKILL.md into your workspace, then tell your agent:

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

| English | Chinese | Type | Theme | Use for |
| --- | --- | --- | --- | --- |
| [news.md](templates/news.md) | [news.zh.md](templates/news.zh.md) | `news` | `classic` | Updates, release notes, and digests |
| [notification.md](templates/notification.md) | [notification.zh.md](templates/notification.zh.md) | `notification` | `classic` | A notice with a banner and headline |
| [meeting.md](templates/meeting.md) | [meeting.zh.md](templates/meeting.zh.md) | `meeting` | `navy-gold` | Meeting details, hosts, and an agenda |
| [event.md](templates/event.md) | [event.zh.md](templates/event.zh.md) | `event` | `forest-cream` | An event invitation |
| [invitation.md](templates/invitation.md) | [invitation.zh.md](templates/invitation.zh.md) | `invitation` | `navy-gold` | A formal invitation with RSVP details |
| [webinar.md](templates/webinar.md) | [webinar.zh.md](templates/webinar.zh.md) | `webinar` | `forest-cream` | An online session with speaker photos, roles, experience, and an agenda |

English examples use `<type>.md`; Chinese examples use `<type>.zh.md`. Set `lang: en` or `lang: zh` in your own file to choose the built-in labels.

Any type can use any of the three themes:

- `classic` — light background with your brand color; the default.
- `navy-gold` — navy background with gold accents.
- `forest-cream` — forest background with cream text and gold accents.

Choose the theme in frontmatter or override it for one run:

```bash
mdmailer templates/meeting.md --output emails --theme classic
mdmailer templates/ --output emails --config path/to/config.json
```

Run `mdmailer --help` for usage. The older `mdmailer generate --input <file.md> --output <folder>` command still works.

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
| `type` | Required: `news`, `notification`, `meeting`, `event`, `invitation`, or `webinar` |
| `lang` | Required: `en` or `zh` (Simplified Chinese) |
| `title` | Email subject and default heading |
| `theme` | `classic`, `navy-gold`, or `forest-cream`; defaults to `classic` |
| `date` | News dateline; also a fallback for an event's `startsAt` |

Language changes built-in labels, not your message. Write titles, body text, and host bios in the intended language. Type and language are set in frontmatter only.

For **notifications**, use `headline` to override the heading and `banner` for the callout text. Notifications do not display a dateline.

For **meetings, events, invitations, and webinars**:

| Field | Meaning |
| --- | --- |
| `eventName` | Heading; defaults to `title` |
| `kicker` | Small label above the heading; meetings and webinars have localized defaults |
| `startsAt` | Event date, such as `2026-10-15` |
| `time` | Quoted time, such as `"16:00–17:00 UTC"` |
| `location` | Venue or online location |
| `joinUrl` | Meeting or registration link, displayed with a short localized label instead of the raw URL |
| `rsvpUrl` | Invitation response link; invitations also accept `joinUrl` as a fallback |
| `hosts` | Names or objects with `name`, optional `role`, `bio`, and `photo` |
| `agenda` | Markdown text, a list of strings, or a list of `{ time, title }` objects |

Every starter with hosts includes sample photos and demonstrates rich introductions using `name`, `role` (job title), `bio` (experience), and `photo`. `mdmailer init` copies the five sample photos into `assets/images/hosts/`. Replace them and the example biographies with your hosts’ details. The news starter demonstrates text formatting, lists, tables, quotations, and code blocks; the webinar adds a learning-outcomes table and preparation checklist.

Date and time appear inside the details box with location and the action link. Invitations show a localized RSVP label and “Respond to invitation” link. Missing details are omitted. Meetings show hosts in a separate section; events, invitations, and webinars do so when host profiles include photos, roles, or bios.

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
npm run generate -- templates/ --output emails   # Run from source without linking
npm run email:dev              # Live template previews
npm run typecheck
npm test
npm run build
```

The linked `mdmailer` command uses `dist/cli.js`; rebuild after changing source code. The optional `output/` folder and personal drafts are gitignored; files generated elsewhere follow your own ignore rules; the twelve starter files are tracked.

`npm pack` builds the CLI and includes only the CLI bundle, twelve English and Chinese starters, SKILL.md, README, license, and package metadata. Only the five sample host photos are bundled as assets; personal branding, other assets, drafts, and generated emails are excluded.
