import Listr, { ListrTask } from "listr";

import checkChanges from "../checkChanges";
import RunManager from "../RunManager";
import Runner from "../Runner";
import RunWithChangesError from "../RunWithChangesError";
import { DeepReadonly } from "../types";
import IParsedArgs from "./IParsedArgs";

declare module "listr" {
  // tslint:disable-next-line:interface-name
  interface ListrOptions {
    collapse?: boolean;
  }
}

interface IListrError extends Error {
  errors: Error[];
}

class ManagedError extends RunWithChangesError {
  constructor(message: string) {
    super(message);
  }
}

const makeTask = (runner: Runner): ListrTask => ({
  skip: () => !runner.paths.length && "No path globbed",

  task: async (_ctx, task) => {
    task.output = "running...";
    const result = await runner.complete();
    const { spawnResult } = result;

    if (spawnResult && spawnResult.code) {
      const message = `Exited with code ${spawnResult.code}`;
      task.output = message;

      return Promise.reject(new ManagedError(message));
    }

    return Promise.resolve("OK");
  },

  title: `${runner.script.command} ${runner.script.patterns.join(" ")}`
});

const makeTasks = (manager: RunManager): ListrTask[] =>
  manager.runners.map(makeTask);

export default async (parsed: DeepReadonly<IParsedArgs>) => {
  let changes: ReadonlyArray<string>;
  let manager: RunManager | null = null;

  const listr = new Listr(
    [
      {
        task: async (_ctx, task) => {
          changes = await checkChanges(
            parsed.selector,
            parsed.checkChangesOptions
          );
          const { length } = changes;
          task.output = length
            ? `${length} file(s) changed`
            : "No file changed";
        },

        title: "Check changes in Git"
      },

      {
        skip: () => !changes && "No file changed",

        task: async () => {
          manager = new RunManager(parsed.scripts, changes);

          return new Listr(makeTasks(manager), {
            collapse: false,
            concurrent: true,
            exitOnError: false
          });
        },

        title: "Run commands"
      }
    ],
    { collapse: false, exitOnError: false }
  );

  try {
    await listr.run();
  } catch (e) {
    if (
      !(e instanceof Error) ||
      e.name !== "ListrError" ||
      !(e as IListrError).errors ||
      !(e as IListrError).errors.length ||
      !((e as IListrError).errors[0] instanceof ManagedError)
    ) {
      throw e;
    }
  }

  if (!manager) {
    return null;
  }

  return (manager as RunManager).complete();
};
