import ICheckChangesOptions from "../ICheckChangesOptions";
import IScript from "../IScript";
import isInvalidSelector from "../isValidSelector";
import RunWithChangesError from "../RunWithChangesError";
import IParsedArgs from "./IParsedArgs";

const makeCheckChangesArgs = (
  args: ReadonlyArray<string>
): [string, ICheckChangesOptions] => {
  const options: ICheckChangesOptions = {};
  let selector: string = "";
  const { length } = args;

  for (let i = 0; i < length; ++i) {
    let arg = args[i];

    if (["--color", "--no-color"].includes(arg)) {
      // these options are used by chalk.
      continue;
    }

    if (arg === "--diff-filter") {
      arg = `${arg}=${args[++i] || ""}`;
    }

    if (arg.startsWith("--diff-filter=")) {
      if (options.filter) {
        throw new RunWithChangesError("duplicate option: --diff-filter");
      }

      options.filter = arg.substring(14);

      continue;
    }

    if (arg.startsWith("-") || selector !== "") {
      throw new RunWithChangesError(`unknown option: ${arg}`);
    }

    selector = arg;
  }

  if (selector === "") {
    throw new RunWithChangesError("selector is empty");
  }

  isInvalidSelector(selector, true);

  return [selector, options];
};

const makeScripts = (args: ReadonlyArray<string>): IScript[] =>
  args
    .reduce(
      (prev, curr) => {
        if (curr === "-r") {
          prev.push([]);
        } else {
          prev[prev.length - 1].push(curr);
        }

        return prev;
      },
      [] as string[][]
    )
    .map(group => {
      if (!group.length) {
        throw new RunWithChangesError("-r must have a command");
      }

      return {
        command: group[0],
        patterns: group.slice(1)
      };
    });

const splitArgs = (args: ReadonlyArray<string>) => {
  const firstR = args.indexOf("-r");

  return firstR < 0
    ? [[...args], []]
    : [args.slice(0, firstR), args.slice(firstR)];
};

export default function parseArgs(args: ReadonlyArray<string>): IParsedArgs {
  const [optionArgs, scriptArgs] = splitArgs(args);
  const [selector, checkChangesOptions] = makeCheckChangesArgs(optionArgs);

  return {
    checkChangesOptions,
    scripts: makeScripts(scriptArgs),
    selector
  };
}
