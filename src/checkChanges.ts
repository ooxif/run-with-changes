import { DEFAULT_FILTER, GIT_NULL_HASH } from "./constants";
import ICheckChangesOptions from "./ICheckChangesOptions";
import isInvalidSelector from "./isValidSelector";
import spawn from "./spawn";
import SpawnError from "./SpawnError";
import { DeepReadonly } from "./types";

type RoArgs = ReadonlyArray<string>;
type RoOptions = DeepReadonly<ICheckChangesOptions>;

const git = (args: RoArgs, options: RoOptions) =>
  spawn("git", (options.gitArgs || []).concat(args));

const head = async (options: RoOptions) => {
  try {
    await git(["rev-parse", "--verify", "HEAD"], options);

    return "HEAD";
  } catch (e) {
    if (
      e instanceof SpawnError &&
      e.result.stderr === "fatal: Needed a single revision"
    ) {
      return GIT_NULL_HASH;
    }

    throw e;
  }
};

const splitOutput = async (args: RoArgs, options: RoOptions) => {
  const output = (await git(args, options)).stdout;

  return output === "" ? [] : output.split("\0");
};

const validateFilter = (filter: any) => {
  if (typeof filter !== "string" || filter === "") {
    throw new Error(`invalid --diff-filter: ${filter}`);
  }

  return filter;
};

const untrackedFiles = (options: RoOptions) =>
  splitOutput(["ls-files", "--exclude-standard", "-oz"], options);

const changedFiles = (args: RoArgs, options: RoOptions) =>
  splitOutput(
    [
      "diff",
      "--name-only",
      "-z",
      `--diff-filter=${validateFilter(options.filter || DEFAULT_FILTER)}`,
      ...args
    ],
    options
  );

interface ISelectors {
  i: boolean;
  u: boolean;
  w: boolean;
}

export default async (selector: string, options: RoOptions = {}) => {
  const selectors: ISelectors = {
    i: false,
    u: false,
    w: false
  };

  isInvalidSelector(selector, true);

  for (const char of selector) {
    selectors[char as keyof ISelectors] = true;
  }

  const promises = [];

  if (selectors.u) {
    promises.push(untrackedFiles(options));
  }

  if (selectors.i) {
    if (selectors.w) {
      promises.push(head(options).then(h => changedFiles([h], options)));
    } else {
      promises.push(changedFiles(["--cached"], options));
    }
  } else if (selectors.w) {
    promises.push(changedFiles([], options));
  }

  return Array.from(
    new Set(
      (await Promise.all(promises)).reduce((acc, curr) => acc.concat(curr), [])
    )
  );
};
