---
name: mdmailer
description: Create, configure, generate, and validate branded HTML and EML emails with mdmailer. Use for email content, branding, templates, images, and generation troubleshooting in this repository.
---

# mdmailer

Generate email files from Markdown; the app does not send email. Read [README.md](README.md) for fields and configuration.

## Workflow

1. Run from the repository root with Node.js 24 or later. Use `npm ci` if dependencies are missing.
2. Read `mdmailer.config.json` and choose a starter from `content/`:

   | Starter | Type | Theme |
   | --- | --- | --- |
   | `news.md` | `news` | `classic` |
   | `notification.md` | `notification` | `classic` |
   | `meeting.md` | `meeting` | `navy-gold` |
   | `event.md` | `event` | `forest-cream` |
   | `webinar.md` | `webinar` | `forest-cream` |

3. Edit the requested file or copy a starter for a new message. Preserve unrelated user content.
4. Generate and check both HTML and EML outputs:

   ```bash
   mdmailer content/news.md
   mdmailer content/              # All immediate Markdown files
   ```

If the CLI is unavailable, use `npm run generate -- content/news.md` directly from source. To set up the short command, run `npm run build` and `npm link`. Rebuild after source changes before using the linked command.

`mdmailer init` creates missing config, assets, and the same five starters without overwriting existing files. Use it for new workspaces, not ordinary regeneration.

## Authoring

- Require `type` and `lang` in YAML frontmatter. Valid types are `news`, `notification`, `meeting`, `event`, and `webinar`; languages are `en` and `zh`.
- Use only `classic`, `navy-gold`, or `forest-cream`. Any type can use any theme; omitted themes default to `classic`.
- Keep author-written text in the requested language. Localization changes built-in labels only.
- Quote clock times and hex colors. Prefer ISO dates and the canonical field names in README.
- Notifications use `headline` and `banner`. Meetings, events, and webinars use `startsAt`, `time`, `location`, `joinUrl`, `hosts`, and `agenda`. Date and time belong inside the details box.
- Migrate legacy types when encountered: `release-notes` / `digest` → `news`, `announcement` → `notification`, `workshop` → `meeting`.

Branding belongs in `mdmailer.config.json`; per-email theme selection belongs in frontmatter. Overrides are available with `--theme <preset>` and `--config <file>`. There are no type or language CLI overrides.

Local assets resolve from the current directory. Confirm files exist before referencing them. Local images use data URLs in HTML and CID attachments in EML; hosted HTTPS images stay remote. Do not open EML files or launch a mail client unless asked.

## Maintenance and verification

- Keep `content/`, `mdmailer init`, README, and this skill synchronized when types or themes change. Update the explicit starter list in `.gitignore` if filenames change.
- Shared layout changes belong in `EmailShell` and its components. `ContentEmail` handles news and notifications; `EventEmail` handles meetings, events, and webinars.
- After source changes, run `npm run typecheck`, relevant tests, and `npm run build`. Regenerate affected examples and inspect the output.
- Folder generation processes immediate `.md` files in filename order and stops on the first error. Already generated files remain in place.
- Outputs are written to gitignored `output/`, replacing matching filenames. Random MIME boundaries and image IDs make EML bytes differ between runs; verify rendered content and attachments.
