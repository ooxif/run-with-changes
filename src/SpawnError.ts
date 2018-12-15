import { inspect } from "util";

import RunWithChangesError from "./RunWithChangesError";
import SpawnResult from "./SpawnResult";

const makeErrorMessage = (
  result: SpawnResult,
  append: string | null = null
) => {
  let message = `command failed: ${result.command} ${result.args.join(" ")}`;

  if (append != null) {
    message = `${message}\n${append}`;
  }

  return message;
};

export default class SpawnError extends RunWithChangesError {
  public readonly result: SpawnResult;

  constructor(result: SpawnResult, error?: any) {
    super(
      makeErrorMessage(result, error === undefined ? null : inspect(error))
    );

    this.result = result;
  }
}
