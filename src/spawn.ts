import spawn from "cross-spawn";
import SpawnError from "./SpawnError";
import SpawnResult from "./SpawnResult";
import { SpawnOutput } from "./types";

export default (command: string, args: ReadonlyArray<string>) =>
  new Promise<SpawnResult>((resolve, reject) => {
    const proc = spawn(command, [...args]);

    const outputs: SpawnOutput[] = [];

    proc.stdout.on("data", data => outputs.push([true, data]));
    proc.stderr.on("data", data => outputs.push([false, data]));

    proc.on("close", (code: number) => {
      const result = new SpawnResult(command, args, code, outputs);

      if (code) {
        reject(new SpawnError(result));
      } else {
        resolve(result);
      }
    });

    proc.on("error", error =>
      reject(new SpawnError(new SpawnResult(command, args, -1, outputs), error))
    );
  });
