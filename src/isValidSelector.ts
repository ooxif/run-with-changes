import RunWithChangesError from "./RunWithChangesError";

export default (selector: string, raise = false) => {
  const invalid = selector.replace(/[iuw]/g, "");

  if (invalid === "") {
    return true;
  }

  if (raise) {
    throw new RunWithChangesError(
      `unknown selector "${invalid}" in "${selector}"`
    );
  }

  return false;
};
