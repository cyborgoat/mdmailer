---
name: mdmailer
description: Set up mdmailer from a fresh workspace, then draft, preview, and export branded Markdown emails as HTML, EML, or PNG. Use for mdmailer email templates, branding, images, and export troubleshooting.
---

# mdmailer

Use this skill from a fresh workspace or an existing email project. A prompt can provide the audience, message, language, branding, and desired outputs. Use the details already supplied and draft with the starter branding when the user has no brand assets.

## Set up the workspace

1. Work in the user's email project. If they supplied no project and the current folder is for other work, create a dedicated folder for the email. Keep drafts and exports there.
2. Check that Node.js 24 or later and npm are available. Reuse a working local or global mdmailer CLI when present. Otherwise use the published package through npm, which downloads it into the npm cache. Run this once to confirm the CLI is available:

   ```sh
   npm exec --yes --package=@goatcheese/mdmailer -- mdmailer --help
   ```

   Use the same npm prefix for the remaining commands. If Node.js or npm is unavailable, check for an existing version manager or compatible runtime before reporting the blocker.
3. Use the explicit `--config <file>`, the workspace's `mdmailer.config.json`, or `~/.mdmailer/mdmailer.config.json`, in that order. If none applies, run this in the workspace with terminal allocation disabled so `init` creates the config, logo, and starter templates in that folder:

   ```sh
   npm exec --yes --package=@goatcheese/mdmailer -- mdmailer init
   ```

   Use the branding details and assets supplied in the prompt to update the project config. Keep existing branding when the prompt leaves it unspecified.

## Draft and export

1. Edit the user's draft if one exists, or use the matching starter as a reference and save a new Markdown draft. English starter filenames use `<type>.md` and Chinese filenames use `<type>.zh.md`. Use the user's content and images in the finished draft.
2. If the user wants to review changes live, start a preview with the draft path and share the local URL. The preview refreshes on Markdown and config saves and supports **Desktop** and **Mobile** views.

   ```sh
   npm exec --yes --package=@goatcheese/mdmailer -- mdmailer preview update.md
   ```

3. Export the requested formats and use the same config and theme as the preview. For a general request to create an email, export HTML, EML, and PNG to `emails/`.

   ```sh
   npm exec --yes --package=@goatcheese/mdmailer -- mdmailer update.md --output emails
   ```

See the CLI reference for template fields and configuration examples. [English](https://github.com/cyborgoat/mdmailer/blob/main/packages/cli/README.md) · [简体中文](https://github.com/cyborgoat/mdmailer/blob/main/packages/cli/README.zh-CN.md)

## Authoring rules

- Frontmatter requires `type` (`news`, `notification`, `meeting`, `event`, `invitation`, `webinar`) and `lang` (`en` or `zh`). `lang` only changes built-in labels; write the content in the requested language.
- Themes: `classic`, `navy-gold`, `forest-cream`; any type can use any theme. If `theme:` is omitted, the config's `theme.preset` applies, then `classic`. `--theme <preset>` overrides for one run.
- Quote clock times and hex colors; prefer ISO dates (`2026-10-15`).
- Notifications use `headline` and `banner`. Meetings, events, invitations, and webinars use `startsAt`, `time`, `location`, `hosts`, and `agenda`, plus `joinUrl` (or `rsvpUrl` for invitations).
- Hosts: `name`, `role` (job title), `bio` (experience), `photo`.
- Old type names are rejected: `release-notes`/`digest` → `news`, `announcement` → `notification`, `workshop` → `meeting`.
- Branding (name, logo, colors, footer) belongs in the one selected JSON config, not in the email. Logo paths are relative to the config file; Markdown images and host photos are relative to the current directory. Confirm referenced files exist.

## Verify

- `--output <folder>` is required (`--output .` for the current directory). All of `.html`, `.eml`, `.png` are written by default; `--format html,eml,png` picks a subset and leaves other existing files alone.
- Confirm the output files exist and check the content, including the QR codes above the footer. Folder mode processes `.md` files in filename order and stops at the first error, leaving earlier outputs in place.
- Return the output paths. The EML is for the user to open, address, and send manually.
- Rendering uses headless Chrome for layout and PNG export. If Chrome cannot start, check for an installed browser or set `PUPPETEER_EXECUTABLE_PATH`, then retry.
