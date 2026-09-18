---
name: mdmailer
description: Create, configure, generate, and validate branded HTML and EML emails with mdmailer. Use for email content, branding, templates, images, and generation troubleshooting with the installed npm package or source repository.
---

# mdmailer

Generate email files from Markdown; the app does not send email. For full field documentation, read README.md in the installed package: `node_modules/@cyborgoat/mdmailer/README.md` for local installs, or `<npm root -g>/@cyborgoat/mdmailer/README.md` for global installs. In the source repository, use its README.md.

## Workflow

1. Use Node.js 24 or later and run from the user's email workspace, not the installed package directory. For a local npm installation, use `npx --no-install mdmailer`; for a global installation, use `mdmailer`. Do not build or modify the installed package.
2. Read the selected config (`--config`, working-directory `mdmailer.config.json`, then `~/.mdmailer/mdmailer.config.json`). Choose a starter from workspace `templates/` or the installed package’s `templates/` folder:

   | Starter | Type | Theme |
   | --- | --- | --- |
   | `news.md` | `news` | `classic` |
   | `notification.md` | `notification` | `classic` |
   | `meeting.md` | `meeting` | `navy-gold` |
   | `event.md` | `event` | `forest-cream` |
   | `invitation.md` | `invitation` | `navy-gold` |
   | `webinar.md` | `webinar` | `forest-cream` |

3. Copy a bundled starter into the user’s workspace before editing it. When the starter has hosts, also copy its bundled `assets/images/hosts/` photos into the same relative workspace paths (or use real host photos). Alternatively, `init` copies the required example assets. Edit the requested existing Markdown file when one is provided. Never write drafts or branding into `node_modules` or the installed package directory. Preserve unrelated user content.
4. Generate and check both HTML and EML outputs:

   ```bash
   npx --no-install mdmailer my-email.md
   npx --no-install mdmailer ./drafts --output ./emails
   ```

If not installed, the user can install it with `npm install @cyborgoat/mdmailer` in their workspace, or `npm install -g @cyborgoat/mdmailer` for a global command. The README and templates referenced here are bundled with the package; locate them in the installed package, even when this skill was copied into a workspace or `~/.mdmailer/`.

`npx --no-install mdmailer init` creates a workspace SKILL.md, local config, assets, and six workspace starters without overwriting files. `npx --no-install mdmailer init --global` creates SKILL.md, branding config, and a placeholder logo under `~/.mdmailer/`. If a usable config already exists, skip initialization and copy just the starter you need.

## Authoring

- Require `type` and `lang` in YAML frontmatter. Valid types are `news`, `notification`, `meeting`, `event`, `invitation`, and `webinar`; languages are `en` and `zh`.
- Use only `classic`, `navy-gold`, or `forest-cream`. Any type can use any theme; omitted themes default to `classic`.
- Keep author-written text in the requested language. Localization changes built-in labels only.
- Quote clock times and hex colors. Prefer ISO dates and the canonical field names in README.
- For rich host or speaker introductions, use `name`, `role` for the job title, `bio` for experience, and `photo` for the avatar. Treat bundled profiles as examples, not facts about the user’s hosts.
- Notifications use `headline` and `banner`. Meetings, events, invitations, and webinars use `startsAt`, `time`, `location`, `hosts`, and `agenda`. Use `rsvpUrl` for invitations and `joinUrl` for the other event types. Date and time belong inside the details box.
- Migrate legacy types when encountered: `release-notes` / `digest` → `news`, `announcement` → `notification`, `workshop` → `meeting`.

Branding belongs in the selected JSON config (one complete file, no merging); per-email theme selection belongs in frontmatter. Overrides are available with `--theme <preset>` and `--config <file>`. There are no type or language CLI overrides.

Logo paths resolve relative to the selected JSON file; Markdown images and host photos resolve from the current directory. Confirm files exist before referencing them. Local images use data URLs in HTML and CID attachments in EML; hosted HTTPS images stay remote. Do not open EML files or launch a mail client unless asked.

## Verification

- Generate the requested email and confirm both HTML and EML exist. Inspect the HTML and check the expected text, links, and images. Generation does not send email.
- Folder generation processes immediate `.md` files in filename order and stops on the first error. Already generated files remain in place.
- Outputs default to the current working directory. Use `--output <folder>` to choose a destination, created if missing. Matching filenames are replaced. MIME boundaries and image IDs vary between runs.

## Source development only

When working on the source repository itself, use `npm ci`, `npm run typecheck`, tests, and `npm run build` as needed. `npm run generate -- <file.md>` runs from source. Keep bundled templates, `init`, README, and this skill synchronized. These build steps are not required for npm users.
