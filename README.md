# mdmailer

Turn a Markdown file into a branded email, ready to send manually — no automation, no SMTP involved.

Requires Node.js 24 or later.

## How it works

1. Write your update as Markdown, with frontmatter for `title` and `date`.
2. Configure your organization's name, logo, theme, and slogan once in `mdmailer.config.json` — it's applied to every email you generate.
3. Run the generator. It renders the email with [react.email](https://react.email/docs/introduction) and writes two files to `output/`:
   - `<name>.html` — open in a browser to preview.
   - `<name>.eml` — open it and your default mail client will pop up a compose window with the formatted email already in the body. Add recipients and hit send.

## Usage

```bash
npm install
npm run init
```

This scaffolds `mdmailer.config.json`, a placeholder `assets/logo.svg`, and a set of `content/example*.md` files — `example.md` demonstrates the full range of supported Markdown (headings, emphasis, lists, task lists, tables, blockquotes, code blocks, and more), and `example-workshop.md` / `example-webinar.md` / `example-announcement.md` / `example-minimal.md` show the other layouts (see [Email types](#email-types)). Edit the config and a content file, then generate:

```bash
npm run generate -- --input content/example.md
```

Optional `--config` flag to point at a different config file (defaults to `mdmailer.config.json`).

## Writing an update

```markdown
---
title: "September Update"
date: 2026-09-15
---

# Headline

Your content here, in normal Markdown (headings, lists, tables, task lists, links, bold/italic, etc.).

![Alt text](https://.../photo.jpg)
![Alt text](assets/images/photo.jpg)
```

Images work the same way the logo does: a hosted `https://...` URL is left as-is, while a local path (relative to the current directory) is automatically embedded at generation time — no image hosting required. As with the logo, it's a `data:` URI in the `.html` preview and a `cid:`-referenced inline attachment in the `.eml`, since Outlook doesn't render `data:` URIs; on the page itself, images are scaled down with CSS to fit the email width, but not re-encoded, so keep source files reasonably sized.

## Email types

The same branding and the same Markdown pipeline can render several layouts. Pick one with a `type:` line in the frontmatter, or with `--template <name>` on the command line (the flag wins if both are set). With neither, you get `regular`.

```bash
npm run generate -- --input content/invite.md --template workshop
```

| `type:` | Layout |
| --- | --- |
| `regular` (default) | Title, dateline, Markdown body, branded header and footer — the original layout. |
| `event` / `workshop` / `webinar` | Invitation layout: compact logo bar, a hero with the event name, a "When / Where / Join / Hosts" details card, a prominent register button, your Markdown as the description, and an optional agenda. `workshop` and `webinar` are `event` with the eyebrow label preset to "Workshop" or "Webinar". |
| `announcement` | One high-impact message: a colored callout strip, a headline, a short Markdown body, and a single call-to-action button. |
| `minimal` | Text-forward: no logo band, just a title, dateline, Markdown body, and a one-line footer. For short notes. |

`type:` is a reserved frontmatter key. Beyond `title` and `date`, each layout reads a few optional fields — anything missing just drops its section:

**`event` / `workshop` / `webinar`**

| field (aliases) | notes |
| --- | --- |
| `eventName` (`name`) | Hero heading. Falls back to `title`. |
| `kicker` (`eyebrow`) | Small uppercase label above the heading. `workshop` defaults to "Workshop"; `webinar` defaults to "Webinar". |
| `startsAt` (`date`) | The "When" date. |
| `time` | Clock time as a **quoted string**, e.g. `"14:00–15:30 UTC"` — an unquoted `18:00` is parsed as a time and loses its display form. |
| `location` (`venue`) | The "Where" line. |
| `joinUrl` (`onlineUrl`) | Online join link. |
| `hosts` (`speakers`) | A YAML list (or a single value). |
| `registerUrl` (`rsvpUrl`) | Button target. No URL, no button. |
| `registerLabel` | Button text. Default "Register". |
| `agenda` | A Markdown string, a list of strings, or a list of `{ time, title }` entries. |

**`announcement`**

| field (aliases) | notes |
| --- | --- |
| `headline` | Main heading. Falls back to `title`. |
| `banner` (`bannerText`, `kicker`) | Text in the colored strip. Default "Announcement". |
| `ctaUrl` (`url`) | Button target. No URL, no button. |
| `ctaLabel` | Button text. Default "Learn more". |

## Configuring branding

Edit `mdmailer.config.json`:

```json
{
  "organization": { "name": "Your Organization", "logoUrl": "https://.../logo.png" },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}",
    "slogan": "Flowing intelligence across the network",
    "fontFamily": "\"Helvetica Neue\", Helvetica, Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
    "accentColor": "#1a73e8",
    "social": [{ "label": "GitHub", "url": "https://github.com/your-org" }],
    "address": "123 Market Street, Tech City, CA 94102",
    "unsubscribeUrl": "https://.../unsubscribe"
  }
}
```

`accentColor`, `social`, `address`, and `unsubscribeUrl` are all optional and only used by the `event`/`workshop`/`webinar` and `announcement` layouts — `accentColor` is the call-to-action button colour (falls back to `primaryColor`), and the other three fill in the richer event footer (`social` renders as plain text links, so it works even where images are blocked). Configs without these keys keep working unchanged.

`logoUrl` accepts either a hosted `https://...` URL, or a path (relative to the current directory) to a local image file — local logos are automatically embedded at generation time (SVGs are rasterized to PNG first, since most email clients don't render inline SVG), so no image hosting is required. It's embedded differently depending on the output: in the `.html` preview it's a `data:` URI (browsers render those fine), while in the `.eml` it's attached as a proper inline image referenced by `Content-ID`/`cid:` — Outlook doesn't render `data:` URIs in `<img>` tags, so this keeps the logo visible there too.

`fontFamily` is optional and defaults to `"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif` — a stack that covers both Latin and Simplified Chinese glyphs. Outlook desktop renders with the Word HTML engine, which only matches web-safe fonts already installed on the system (no `@font-face`/web fonts), so stick to fonts you know your recipients have — the default only uses fonts that ship with Windows and macOS.

`organization.name`, a small version of `organization.logoUrl`, and `theme.slogan` are rendered together in the email's footer, below the body content — a small logo beside the bold org name, with the slogan in a smaller, italic serif underneath it. `theme.footerText` can include the placeholder `{{organization}}`, which is replaced with `organization.name` at generation time, so your copyright line always stays in sync with the configured org name.

## Local development

Example content lives under `content/` (`2026-08-engineering.md`, `2026-06-monthly-digest.md`, `2026-06-monthly-digest-zh.md`, `2026-05-product-launch.md`, `2026-03-release-notes.md`, `2026-01-quarterly-review.md`, `2026-09-devtools-workshop.md`, `2026-09-policy-announcement.md`, `2026-09-quick-note.md`, and `2026-10-platform-webinar.md`). Matching generated `.html` / `.eml` previews for those examples are tracked under `output/`. Logo and image assets are under `assets/` — see `.gitignore` if you want to keep extra local files untracked.

```bash
npm install
npm run generate -- --input content/2026-08-engineering.md
npm run email:dev                                             # react.email live preview server
npm run typecheck
npm run build                                                 # bundles src/cli.ts -> dist/cli.js via tsup
```

`engines.node` is `>=24`, matching `react-email`'s own Node requirement.
