English | [简体中文](README.zh-CN.md)

# mdmailer

Write newsletters, announcements, and invitations in Markdown. Preview them in a browser, then export HTML, EML, and a PNG card with QR codes. Open the EML in your mail client to add recipients and send.

## Quick start

Use **Node.js 24 or later**. In the folder where you keep your email projects, install the CLI and start the setup wizard:

```sh
npm install @goatcheese/mdmailer
npx mdmailer init
```

Enter “team-mail” and choose a theme. The wizard creates the project folder with a branding config, a placeholder logo, and [English](templates/news.md) and [Chinese](templates/news.zh.md) starter emails. Edit the newsletter text and use `cd team-mail` before running the commands below.

For a global installation, use `npm install -g @goatcheese/mdmailer` and run `mdmailer` directly. In a non-interactive session, `init` creates files in the current directory and skips existing files.

## Live preview

```bash
npx mdmailer preview templates/news.md
npx mdmailer preview templates/news.md --theme navy-gold --port 3001
npx mdmailer preview templates/news.md --config path/to/config.json
```

Open the printed local URL in your browser and keep editing in your usual editor. Each save to the Markdown file or branding config updates the email automatically, including embedded images and QR codes. Use **Desktop** and **Mobile** to check the layout. Invalid frontmatter or config shows an error while keeping the last successful preview; fix it and save to recover. Updates render serially and may take a few seconds when images need loading.

Preview accepts one file. Run the export command when you’re ready to save the output. It listens only on `127.0.0.1` (port 3000 by default; use `--port 0` for a free port). Stop with Ctrl+C. Changes to image files alone require restarting preview. When ready, generate your HTML/EML/PNG files with the normal command. Browser rendering approximates email layout; individual mail clients may differ.

## Export and send

```sh
npx mdmailer templates/news.md --output emails
```

In `emails/`, open **news.html** for browser review, **news.eml** to send from your mail client, or **news.png** to share as an image.

```sh
npx mdmailer templates/ --output emails
npx mdmailer templates/news.md --output emails --format html,eml
npx mdmailer templates/news.md --output emails --theme navy-gold
```

- `--output <folder>` is required. Missing folders are created; use `--output .` for the current directory.
- Each email produces `<name>.html`, `<name>.eml`, and `<name>.png`. Use `--format` with any comma-separated mix of `html`, `eml`, and `png` to write only those; other existing files are left alone.
- Folder mode reads the folder's `.md` files in filename order, skips subfolders, and stops at the first error.
- Run `npx mdmailer --help` for all options.

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

## Configuration

### Themes

Any type works with any theme:

- `classic`: light background with your brand color (default)
- `navy-gold`: navy background, gold accents
- `forest-cream`: forest background, cream text, gold accents

mdmailer checks `--theme` first, then the draft’s `theme`, then the config’s `theme.preset`, then `classic`. Remove the starter’s `theme` field to use your project default.

### Branding

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

mdmailer uses the first available config in this order. Pass `--config <file>` to select a file explicitly, or keep `mdmailer.config.json` in the current folder. The fallback is `~/.mdmailer/mdmailer.config.json`.

**Set branding once for every project:** run `npx mdmailer init --global`, edit `~/.mdmailer/mdmailer.config.json`, then generate from any folder.

**Images:** use local paths or HTTPS URLs for logos, Markdown images, and host photos. Local images are embedded in the HTML and EML. Logo paths are relative to the config file; Markdown image and host-photo paths are relative to where you run the command.

**Custom colors:** override individual colors in frontmatter. Keys are `background`, `foreground`, `mutedForeground`, `accent`, `surface`, and `border`; quote the hex values.

```yaml
theme:
  preset: navy-gold
  colors:
    accent: "#FFE099"
```

## Use with an agent

Install the [mdmailer skill](https://github.com/cyborgoat/mdmailer/blob/main/SKILL.md) from the folder where you want to work on emails:

```sh
npx skills add cyborgoat/mdmailer --skill mdmailer
```

Describe the email and the outputs you want. The skill can fetch the CLI and set up a fresh workspace. If you already ran `init`, you can ask your agent to read the `SKILL.md` it copied into your email project.

## Development

Use the repository’s workspace commands for building and testing the CLI. See the development section in the [repository guide](https://github.com/cyborgoat/mdmailer#development).

## License

[MIT](LICENSE)
