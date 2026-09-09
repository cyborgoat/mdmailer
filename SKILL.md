---
name: mdmailer
description: Create, configure, generate, preview, and validate branded HTML and EML emails from Markdown using this repository. Use when asked to write an email, newsletter, event invitation, workshop, webinar, announcement, or short note with mdmailer; update branding; add local images or host profiles; regenerate examples; or troubleshoot mdmailer output.
---

# mdmailer

Use this project to turn Markdown with YAML frontmatter into a browser-previewable HTML email and a manually sendable EML file. The app does not send email and has no SMTP integration.

## Requirements

- Run commands from the repository root.
- Use Node.js 24 or later.
- Install locked dependencies with `npm ci` when `node_modules/` is absent.
- Preserve existing user changes in a dirty worktree.

## Standard workflow

1. Read `mdmailer.config.json` and the relevant file under `content/`.
2. Choose a template from `regular`, `event`, `workshop`, `webinar`, `announcement`, or `minimal`.
3. Edit or create the Markdown input. Keep author-written body text in the requested language.
4. Put reusable local images under `assets/` and reference them with repository-relative paths.
5. Generate the email:

   ```bash
   npm run generate -- --input content/<name>.md
   ```

6. Verify both `output/<name>.html` and `output/<name>.eml` exist.
7. Run `npm run typecheck` after source changes and `npm run build` when template or CLI code changes.

Use a non-default config or override the frontmatter template when needed:

```bash
npm run generate -- --input content/<name>.md --config path/to/config.json
npm run generate -- --input content/<name>.md --template workshop
npm run generate -- --input content/<name>.md --theme navy-gold
```

The `--template` flag takes precedence over frontmatter `type`. With neither, the template is `regular`.

## Initialize a new workspace

Run:

```bash
npm run init
```

This creates missing config, asset, and example files without overwriting existing ones. Do not run `init` merely to generate an existing email.

## Common frontmatter

Frontmatter is YAML between `---` delimiters at the start of the Markdown file. Everything after the closing delimiter is the rendered Markdown body.

```yaml
---
title: "September Update"
date: 2026-09-15
type: regular
lang: en
theme: cobalt-mint
---
```

- `title` supplies the email subject, preview text, and default heading. If it is absent, mdmailer uses a localized untitled fallback; normally provide it explicitly.
- `date` is the dateline for `regular` and `minimal`, and the fallback for an event without `startsAt`. Announcements do not display it. Prefer `YYYY-MM-DD`.
- `type` selects `regular`, `minimal`, `announcement`, `event`, `workshop`, or `webinar`; it defaults to `regular`.
- `lang` selects the generated template language. mdmailer supports exactly English (`en`) and Simplified Chinese (`zh`). Aliases are `locale` and `language`; accepted compatibility values include `en-US`, `english`, `zh-CN`, `zh-Hans`, and `chinese`. Missing or unknown values fall back to English.
- Language localizes only mdmailer-generated labels and defaults: event details, section headings, workshop/webinar kickers, announcement banner, unsubscribe text, and untitled fallback. Never imply that it translates titles, Markdown, hosts, tagline, footer, or other author-written content.
- `theme` selects `classic`, `cobalt-mint`, `navy-gold`, `forest-cream`, or `plum-rose`. It defaults to `classic` and may instead be an object with `preset` plus optional `colors` overrides.
- Supported color keys are `background`, `foreground`, `mutedForeground`, `accent`, `surface`, and `border`. Values must be quoted six-digit hex colors. Contrast presets must pass the enforced WCAG AA 4.5:1 checks.
- Unknown frontmatter keys are ignored. Prefer canonical field names over aliases when writing new content.

Use the object form only when a preset needs per-email color changes:

```yaml
theme:
  preset: forest-cream
  colors:
    accent: "#FFD166"
    surface: "#0F3028"
```

The body supports normal Markdown, including headings, emphasis, links, lists, task lists, tables, blockquotes, code, and images.

Precedence is deterministic:

- Template: CLI `--template` → frontmatter `type` → `regular`.
- Theme: CLI `--theme` → frontmatter theme preset → `classic`. A CLI preset override retains any frontmatter `colors` overrides.
- Language: `lang` → `locale` → `language` → English. There is no language CLI option.

## Template fields

### Regular

Use for newsletters, engineering updates, digests, launches, release notes, and reviews. It needs only the common fields and Markdown body.

### Event, workshop, and webinar

```yaml
---
title: "You're invited: Reliable APIs"
type: workshop
eventName: "Reliable APIs"
startsAt: 2026-10-15
time: "16:00-17:00 UTC"
location: "Room 4B or Zoom"
joinUrl: "https://example.com/meeting"
hosts:
  - name: Alex Rivera
    role: Developer Experience Lead
    photo: assets/images/hosts/alex-rivera.jpg
    bio: Builds developer tooling and integration workflows.
agenda:
  - time: "16:00"
    title: "Introduction"
---
```

- `eventName` aliases `name` and falls back to `title`.
- `kicker` aliases `eyebrow`; workshop and webinar provide localized defaults.
- `startsAt` falls back to `date`.
- Quote `time` so YAML preserves its display form.
- `location` aliases `venue`; `joinUrl` aliases `onlineUrl`.
- `hosts` aliases `speakers` and accepts names or `{ name, photo, bio, role }` objects.
- Within host objects, compatibility aliases are `host`/`speaker` for `name`, `image`/`avatar` for `photo`, `intro`/`about` for `bio`, and `title` for `role`. Prefer the canonical keys in new files.
- Rich host objects render through the shared host-introduction component. Workshop hosts always use the dedicated host section.
- `agenda` accepts a YAML multiline Markdown string, a list of strings, or `{ time, title }` objects. Quote agenda and event times.
- Templates do not render buttons. Add links directly to the Markdown body.

### Announcement

Use `headline` and optional `banner`/`bannerText`/`kicker`. Add calls to action as ordinary Markdown links so the author controls their text and placement.

### Minimal

Use for short notes. It renders the shared centered brand header, a compact title, optional dateline, Markdown body, and shared branded footer.

## Branding

Configure branding in `mdmailer.config.json`:

- `organization.name`: brand name and image alt text.
- `organization.logoUrl`: hosted HTTPS URL or local path.
- `organization.logoUrlOnDark`: optional light/white logo selected by contrast themes; without it the normal logo receives a white fallback plate.
- `theme.primaryColor`: headings and accents.
- `theme.footerText`: copyright text; `{{organization}}` expands to the organization name.
- `theme.tagline`: footer department tagline.
- `theme.fontFamily`: use an Outlook-compatible web-safe font stack.
- `theme.contentWidth`: positive pixel width shared by all layouts; defaults to `680`.
- `theme.social`, `theme.address`, and `theme.unsubscribeUrl`: optional rich-footer fields.

Visual theme presets and optional semantic `colors` overrides belong in Markdown frontmatter, not `mdmailer.config.json`. The `--theme` CLI flag overrides the frontmatter preset for one generation. Contrast text pairs must meet WCAG AA (4.5:1) or generation fails.

All layouts use the shared `EmailShell`, header, and footer components. Content types share `ContentEmail`; event types share `EventEmail`. Keep shared chrome and logo behavior in those components rather than adding per-type overrides. Host introductions use `HostsSection`; change that shared component rather than duplicating host markup.

## Images

- Hosted `https://` images remain remote.
- Local paths resolve from the current working directory.
- HTML previews embed local images as data URIs.
- EML output attaches local images inline and replaces their sources with `cid:` references for Outlook compatibility.
- Keep source images reasonably sized; body images are styled to fit but are not re-encoded.
- Host photos are resized during embedding.

## Verification

For one input, confirm generation and inspect relevant content:

```bash
npm run generate -- --input content/<name>.md
npm run typecheck
npm run build
```

To regenerate every tracked example:

```bash
for input in content/*.md; do
  npm run generate -- --input "$input" || exit 1
done
```

Expect tracked EML files to change on every generation because MIME boundaries and content IDs use random UUIDs. Treat those identifier-only diffs as normal; investigate changes to rendered text, markup, attachments, or layout separately.

## Safety and boundaries

- Do not claim the app sent an email. It only generates files.
- Do not open an EML file or launch a mail client unless the user explicitly asks.
- Do not invent local image paths; confirm the asset exists before generation.
- Do not remove unrelated files or overwrite user content while regenerating examples.
- Prefer the existing templates and shared components over adding one-off markup.
