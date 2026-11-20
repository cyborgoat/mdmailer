English | [简体中文](README.zh-CN.md)

# mdmailer

Turn Markdown into branded newsletters, announcements, and invitations. Preview your draft in a browser, then export an HTML email, an EML file to send from your mail client, and a PNG card to share.

## Use with an agent

Install the [mdmailer skill](SKILL.md) in the folder where you want to work on emails:

```sh
npx skills add cyborgoat/mdmailer --skill mdmailer
```

Then prompt your agent:

> Use mdmailer to draft an English newsletter about our new team handbook. Use starter branding and save HTML, EML, and PNG in `emails/`.

The agent can fetch the CLI with npm, create the workspace config, and export the email. This workflow requires Node.js 24 or later and npm.

## Installation

Use **Node.js 24 or later**. In the folder where you keep your email projects, install the CLI and run the setup wizard:

```sh
npm install @goatcheese/mdmailer
npx mdmailer init
```

Enter “team-mail” as the project name and choose a theme. The wizard creates `team-mail/` with starter emails in English and Chinese, a branding config, and a placeholder logo.

## Usage

### 1. Edit a starter email

Open `team-mail/templates/news.md` and replace the sample text with your update. You can also start from the [English newsletter](packages/cli/templates/news.md) or the [Chinese newsletter](packages/cli/templates/news.zh.md).

Keep the YAML frontmatter between the opening `---` lines. Set `title` to your subject and choose a `type` such as `news` or `invitation`. Set `lang` to `en` or `zh` for the built-in labels, then write the body in Markdown.

### 2. Preview as you edit

Enter the project folder with `cd team-mail`, then start the preview:

```sh
npx mdmailer preview templates/news.md
```

Open the local URL shown in your terminal. The preview refreshes when you save the Markdown or branding config. Use **Desktop** and **Mobile** to check the layout, then press **Ctrl+C** to stop the preview.

### 3. Export and send

From `team-mail/`, generate the final files:

```sh
npx mdmailer templates/news.md --output emails
```

You’ll get these files in `emails/`:

| File | What to do with it |
| --- | --- |
| `news.html` | Open the exported email in a browser. |
| `news.eml` | Open in your mail client, add recipients, and send. |
| `news.png` | Share the email as an image, with scannable QR codes for any links. |

To export only HTML and EML, add `--format html,eml`. To export every Markdown file directly in `templates/`, pass `templates/` in place of `templates/news.md`.

## Configuration

Edit `mdmailer.config.json` in your email project to set the organization name, logo, brand color, and footer. Replace `assets/logo.svg` with your logo or update `organization.logoUrl` to point to a different file or an HTTPS URL.

Set `theme.preset` to `classic`, `navy-gold`, or `forest-cream` to choose the project default. The starter newsletter sets `theme: classic` in its frontmatter. Change that field to pick a theme for this draft, or remove it to use the project default.

For other layouts, frontmatter fields, branding options, and browser setup, see the [CLI reference](packages/cli/README.md) and [starter templates](packages/cli/templates).

## Development

From a checkout of this repository, run `npm ci`, `npm run build`, `npm run typecheck`, and `npm test`. Use `npm run check:golden` to compare template output and `npm run check:browser` to check the browser bundle. See the [core library README](packages/core/README.md) for programmatic use.

## License

[MIT](LICENSE)
