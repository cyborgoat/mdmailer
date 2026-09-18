import { runGenerate } from "./commands/generate.js";
import { runInit } from "./commands/init.js";
import { TEMPLATE_NAMES } from "./emails/registry.js";

const HELP = `mdmailer — turn a Markdown file into a branded email, ready to send manually.

Usage:
  mdmailer <file.md>                     Generate <name>.html and .eml
  mdmailer <folder/>                     Generate every .md file directly in a folder
  mdmailer init                          Scaffold config and example content

Options:
  --output <folder>                      Defaults to the current working directory
  --theme <preset>                       Override the theme preset
  --config <file>                        Defaults to mdmailer.config.json
  -h, --help                            Show this help

Examples:
  mdmailer content/news.md
  mdmailer content/
  mdmailer content/news.md --theme navy-gold
  mdmailer content/ --output output

Also supported: mdmailer generate --input <file.md>

Required Markdown frontmatter:
  type                                   One of: ${TEMPLATE_NAMES.join(", ")}
  lang                                   English (en) or Chinese (zh)

Docs: https://github.com/cyborgoat/mdmailer
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const optionEnd = process.argv.indexOf("--", 2);
  const options = process.argv.slice(2, optionEnd === -1 ? undefined : optionEnd);
  if (options.includes("--help") || options.includes("-h")) {
    console.log(HELP);
    return;
  }

  switch (command) {
    case "generate":
      await runGenerate(rest);
      break;
    case "init":
      await runInit();
      break;
    case undefined:
    case "help":
      console.log(HELP);
      break;
    default:
      await runGenerate([command, ...rest]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
