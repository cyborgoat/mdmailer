# mailman

Turn a Markdown file into a branded organization newsletter email, ready to send manually — no automation, no SMTP involved.

## How it works

1. Write your update as Markdown in `content/`, with frontmatter for `title` and `date`.
2. Configure your organization's logo and theme once in `config/email.config.json` — it's applied to every newsletter.
3. Run the generator. It renders the email with [react.email](https://react.email/docs/introduction) and writes two files to `output/`:
   - `<name>.html` — open in a browser to preview.
   - `<name>.eml` — open it and your default mail client will pop up a compose window with the formatted email already in the body. Add recipients and hit send.

## Usage

```bash
npm install
npm run generate -- --input content/2026-08-engineering.md
```

Optional `--config` flag to point at a different config file (defaults to `config/email.config.json`).

## Adding a news issue

Create a new file in `content/`, e.g. `content/2026-09-update.md`:

```markdown
---
title: "September Update"
date: 2026-09-15
---

# Headline

Your content here, in normal Markdown (headings, lists, tables, task lists, links, bold/italic, etc.).
```

## Configuring branding

Edit `config/email.config.json`:

```json
{
  "organization": { "name": "Culture", "logoUrl": "assets/logos/culture-logo.svg" },
  "theme": { "primaryColor": "#1a73e8", "footerText": "© 2026 Acme Corp" }
}
```

`logoUrl` accepts either a hosted `https://...` URL, or a path (relative to the repo root) to a local file under `assets/` — local logos are automatically embedded as a data URI at generation time (SVGs are rasterized to PNG first, since most email clients don't render inline SVG), so no image hosting is required.

## Previewing the template while editing

```bash
npm run email:dev
```

Opens the react.email local preview server for `emails/templates/OrganizationNewsletter.tsx` using its sample `PreviewProps`.
