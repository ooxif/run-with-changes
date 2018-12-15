import { spawn } from "child_process";
import { writeFile as fsWriteFile } from "fs";
import { join as pathJoin } from "path";
import { dir as tmpDir, Options as TmpOptions } from "tmp";
import { promisify } from "util";

declare module "tmp" {
  namespace dir {
    function __promisify__(config: TmpOptions): Promise<string>;
  }
}

const writeFile = promisify(fsWriteFile);

const withTmpDir = (cb: (path: string) => any) => () =>
  new Promise((resolve, reject) => {
    tmpDir({ unsafeCleanup: true }, async (err, path, cleanupCallback) => {
      if (err) {
        reject(err);
      }

      try {
        resolve(await cb(path));
      } catch (e) {
        reject(e);
      } finally {
        cleanupCallback();
      }
    });
  });

interface IPrepareCallbackParameters {
  init: () => Promise<void>;
  dir: string;
  git: (...args: string[]) => Promise<string>;
  put: (path: string, content: string) => Promise<void>;
  touch: (...paths: string[]) => Promise<void>;
}

type PrepareCallback = (cbParams: IPrepareCallbackParameters) => any;

export default (cb: PrepareCallback) =>
  withTmpDir(async dir => {
    const put = (path: string, content: string) =>
      writeFile(
        pathJoin(dir as string, ...path.split("/")),
        content || "",
        "utf8"
      );

    const touch = (...paths: string[]): Promise<void> =>
      Promise.all(paths.map(p => put(p, ""))).then(() => undefined);

    const git = (...args: string[]): Promise<string> =>
      new Promise((resolve, reject) => {
        const proc = spawn("git", args, { cwd: dir });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", data => (stdout += data.toString("utf8")));
        proc.stderr.on("data", data => (stderr += data.toString("utf8")));

        proc.on("close", code => {
          if (code) {
            reject(new Error(stderr));
          } else {
            resolve(stdout);
          }
        });

        proc.on("error", err => reject(err));
      });

    const init = () => git("init", ".").then(() => undefined);

    return cb({ dir, git, init, put, touch });
  });
