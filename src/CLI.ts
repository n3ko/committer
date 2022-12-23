import * as inquirer from "inquirer";
import * as emojis from "./emojis.json";
import { CliAnswer } from "./CliAnswer";
import { Emoji } from "./Emoji";
type Tq_autocomplete = {
  type: "autocomplete";
  name: string;
  message: string;
  source: Function;
  filter: Function;
};
type Tq_input = {
  type: "input";
  name: string;
  message: string;
};
type Tquestion = Tq_autocomplete | Tq_input;

export class CLI {
  /**
   * Get responses from command line
   * @returns {Promise<{type: string; scope: string; description: string; body: string; footer: string; issue: string}>}
   */
  public async getAnswers(): Promise<CliAnswer> {
    const commitTypes = [
      "build",
      "ci",
      "chore",
      "docs",
      "feat",
      "fix",
      "perf",
      "refactor",
      "revert",
      "style",
      "test"
    ];

    let questions: Array<Tquestion> = [
      {
        type: "autocomplete",
        name: "emoji",
        message: "Commit summary:",
        source: this.filterResponses,
        filter: this.formatEmoji
      },
      {
        type: "autocomplete",
        name: "type",
        message: "Choose commit type:",
        source: (a: unknown, input: string) => {
          return commitTypes.filter(
            str => (input || "") == "" || str.indexOf(input) > -1
          );
        },
        filter: (e: string) => e
      }
    ];
    if (!process.env.COMMITER_NO_SCOPE)
      questions.push({
        type: "input",
        name: "scope",
        message: "Enter commit scope (optional):"
      });
    questions = questions.concat([
      { type: "input", name: "description", message: "Enter commit title:" },
      { type: "input", name: "body", message: "Enter commit body (optional):" },
      {
        type: "input",
        name: "issue",
        message: "References issue/PR (optional):"
      }
    ]);

    // TODO: find a better way to do this with typescript.
    inquirer.registerPrompt(
      "autocomplete",
      require("inquirer-autocomplete-prompt")
    );
    const ans: any = await inquirer.prompt(questions);
    if (!ans.scope) ans.scope = "";
    return ans as CliAnswer;
  }

  /**
   * Validate responses.
   * @param {{type: string; scope: string; description: string; body: string; footer: string; issue: string; emoji: string}} answers
   */
  public validate(answers: CliAnswer) {
    if (answers.type === "") throw new Error("Commit must have a type");
    if (answers.description === "")
      throw new Error("Commit must have a description");
  }

  /**
   * Filter commmit type
   *
   * @param answersSoFar
   * @param {string} input
   * @returns {Promise<string[]>}
   */
  public filterResponses(answersSoFar: any, input: string): Promise<string[]> {
    return new Promise(resolve => {
      // map to string
      const mapped: string[] = CLI.getEmojisAsString();

      // format input
      if (input === undefined) {
        input = "";
      }
      input = input.toLowerCase().trim();

      // return matches
      resolve(
        mapped.filter(gitmoji => gitmoji.toLowerCase().indexOf(input) > -1)
      );
    });
  }

  /**
   * Map emoji to string
   * @return [description]
   */
  public static getEmojisAsString(): string[] {
    return emojis.gitmojis.map(
      gitmoji => `${gitmoji.emoji.trim()} - ${gitmoji.description.trim()}`
    );
  }

  public formatEmoji(input: string): Promise<string> {
    return new Promise(resolve => {
      const ans: Emoji[] = emojis.gitmojis.filter(
        g => input.indexOf(g.emoji) > -1
      ) as Emoji[];
      resolve(ans[0].emoji);
    });
  }
}
