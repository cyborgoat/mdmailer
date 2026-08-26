import { runGenerate } from "./commands/generate.js";
import { runInit } from "./commands/init.js";

const HELP = `mdmailer — turn a Markdown file into a branded email, ready to send manually.

Usage:
  mdmailer init                          Scaffold mdmailer.config.json and content/example.md
  mdmailer generate --input <file.md>    Generate output/<name>.html and .eml from a Markdown file
    [--config <file>]                    Defaults to mdmailer.config.json

Docs: https://github.com/cyborgoat/mailman
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "generate":
      await runGenerate(rest);
      break;
    case "init":
      await runInit();
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command "${command}"\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
