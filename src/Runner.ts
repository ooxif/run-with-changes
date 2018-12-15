import IScript from "./IScript";
import RunResult from "./RunResult";
import spawn from "./spawn";
import SpawnError from "./SpawnError";
import SpawnResult from "./SpawnResult";
import { DeepReadonly } from "./types";

export default class Runner {
  private readonly promise: Promise<RunResult>;

  constructor(
    public readonly script: DeepReadonly<IScript>,
    public readonly paths: ReadonlyArray<string>
  ) {
    this.promise = this.run();
  }

  public complete() {
    return this.promise;
  }

  public async run() {
    const { paths, script } = this;

    if (!paths.length) {
      return new RunResult(script, paths);
    }

    let spawnResult: SpawnResult;

    try {
      spawnResult = await spawn(process.execPath, [
        process.env.npm_execpath as string,
        "--no-progress",
        "-s",
        "run",
        script.command,
        ...paths
      ]);
    } catch (e) {
      if (e instanceof SpawnError) {
        spawnResult = e.result;
      } else {
        throw e;
      }
    }

    return new RunResult(script, paths, spawnResult);
  }
}
