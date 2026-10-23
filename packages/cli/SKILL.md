---
name: mdmailer
description: Create, configure, generate, and validate branded HTML, EML, and PNG emails from Markdown with mdmailer. Use for email content, branding, images, and generation troubleshooting.
---

# mdmailer

Generates email files from Markdown; it does not send email. Full field reference: `README.md` in the installed package (`node_modules/@goatcheese/mdmailer/README.md`, or `$(npm root -g)/@goatcheese/mdmailer/README.md` for a global install).

## Workflow

1. Work in the user's email workspace, not inside the installed package, and never modify the package. Use Node.js 24+. Run `npx --no-install mdmailer` for a local install, or `mdmailer` for a global one. If it isn't installed: `npm install @goatcheese/mdmailer`.
2. Find the config in this order: `--config <file>`, `mdmailer.config.json` in the working directory, `~/.mdmailer/mdmailer.config.json`. If none exists, run `npx --no-install mdmailer init` (non-interactive here; it scaffolds into the current directory and never overwrites files). `init --global` sets up `~/.mdmailer/` instead.
3. Write or edit the Markdown file. If the user named a file, edit it and keep unrelated content. Otherwise create a new one, using the bundled examples as a reference. They live in the package's `templates/` folder, one English and one Chinese per type: `news`, `notification`, `meeting`, `event`, `invitation`, `webinar` (`<type>.md`, `<type>.zh.md`). Copy one into the workspace to start; example host photos are in the package's `assets/images/hosts/` and are placeholders, not the user's real hosts.
4. Generate:

   ```bash
   npx --no-install mdmailer my-email.md --output ./emails
   npx --no-install mdmailer ./drafts --output ./emails
   ```

For live authoring, run `npx --no-install mdmailer preview my-email.md` and open the printed local URL. It refreshes after Markdown/config saves, keeps the last valid preview on errors, and writes no exports. Supports `--config`, `--theme`, and `--port` (default 3000). Stop the server when finished; use generate for final files.

## Authoring rules

- Frontmatter requires `type` (`news`, `notification`, `meeting`, `event`, `invitation`, `webinar`) and `lang` (`en` or `zh`). `lang` only changes built-in labels; write the content in the requested language.
- Themes: `classic`, `navy-gold`, `forest-cream`; any type can use any theme. If `theme:` is omitted, the config's `theme.preset` applies, then `classic`. `--theme <preset>` overrides for one run.
- Quote clock times and hex colors; prefer ISO dates (`2026-10-15`).
- Notifications use `headline` and `banner`. Meetings, events, invitations, and webinars use `startsAt`, `time`, `location`, `hosts`, and `agenda`, plus `joinUrl` (or `rsvpUrl` for invitations).
- Hosts: `name`, `role` (job title), `bio` (experience), `photo`.
- Old type names are rejected: `release-notes`/`digest` → `news`, `announcement` → `notification`, `workshop` → `meeting`.
- Branding (name, logo, colors, footer) belongs in the one selected JSON config, not in the email. Logo paths are relative to the config file; Markdown images and host photos are relative to the current directory. Confirm referenced files exist.
- Don't open EML files or launch a mail client unless asked.

## Verify

- `--output <folder>` is required (`--output .` for the current directory). All of `.html`, `.eml`, `.png` are written by default; `--format html,eml,png` picks a subset and leaves other existing files alone.
- Confirm the expected files exist and check the content, including the QR codes above the footer. Folder mode processes `.md` files in filename order and stops at the first error, leaving earlier outputs in place.
- PNG rendering uses headless Chrome, which mdmailer finds or downloads automatically. If rendering fails, check for network access or set `PUPPETEER_EXECUTABLE_PATH`, then rerun.

## Working on the source repo

Use `npm ci`, `npm run typecheck`, `npm test`, `npm run build`. Keep `templates/`, `init`, README, and this file in sync. npm users don't need any of this.
