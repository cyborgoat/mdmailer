# mdmailer

Turn a Markdown file into a branded HTML/EML email, ready to send manually.

This repository is an npm workspaces monorepo with two published packages:

| Package | What it is |
|---|---|
| [`@goatcheese/mdmailer`](packages/cli) | The CLI (`generate`, `preview`, `init`). Start here: `npx @goatcheese/mdmailer`. |
| [`@goatcheese/mdmailer-core`](packages/core) | The render pipeline as a library with injected image I/O. Runs in Node and in browsers. |

## Install the agent skill

Run this from the project where you write your emails:

```sh
npx skills add cyborgoat/mdmailer --skill mdmailer
```

The [mdmailer skill](packages/cli/SKILL.md) teaches your agent to create and validate branded emails from Markdown. If you also need the CLI, run `npm install @goatcheese/mdmailer`.

## Development

```sh
npm install
npm run build          # core, then the CLI (which bundles core)
npm test
npm run typecheck
npm run check:golden   # regenerate every starter template and diff against test/golden
npm run check:browser
```

`test/golden` holds the normalized `.html`/`.eml` output of every starter template (default and `navy-gold` themes). Regenerate it deliberately with `node scripts/compare-golden.mjs --update` after an intended output change.

Publish order: `@goatcheese/mdmailer-core`, then `@goatcheese/mdmailer`.
