import IScript from "./IScript";
import SpawnResult from "./SpawnResult";
import { DeepReadonly } from "./types";

export default class RunResult {
  constructor(
    public readonly script: DeepReadonly<IScript>,
    public readonly paths: ReadonlyArray<string>,
    public readonly spawnResult: SpawnResult | null = null
  ) {}

  get exitCode() {
    const { spawnResult } = this;

    return spawnResult ? spawnResult.code : null;
  }

  public writeTo(
    stdout: NodeJS.WritableStream | null = null,
    stderr: NodeJS.WritableStream | null = null
  ) {
    const { spawnResult } = this;

    if (spawnResult) {
      spawnResult.writeTo(stdout, stderr);
    }
  }
}
