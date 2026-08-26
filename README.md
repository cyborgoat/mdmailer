# mdmailer

Turn a Markdown file into a branded email, ready to send manually — no automation, no SMTP involved.

Requires Node.js 24 or later.

## How it works

1. Write your update as Markdown, with frontmatter for `title` and `date`.
2. Configure your organization's name, logo, theme, and slogan once in `mdmailer.config.json` — it's applied to every email you generate.
3. Run the generator. It renders the email with [react.email](https://react.email/docs/introduction) and writes two files to `output/`:
   - `<name>.html` — open in a browser to preview.
   - `<name>.eml` — open it and your default mail client will pop up a compose window with the formatted email already in the body. Add recipients and hit send.

## Usage

```bash
npx @cyborgoat/mdmailer init
```

This scaffolds `mdmailer.config.json`, a placeholder `assets/logo.svg`, and a `content/example.md` that demonstrates the full range of supported Markdown (headings, emphasis, lists, task lists, tables, blockquotes, code blocks, and more). Edit all three, then generate:

```bash
npx @cyborgoat/mdmailer generate --input content/example.md
```

(If you install it globally — `npm install -g @cyborgoat/mdmailer` — the command is just `mdmailer`.)

Optional `--config` flag to point at a different config file (defaults to `mdmailer.config.json`).

## Writing an update

```markdown
---
title: "September Update"
date: 2026-09-15
---

# Headline

Your content here, in normal Markdown (headings, lists, tables, task lists, links, bold/italic, etc.).

![Alt text](https://.../photo.jpg)
![Alt text](assets/images/photo.jpg)
```

Images work the same way the logo does: a hosted `https://...` URL is left as-is, while a local path (relative to the current directory) is automatically embedded at generation time — no image hosting required. As with the logo, it's a `data:` URI in the `.html` preview and a `cid:`-referenced inline attachment in the `.eml`, since Outlook doesn't render `data:` URIs; on the page itself, images are scaled down with CSS to fit the email width, but not re-encoded, so keep source files reasonably sized.

## Configuring branding

Edit `mdmailer.config.json`:

```json
{
  "organization": { "name": "Your Organization", "logoUrl": "https://.../logo.png" },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}",
    "slogan": "Flowing intelligence across the network",
    "fontFamily": "\"Helvetica Neue\", Helvetica, Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
  }
}
```

`logoUrl` accepts either a hosted `https://...` URL, or a path (relative to the current directory) to a local image file — local logos are automatically embedded at generation time (SVGs are rasterized to PNG first, since most email clients don't render inline SVG), so no image hosting is required. It's embedded differently depending on the output: in the `.html` preview it's a `data:` URI (browsers render those fine), while in the `.eml` it's attached as a proper inline image referenced by `Content-ID`/`cid:` — Outlook doesn't render `data:` URIs in `<img>` tags, so this keeps the logo visible there too.

`fontFamily` is optional and defaults to `"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif` — a stack that covers both Latin and Simplified Chinese glyphs. Outlook desktop renders with the Word HTML engine, which only matches web-safe fonts already installed on the system (no `@font-face`/web fonts), so stick to fonts you know your recipients have — the default only uses fonts that ship with Windows and macOS.

`organization.name`, a small version of `organization.logoUrl`, and `theme.slogan` are rendered together in the email's footer, below the body content — a small logo beside the bold org name, with the slogan in a smaller, italic serif underneath it. `theme.footerText` can include the placeholder `{{organization}}`, which is replaced with `organization.name` at generation time, so your copyright line always stays in sync with the configured org name.

## Local development (this repo)

This repo is also mdmailer's own dogfood project — `mdmailer.config.json` and `content/` at the root are the maintainer's live example, not part of the published package. Only a handful of example files are tracked in git (`content/2026-08-engineering.md`, `content/2026-06-monthly-digest.md`, `content/2026-06-monthly-digest-zh.md` (a Chinese translation, demonstrating the default CJK-safe `fontFamily`), `content/2026-05-product-launch.md`, `content/2026-03-release-notes.md`, `content/2026-01-quarterly-review.md`, `assets/logos/logo-dark-with-letters.svg` — a generic placeholder wordmark, not a real organization's branding — and `assets/images/team-offsite.jpg`, a freely-licensed stock photo used as the local-image example; see `.gitignore`), so feel free to drop extra local content, logo, or image files in those folders without worrying about committing them.

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
npm publish --access=public
```

`prepublishOnly` runs the build automatically. The published tarball only includes `dist/`, `README.md`, and `LICENSE` (see the `files` field in `package.json`) — none of this repo's own config, content, or logo assets are shipped. `npm pack --dry-run` is a quick way to double-check tarball contents before publishing. The package's `engines.node` field (`>=24`) matches `react-email`'s own Node requirement.
