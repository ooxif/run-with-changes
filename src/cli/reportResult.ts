import chalk from "chalk";
import ResultSet from "../ResultSet";

const s = (num: number) => {
  return num === 1 ? "" : "s";
};

export default (result: ResultSet | null) => {
  if (!result) {
    return;
  }

  const sep = "=".repeat(80);
  const errors: string[] = [];

  /* tslint:disable:no-console */

  result.results.forEach(r => {
    const command = `${r.script.command} ${r.script.patterns
      .map(p => `"${p}"`)
      .join(" ")} -- ${r.paths.length} file${s(r.paths.length)} matched`;
    const header = `\n${sep}\n   ${command}\n${sep}\n`;

    if (!r.paths.length) {
      console.log(chalk.cyan(header));
      console.log("** SKIPPED **");
    } else if (r.exitCode) {
      console.log(chalk.red(header));
      r.writeTo();
      errors.push(command);
    } else {
      console.log(chalk.green(header));
      r.writeTo();
    }
  });

  const { length } = errors;

  if (length) {
    console.error(
      chalk.red(
        `\n${sep}\n   ${length} script${s(
          length
        )} failed\n${sep}\n\n- ${errors.join("\n- ")}`
      )
    );
  }

  console.log("");
};
