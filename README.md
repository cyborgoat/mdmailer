# mdmailer

Turn a Markdown file into a branded HTML email, an EML file, and a PNG card with QR codes. Preview the HTML, then open the EML in your mail client to add recipients and send. mdmailer does not send email itself.

Requires **Node.js 24 or later**.

## Quick start

```bash
npm install @goatcheese/mdmailer
npx mdmailer init
```

`init` asks for a project name and a default theme, then creates a project folder with a config file, a placeholder logo, and example emails. Then write a Markdown file and generate:

```bash
cd <project-name>
npx mdmailer my-email.md --output emails
```

For a global command, use `npm install -g @goatcheese/mdmailer` and run `mdmailer` directly.

## Generate

```bash
mdmailer my-email.md --output emails                 # one file
mdmailer drafts/ --output emails                     # every .md file in a folder
mdmailer my-email.md --output emails --format html   # only some formats
mdmailer my-email.md --output emails --theme navy-gold
mdmailer my-email.md --output emails --config path/to/config.json
```

- `--output <folder>` is required. Missing folders are created; use `--output .` for the current directory.
- Each email produces `<name>.html`, `<name>.eml`, and `<name>.png`. Use `--format` with any comma-separated mix of `html`, `eml`, and `png` to write only those; other existing files are left alone.
- Folder mode reads the folder's `.md` files in filename order, skips subfolders, and stops at the first error.
- Run `mdmailer --help` for all options.

All three outputs share one layout. Links keep their labels with small numbered references, and a labeled QR code for each unique link, email address, or phone number appears above the footer. The PNG is the full email at twice the width, with no cropping.

### Browser

Layout and PNG rendering use Puppeteer's Chrome, which is installed with the package. If it is missing, mdmailer uses an installed Chrome/Chromium or downloads one on first use (needs internet). To use your own Chrome, set `PUPPETEER_EXECUTABLE_PATH`. Hosted images must be reachable while generating.

## Write an email

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
| `lang` | Required: `en` or `zh`. Changes built-in labels only; write your text in the language you want |
| `title` | Email subject and default heading |
| `theme` | `classic`, `navy-gold`, or `forest-cream` |
| `date` | News dateline; fallback for an event's `startsAt` |

**Notifications** also use `headline` (heading) and `banner` (callout text).

**Meetings, events, invitations, and webinars** also use:

| Field | Meaning |
| --- | --- |
| `eventName` | Heading; defaults to `title` |
| `kicker` | Small label above the heading |
| `startsAt` | Event date, e.g. `2026-10-15` |
| `time` | Quoted time, e.g. `"16:00–17:00 UTC"` |
| `location` | Venue or online location |
| `joinUrl` | Meeting or registration link |
| `rsvpUrl` | Invitation reply link (invitations fall back to `joinUrl`) |
| `hosts` | Names, or objects with `name`, and optionally `role`, `bio`, `photo` |
| `agenda` | Markdown text, a list of strings, or a list of `{ time, title }` |

Missing details are simply left out.

## Themes

Any type works with any theme:

- `classic`: light background with your brand color (default)
- `navy-gold`: navy background, gold accents
- `forest-cream`: forest background, cream text, gold accents

Precedence: `--theme` flag, then the file's `theme:`, then `theme.preset` in your config, then `classic`.

## Branding

Branding lives in `mdmailer.config.json`:

```json
{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1A73E8",
    "tagline": "Your tagline",
    "footerText": "© 2026 {{organization}}",
    "preset": "classic"
  }
}
```

`theme.preset` is the default theme for files that don't set one. Optional settings: `organization.logoUrlOnDark` (logo for dark themes), `theme.fontFamily`, `contentWidth`, `social` (`{ label, url }` entries), `address`, and `unsubscribeUrl`.

**Which config is used** (one file, never merged): `--config <file>`, then `mdmailer.config.json` in the current folder, then `~/.mdmailer/mdmailer.config.json`.

**Set branding once for every project:** run `mdmailer init --global`, edit `~/.mdmailer/mdmailer.config.json`, then generate from any folder.

**Images:** use local paths or HTTPS URLs for logos, Markdown images, and host photos. Local images are embedded in the HTML and EML. Logo paths are relative to the config file; Markdown image and host-photo paths are relative to where you run the command.

**Custom colors:** override individual colors in frontmatter. Keys are `background`, `foreground`, `mutedForeground`, `accent`, `surface`, and `border`; quote the hex values.

```yaml
theme:
  preset: navy-gold
  colors:
    accent: "#FFE099"
```

## Use with an LLM agent

`mdmailer init` places a `SKILL.md` in your project. Tell your agent:

> Read `SKILL.md` and use mdmailer to create my email.

Or point at the installed copy: `node_modules/@goatcheese/mdmailer/SKILL.md`. For a global install, find it under `$(npm root -g)/@goatcheese/mdmailer/`.

The package also bundles example emails in `templates/` (one English and one Chinese for each type). They are references for you and your agent, not something you need to copy or edit.

## Development

```bash
npm ci
npm run build
npm run generate -- my-email.md --output emails   # run from source
npm run typecheck
npm test
```

`npm link` makes the `mdmailer` command use your local `dist/cli.js`; rebuild after changing source. The interactive `init` wizard needs a real terminal, so automated tests don't cover it; try it by running `node --import tsx/esm src/cli.ts init` in a terminal.
