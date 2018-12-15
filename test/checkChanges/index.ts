import checkChanges from "../../src/checkChanges";
import withGit from "../withGit";

export function* cartesian<T>(
  head: [T, T],
  ...tail: Array<[T, T]>
): Iterable<T[]> {
  for (const r of tail.length ? cartesian(tail[0], ...tail.slice(1)) : [[]]) {
    for (const h of head) {
      yield [h, ...r];
    }
  }
}

interface IState {
  modified: boolean; // changed but not staged
  partial: boolean; // partially staged
  staged: boolean;
  untracked: boolean;
}

const toPaths = (state: IState | { [key: string]: boolean }): string[] =>
  Object.keys(state).filter(key => state[key as keyof IState]);

export const testTitle = (hasHead: boolean, state: IState) =>
  `modified:${state.modified} partial:${state.partial} staged:${
    state.staged
  } untracked:${state.untracked}${hasHead ? "" : "(no HEAD)"}`;

export const testBody = (hasHead: boolean, state: IState) =>
  withGit(async ({ dir, git, init, put, touch }) => {
    const { modified, partial, staged, untracked } = state;
    await init();

    if (hasHead && !modified) {
      await touch("ensure-head", ...toPaths(state));
    } else if (modified || partial || staged || untracked) {
      await touch(...toPaths(state));
    }

    if (modified) {
      await git("add", ...toPaths({ modified }));
      await git("commit", "-m", "modified");
      await put("modified", "modified");
    } else if (hasHead) {
      await git("add", "ensure-head");
      await git("commit", "-m", "ensure-head");
    }

    if (partial || staged) {
      await git("add", ...toPaths({ partial, staged }));
    }

    if (partial) {
      await put("partial", "changed");
    }

    const options = { gitArgs: ["-C", dir] };
    const promises: Array<Promise<void>> = [];
    const results: { [selector: string]: string[] } = {};
    const expected: typeof results = {};

    for (const chars of [...cartesian(["", "i"], ["", "u"], ["", "w"])]) {
      const selector = chars.join("");

      if (selector === "") {
        continue;
      }

      promises.push(
        (async () => {
          results[selector] = (await checkChanges(selector, options)).sort();
        })()
      );

      const expects: string[] = [];

      if (modified && selector.includes("w")) {
        expects.push("modified");
      }

      if (partial && (selector.includes("i") || selector.includes("w"))) {
        expects.push("partial");
      }

      if (staged && selector.includes("i")) {
        expects.push("staged");
      }

      if (untracked && selector.includes("u")) {
        expects.push("untracked");
      }

      expected[selector] = expects.sort();
    }

    await Promise.all(promises);

    expect(results).toStrictEqual(expected);
  });
