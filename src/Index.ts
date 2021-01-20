#!/usr/bin/env node

import App from "./App";
// @ts-ignore
import { version } from "../package.json";
import chalk from "chalk";
import { CLI } from "./CLI";

/**
 * Execute app
 *
 * @returns {Promise<void>}
 */
const commander = require("commander");

async function exe(): Promise<void> {
  try {
    commander
      .version(version, "-v --version")
      .description(
        "Git wrapper for committing in the conventional commit format"
      );

    commander
      .option("-s, --sign", "sign commit with gpg key")
      .option("-a, --add", "add all untracked changes")
      .option("-c, --config", "edit committer config")
      .option("-p, --push", "push commit");

    commander.parse(process.argv);
    const options = {
      sign: commander.sign,
      add: commander.add,
      push: commander.push
    };

    const app: App = new App();
    const cli: CLI = new CLI();
    const ans = await cli.getAnswers();
    cli.validate(ans);

    const msg = app.getCommitMessage(ans);

    await app.commitChanges(msg, options);
  } catch (e) {
    console.error(chalk.red(e.message));
    process.exit(1);
  }
}

exe().then();
