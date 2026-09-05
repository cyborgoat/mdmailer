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
```

The `--template` flag takes precedence over frontmatter `type`. With neither, the template is `regular`.

## Initialize a new workspace

Run:

```bash
npm run init
```

This creates missing config, asset, and example files without overwriting existing ones. Do not run `init` merely to generate an existing email.

## Common frontmatter

```yaml
---
title: "September Update"
date: 2026-09-15
type: regular
lang: en
---
```

- `title` is the email title and subject.
- `date` is displayed by layouts that use a dateline.
- `type` selects the layout.
- `lang` accepts `en` or `zh`; aliases are `locale` and `language`.
- Template chrome is localized. Titles, body content, tagline, and footer remain author-written.

The body supports normal Markdown, including headings, emphasis, links, lists, task lists, tables, blockquotes, code, and images.

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
- Rich host objects render through the shared host-introduction component. Workshop hosts always use the dedicated host section.
- `agenda` accepts Markdown, strings, or `{ time, title }` objects.
- Templates do not render buttons. Add links directly to the Markdown body.

### Announcement

Use `headline` and optional `banner`/`bannerText`/`kicker`. Add calls to action as ordinary Markdown links so the author controls their text and placement.

### Minimal

Use for short notes. It renders the shared centered brand header, title, optional dateline, Markdown body, and compact copyright footer.

## Branding

Configure branding in `mdmailer.config.json`:

- `organization.name`: brand name and image alt text.
- `organization.logoUrl`: hosted HTTPS URL or local path.
- `theme.primaryColor`: headings and accents.
- `theme.footerText`: copyright text; `{{organization}}` expands to the organization name.
- `theme.tagline`: footer department tagline.
- `theme.fontFamily`: use an Outlook-compatible web-safe font stack.
- `theme.social`, `theme.address`, and `theme.unsubscribeUrl`: optional rich-footer fields.

All layouts use the shared `src/emails/components/Header.tsx`. Keep logo dimensions and centering in that component rather than adding per-template overrides. Host introductions use `src/emails/components/HostsSection.tsx`; change that shared component rather than duplicating host markup.

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
