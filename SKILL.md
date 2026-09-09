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

Use a non-default config or override the frontmatter theme when needed:

```bash
npm run generate -- --input content/<name>.md --config path/to/config.json
npm run generate -- --input content/<name>.md --theme navy-gold
```

There is no template or language CLI override. Every Markdown input must declare `type` and `lang` in frontmatter.

## Initialize a new workspace

Run:

```bash
npm run init
```

This creates missing config, asset, and example files without overwriting existing ones. Do not run `init` merely to generate an existing email.

## Authoring rules

Read the README's frontmatter and relevant email-type sections before creating or changing content. The invariants that must not be missed are:

- Frontmatter is YAML at the start of the Markdown file. `type` and `lang` are required; neither has a CLI override or implicit default.
- Valid types are `regular`, `minimal`, `announcement`, `event`, `workshop`, and `webinar`.
- Supported languages are English (`en`) and Simplified Chinese (`zh`). Compatibility aliases are documented in README, but use canonical `lang` values in new files.
- Language affects generated labels and defaults only. Keep titles, body, hosts, tagline, and footer in the user's requested language; mdmailer does not translate them.
- `theme` is optional and defaults to `classic`. The other presets are `cobalt-mint`, `navy-gold`, `forest-cream`, and `plum-rose`; `--theme` may override only the preset for one run.
- Prefer canonical field names, ISO dates, and quoted times and hex colors. Use Markdown links for calls to action.

For event types, consult README for `eventName`, `kicker`, `startsAt`, `time`, `location`, `joinUrl`, `hosts`, and `agenda` shapes. For announcements, consult it for `headline` and `banner`. Use a nearby file under `content/` as the starting example.

## Branding

Organization-wide branding, typography, width, and footer metadata belong in `mdmailer.config.json`; per-email preset and semantic color overrides belong in Markdown frontmatter. Consult README and `src/config-schema.ts` before changing either schema. Contrast themes must pass the enforced WCAG AA checks.

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
