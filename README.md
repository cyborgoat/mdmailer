# mdmailer

Turn a Markdown file into a branded email, ready to send manually — no automation, no SMTP involved.

## How it works

1. Write your update as Markdown, with frontmatter for `title` and `date`.
2. Configure your organization's logo, theme, and slogan once in `mdmailer.config.json` — it's applied to every email you generate.
3. Run the generator. It renders the email with [react.email](https://react.email/docs/introduction) and writes two files to `output/`:
   - `<name>.html` — open in a browser to preview.
   - `<name>.eml` — open it and your default mail client will pop up a compose window with the formatted email already in the body. Add recipients and hit send.

## Usage

```bash
npx mdmailer init
```

This scaffolds `mdmailer.config.json` and `content/example.md` in the current directory. Edit both, then generate:

```bash
npx mdmailer generate --input content/example.md
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
```

## Configuring branding

Edit `mdmailer.config.json`:

```json
{
  "organization": { "name": "Your Organization", "logoUrl": "https://.../logo.png" },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 Your Organization",
    "slogan": "Flowing intelligence across the network"
  }
}
```

`logoUrl` accepts either a hosted `https://...` URL, or a path (relative to the current directory) to a local image file — local logos are automatically embedded as a data URI at generation time (SVGs are rasterized to PNG first, since most email clients don't render inline SVG), so no image hosting is required.

## Local development (this repo)

This repo is also mdmailer's own dogfood project — `mdmailer.config.json` and `content/` at the root are the maintainer's live example, not part of the published package.

```bash
npm install
npm run generate -- --input content/2026-08-engineering.md   # runs src/cli.ts directly via tsx
npm run email:dev                                             # react.email live preview server
npm run typecheck
npm run build                                                 # bundles src/cli.ts -> dist/cli.js via tsup
```

## Publishing

```bash
npm login          # one-time, interactive
npm run build
npm publish
```

`prepublishOnly` runs the build automatically. The published tarball only includes `dist/`, `README.md`, and `LICENSE` (see the `files` field in `package.json`) — none of this repo's own config, content, or logo assets are shipped.
