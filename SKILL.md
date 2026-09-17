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

## CLI setup

If `mdmailer` is not available, build and link it from the repository:

```bash
npm run build
npm link
```

The linked command runs `dist/cli.js`; rebuild after source changes before using it. To generate from source without linking or rebuilding, use `npm run generate -- content/<name>.md` or `npm run generate -- content/` from the repository root.

Run `mdmailer` or `mdmailer --help` for usage. The legacy `mdmailer generate --input <file.md>` syntax remains supported, but prefer positional file or folder inputs in new instructions.

## Standard workflow

1. Read `mdmailer.config.json` and the relevant file under `content/`.
2. Choose a template from `news`, `release-notes`, `digest`, `announcement`, `event`, `workshop`, or `webinar`.
3. Edit or create the Markdown input. Keep author-written body text in the requested language.
4. Put reusable local images under `assets/` and reference them with repository-relative paths.
5. Generate the email:

   ```bash
   mdmailer content/<name>.md
   ```

6. Verify both `output/<name>.html` and `output/<name>.eml` exist.
7. Run `npm run typecheck` after source changes and `npm run build` when template or CLI code changes.

Use a non-default config or override the frontmatter theme when needed:

```bash
mdmailer content/<name>.md --config path/to/config.json
mdmailer content/<name>.md --theme navy-gold
```

There is no template or language CLI override. Every Markdown input must declare `type` and `lang` in frontmatter.

## Initialize a new workspace

Run:

```bash
mdmailer init
```

This creates missing config, asset, and example files without overwriting existing ones. Do not run `init` merely to generate an existing email.

## Authoring rules

Read the README's frontmatter and relevant email-type sections before creating or changing content. The invariants that must not be missed are:

- Frontmatter is YAML at the start of the Markdown file. `type` and `lang` are required; neither has a CLI override or implicit default.
- Valid types are `news`, `release-notes`, `digest`, `announcement`, `event`, `workshop`, and `webinar`.
- Supported languages are English (`en`) and Simplified Chinese (`zh`). Compatibility aliases are documented in README, but use canonical `lang` values in new files.
- Language affects generated category labels, template labels, and defaults only. Keep titles, body, hosts, tagline, and footer in the user's requested language; mdmailer does not translate them.
- `theme` is optional and defaults to `classic`. The other presets are `navy-gold` and `forest-cream`; `--theme` may override only the preset for one run.
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
npm run typecheck
npm run build
mdmailer content/<name>.md
```

To regenerate all Markdown examples in `content/`:

```bash
mdmailer content/
```

Folder generation includes all immediate `.md` files, including local untracked examples, in filename order; it does not recurse into subfolders. It stops on the first error and leaves already generated files in place. Empty folders and missing paths report errors. Options such as `--theme` and `--config` apply to every input in the run.

Outputs are written to `output/` relative to the current directory, replacing files with matching names. The folder is gitignored. EML bytes can differ between runs because MIME boundaries and content IDs use random UUIDs; inspect rendered content and attachments rather than treating those identifier changes as regressions.

## Safety and boundaries

- Do not claim the app sent an email. It only generates files.
- Do not open an EML file or launch a mail client unless the user explicitly asks.
- Do not invent local image paths; confirm the asset exists before generation.
- Do not remove unrelated files or overwrite user content while regenerating examples.
- Prefer the existing templates and shared components over adding one-off markup.
