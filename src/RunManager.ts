import mm from "micromatch";
import IScript from "./IScript";
import ResultSet from "./ResultSet";
import Runner from "./Runner";
import { DeepReadonly } from "./types";

const filter = (
  patterns: ReadonlyArray<string>,
  paths: ReadonlyArray<string>
) => {
  return patterns.length && patterns.every(p => p !== "*" && p !== "**/*")
    ? mm([...paths], [...patterns], { basename: true, dot: true })
    : paths;
};

export default class RunManager {
  public readonly runners: Runner[];

  constructor(
    scripts: ReadonlyArray<DeepReadonly<IScript>>,
    public readonly paths: ReadonlyArray<string>
  ) {
    this.runners = scripts.map(s => new Runner(s, filter(s.patterns, paths)));
  }

  public async complete() {
    return new ResultSet(
      await Promise.all(this.runners.map(r => r.complete()))
    );
  }
}
