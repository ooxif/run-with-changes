#!/usr/bin/env node

import chalk from "chalk";
import exit from "exit";

import RunWithChangesError from "../RunWithChangesError";
import parseArgs from "./parseArgs";
import reportResult from "./reportResult";
import runListr from "./runListr";

const main = async () => runListr(parseArgs(process.argv.slice(2)));

main()
  .then(result => {
    reportResult(result);
    exit(result ? result.exitCode : 0);
  })
  .catch(err => {
    const e =
      err instanceof RunWithChangesError
        ? chalk.red(`Error[git-stages] ${err.message}`)
        : err;

    // tslint:disable-next-line:no-console
    console.error(e);
    exit(1);
  });
