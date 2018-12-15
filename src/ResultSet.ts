import RunResult from "./RunResult";
import SpawnResult from "./SpawnResult";

export default class ResultSet {
  public readonly results: ReadonlyArray<RunResult>;

  constructor(results: ReadonlyArray<RunResult>) {
    this.results = results;
  }

  get exitCode() {
    const result = this.results.find(r => Boolean(r.exitCode));

    return result ? (result.spawnResult as SpawnResult).code : 0;
  }
}
