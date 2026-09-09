# mdmailer

Turn a Markdown file into a branded email, ready to send manually — no automation, no SMTP involved.

Requires Node.js 24 or later.

## How it works

1. Write your update as Markdown, with required `type` and `lang` frontmatter plus a recommended `title` and relevant dates.
2. Configure your organization's name, logo, typography, and footer once in `mdmailer.config.json`; choose the visual theme in each Markdown file.
3. Run the generator. It renders the email with [react.email](https://react.email/docs/introduction) and writes two files to `output/`:
   - `<name>.html` — open in a browser to preview.
   - `<name>.eml` — open it and your default mail client will pop up a compose window with the formatted email already in the body. Add recipients and hit send.

## Usage

```bash
npm install
npm run init
```

This scaffolds `mdmailer.config.json`, a placeholder logo, and Markdown examples for every email type. Edit the config and an example, then generate:

```bash
npm run generate -- --input content/example.md
```

Generation accepts `--config <file>` to use a non-default config and `--theme <preset>` to override the email's frontmatter theme once. Email type and language must come from frontmatter. See [Themes](#themes) for preset details.

## Writing an email

Every input is a Markdown file with a YAML frontmatter block at the very top. Put metadata between the opening and closing `---`; everything after it is the email body. At minimum, frontmatter must contain `type` and `lang`.

```markdown
---
title: "September Update"
date: 2026-09-15
type: news
lang: en
theme: cobalt-mint
---

# Headline

Your content here, in normal Markdown (headings, lists, tables, task lists, links, bold/italic, etc.).

![Alt text](https://.../photo.jpg)
![Alt text](assets/images/photo.jpg)
```

### Common frontmatter

| Field | Values and behavior |
| --- | --- |
| `title` | Email subject, preview text, and default visible heading. A missing or blank title becomes `Untitled Email` in English or `未命名邮件` in Chinese. Supplying a meaningful title is strongly recommended. |
| `date` | Dateline for `news`, `release-notes`, and `digest`; fallback event date when `startsAt` is absent. `announcement` does not display a date. Use an ISO date such as `2026-09-15` for predictable output. |
| `type` | **Required.** `news`, `release-notes`, `digest`, `announcement`, `event`, `workshop`, or `webinar`. There is no CLI override. See [Email types](#email-types). |
| `lang` | **Required.** `en` for English or `zh` for Simplified Chinese. See [Language](#language). Aliases: `locale`, `language`. |
| `theme` | A preset name or an object containing `preset` and optional semantic `colors`. See [Themes](#themes). |

Unknown frontmatter fields are ignored. Prefer the canonical names above; aliases exist mainly for compatibility.

### Language

mdmailer supports exactly two template languages:

| Language | Recommended value | Also recognized |
| --- | --- | --- |
| English | `en` | `en-US`, `english` |
| Simplified Chinese | `zh` | `zh-CN`, `zh-Hans`, `chinese` |

Language values are case-insensitive. Missing or unrecognized values stop generation with an error. Every email must explicitly use `lang: en` or `lang: zh` (or a recognized alias).

The language setting localizes mdmailer-generated interface text: content category labels, event details, section headings, default kickers and announcement banner, the unsubscribe label, and the untitled fallback. It does **not** translate `title`, Markdown body text, host information, `tagline`, `footerText`, or other author-written values. Write those in the intended language yourself.

### Themes

The recommended form selects one of five built-in presets:

| Preset | Appearance |
| --- | --- |
| `classic` | Light background using the configured primary color for headings and accents. |
| `cobalt-mint` | Cobalt background with mint accents. |
| `navy-gold` | Navy background with gold accents. |
| `forest-cream` | Forest background with cream text and gold accents. |
| `plum-rose` | Plum background with rose accents. |

For example, use `theme: navy-gold`. If `theme` is omitted, mdmailer uses `classic`. For custom colors, use the object form and override only the tokens you need:

```yaml
theme:
  preset: cobalt-mint
  colors:
    background: "#1A4B8C"
    foreground: "#FFFFFF"
    mutedForeground: "#D9E5F2"
    accent: "#A7F3D0"
    surface: "#143B70"
    border: "#6F91BC"
```

Colors must be quoted six-digit hexadecimal values. Contrast themes are validated against WCAG AA's 4.5:1 text contrast requirement; generation stops with an explanation when a combination fails. `classic` uses `theme.primaryColor` from `mdmailer.config.json` as its accent unless frontmatter overrides `accent`.

The `--theme <preset>` CLI option replaces the selected preset for one generation. Existing `colors` overrides in frontmatter are retained and applied over that preset.

When both a canonical field and one of its aliases are present, the canonical field takes precedence. Do not specify both in new content.

### Markdown and images

The body supports headings, emphasis, links, ordered and unordered lists, task lists, tables, blockquotes, inline code, code blocks, and images.

Images work the same way the logo does: a hosted `https://...` URL is left as-is, while a local path (relative to the current directory) is automatically embedded at generation time — no image hosting required. As with the logo, it's a `data:` URI in the `.html` preview and a `cid:`-referenced inline attachment in the `.eml`, since Outlook doesn't render `data:` URIs; on the page itself, images are scaled down with CSS to fit the email width, but not re-encoded, so keep source files reasonably sized.

## Email types

The seven email types use two underlying layout families: content (`news`, `release-notes`, `digest`, `announcement`) and events (`event`, `workshop`, `webinar`). Content types receive a localized category label. Missing or unknown frontmatter types stop generation with an error.

| `type:` | Layout |
| --- | --- |
| `news` | Company, team, or product news with a title, date, and free-form Markdown body. |
| `release-notes` | Versioned product changes organized as additions, improvements, and fixes. |
| `digest` | A recurring roundup of highlights, links, metrics, or updates. |
| `event` / `workshop` / `webinar` | Invitation layout: compact logo bar, a hero with the event name, a details card (Where / Join / Hosts — localized), your Markdown as the description, and an optional agenda. `workshop` and `webinar` preset the eyebrow label. Workshops render hosts in a dedicated section; rich host objects add photos and bios. |
| `announcement` | One high-impact message: a colored callout strip, a headline, and a short Markdown body. Add links directly in Markdown. |

Event and announcement layouts read additional optional fields; missing values simply omit the corresponding section:

**`event` / `workshop` / `webinar`**

| field (aliases) | notes |
| --- | --- |
| `eventName` (`name`) | Hero heading. Falls back to `title`. |
| `kicker` (`eyebrow`) | Small uppercase label above the heading. `workshop` / `webinar` supply a localized default when omitted. |
| `startsAt` (`date`) | The "When" date. |
| `time` | Clock time as a **quoted string**, e.g. `"14:00–15:30 UTC"` — an unquoted `18:00` is parsed as a time and loses its display form. |
| `location` (`venue`) | The "Where" line. |
| `joinUrl` (`onlineUrl`) | Online join link. |
| `hosts` (`speakers`) | A YAML list of names, **or** a list of `{ name, photo, bio, role }` maps. Plain names fill the details card; object hosts (typical for `webinar`) render a photo + intro section instead. Local `photo` paths are embedded like content images. |
| `agenda` | A Markdown string, a list of strings, or a list of `{ time, title }` entries. |

**`announcement`**

| field (aliases) | notes |
| --- | --- |
| `headline` | Main heading. Falls back to `title`. |
| `banner` (`bannerText`, `kicker`) | Text in the colored strip. Default is localized ("Announcement" / "公告"). |
Add links directly in the Markdown body, for example `[Read the full policy](https://example.com/policy)`.

## Configuring branding

Edit `mdmailer.config.json`:

```json
{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "https://.../logo.png",
    "logoUrlOnDark": "https://.../logo-white.png"
  },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}",
    "tagline": "Flowing intelligence across the network.",
    "fontFamily": "\"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, \"PingFang SC\", sans-serif",
    "contentWidth": 680,
    "social": [{ "label": "GitHub", "url": "https://github.com/your-org" }],
    "address": "123 Market Street, Tech City, CA 94102",
    "unsubscribeUrl": "https://.../unsubscribe"
  }
}
```

`social`, `address`, and `unsubscribeUrl` are optional and appear in the shared footer for every layout (`social` renders as plain text links, so it works even where images are blocked). Configs without these keys keep working unchanged.

The global config holds organization-wide branding, typography, width, and footer metadata. Per-email visual selection belongs in Markdown frontmatter; see [Themes](#themes) for presets, custom colors, defaults, and CLI precedence.

`logoUrl` accepts either a hosted `https://...` URL, or a path (relative to the current directory) to a local image file — local logos are automatically embedded at generation time (SVGs are rasterized to PNG first, since most email clients don't render inline SVG), so no image hosting is required. It's embedded differently depending on the output: in the `.html` preview it's a `data:` URI (browsers render those fine), while in the `.eml` it's attached as a proper inline image referenced by `Content-ID`/`cid:` — Outlook doesn't render `data:` URIs in `<img>` tags, so this keeps the logo visible there too.

`logoUrlOnDark` is optional artwork for contrast mode, typically a white or light-stroke logo. It follows the same hosted/local embedding rules as `logoUrl`. When it is omitted, mdmailer keeps the normal logo legible by placing it on a compact white plate; it does not use CSS filters or rewrite third-party artwork.

`fontFamily` is optional and defaults to `"Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, "PingFang SC", sans-serif` — a stack that covers both Latin and Simplified Chinese glyphs. Outlook desktop renders with the Word HTML engine, which only matches web-safe fonts already installed on the system (no `@font-face`/web fonts), so stick to fonts you know your recipients have — the default only uses fonts that ship with Windows and macOS.

`contentWidth` is optional and defaults to `680`, producing a more readable line length while retaining enough room for event details and tables.

`organization.name` and `theme.tagline` form a centered footer brand stack. Optional links and address follow below, with the copyright and unsubscribe text in a separate legal group. The logo remains in the shared centered header rather than repeating in the footer. `theme.footerText` can include the placeholder `{{organization}}`, which is replaced with `organization.name` at generation time.

## Local development

Example Markdown lives under `content/`, matching generated previews under `output/`, and reusable images under `assets/`.

```bash
npm install
npm run generate -- --input content/2026-08-engineering.md
npm run email:dev                                             # react.email live preview server
npm run typecheck
npm run build                                                 # bundles src/cli.ts -> dist/cli.js via tsup
```

`engines.node` is `>=24`, matching `react-email`'s own Node requirement.
