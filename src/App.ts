import { exec } from "child_process";
import chalk from "chalk";
import { CliAnswer } from "./CliAnswer.js";

/**
 * Format a commit
 *
 * Uses gitmojis from: https://github.com/carloscuesta/gitmoji
 */
export default class App {
  /**
   * Construct the commit message
   * @param  answers outline of cli answers
   * @return         commit message
   */
  public getCommitMessage(answers: CliAnswer) {
    let msg: string;

    // add a scope if given
    const scope: string =
      answers.scope === "" ? answers.scope : `(${answers.scope})`;

    // add issue if given
    const issue = answers.issue
      ? ` (${(answers.issue.match(/^[1-9]*$/) ? "#" : "") + answers.issue})`
      : "";

    // add description and emoji
    msg = `${answers.type}${scope}: ${answers.description}${issue} ${answers.emoji}`;

    // append body if it exists.
    if (answers.body !== "") {
      msg = `${msg}\n\n${answers.body}`;
    }

    // trim whitespace.
    return msg.trim();
  }

  /**
   * Commit to git.
   * todo: format errors with chalk.
   *
   * @param message
   * @param options
   */
  public async commitChanges(
    message: string,
    options?: { add: boolean; sign: boolean; push: boolean }
  ): Promise<string> {
    let cmd: string = "git commit";

    // apply options
    if (options) {
      // add all untracked in directory.
      if (options.add) {
        await this.executeCommand("git add .");
        console.log(chalk.green("Staged untracked files"));
      }

      if (options.sign) {
        cmd = `${cmd} -S`;
      }
    }

    cmd = `${cmd} -m '${message}'`;

    if (options) {
      if (options.push) {
        cmd = `${cmd} && git push`;
      }
    }

    try {
      await this.executeCommand(cmd);
      console.log(chalk.green("Changes committed"));
      if (options) {
        if (options.push) {
          console.log(chalk.green("Commit pushed"));
        }
      }
    } catch (e) {
      throw e;
    }

    return "commit successful";
  }

  /**
   * Execute a command
   * @param cmd
   */
  private executeCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(error);
        resolve(stdout.trim());
      });
    });
  }
}
