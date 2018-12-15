# run-with-changes

Run scripts in parallel with paths that have changes.

## SYNOPSIS

```
run-with-changes [<options>] <selector> -r <script> [<glob>...] [-r <script> [<glob>...]...]
```

### `selector`

Select which paths to be included.

| Selector | Description                | Underlying Git Command               |
| :------: | -------------------------- | ------------------------------------ |
|    i     | diff Index vs HEAD         | `git diff --cached --name-only HEAD` |
|    w     | diff Working tree vs index | `git diff --name-only`               |
|    u     | Untracked files            | `git ls-files --exclude-standard -o` |

Multiple selectors can be used at once by combining characters, like `iwu`.

> NOTE: `git diff --name-only HEAD` is used when `selector` includes both of
> `i` and `w`.

> NOTE for Windows users
>
> `npm` overwrites a `HOME` environment variable to a value set to
> `USERPROFILE`. This causes `git` to lose global config if your `HOME` and
> `USERPROFILE` have different values.
>
> Possible solutions:
> - Use `yarn` instead.
> - Move your global config to system config or local config.

### `-r <script> [<glob>...]`

Run a script listed in `package.json` with paths as arguments.
Paths are filtered by `<glob>`.

> NOTE
>
> [`micromatch`](https://www.npmjs.com/package/micromatch) is used for
> glob patterns. (options: `{ basename: true, dot: true }`)
>
> `run-with-changes` spawns a script without a shell.  
> Because of that, some scripts may disable features which requires a TTY.
> (e.g. colors)

Multiple scripts can be listed, and they run in parallel.

> NOTE
>
> The exit code of `run-with-changes` is
> - `0` when all scripts exit with `0`.
> - [npm] otherwise the code of the first (leftmost) script to exit with a
>   non-zero value.
> - [yarn] otherwise always `1`.
>   (`yarn run` ignores the exit code of the script)

## OPTIONS

### `--diff-filter=[(A|C|D|M|R|T|U|X|B)…​[*]]`

Default: `ACMRTUXB`

This option is passed to `git diff`.
See [`git diff --diff-filter`](https://git-scm.com/docs/git-diff#git-diff---diff-filterACDMRTUXB82308203)
for details.

> NOTE: The default value `ACMRTUXB` excludes `D` because the main purpose
> of `run-with-changes` is to filter paths for linting.

## EXAMPLES

### Lint all changed JS/TS/CSS files (including untracked files) in parallel.

package.json

```json
{
  "scripts": {
    "lint-changed": "run-with-changes iwu -r eslint-files \"*.js\" -r tslint-files \"*.{ts,tsx}\" -r stylelint-files \"*.css\"",
    "eslint-files": "eslint --color --no-ignore",
    "tslint-files": "tslint",
    "stylelint-files": "stylelint"
  }
}
```

- `iwu` to list all changed files. (including untracked files)
- `eslint-files` to set options to `eslint`.

### Lint staged JS/TS/CSS files in parallel.

package.json

```json
{
  "scripts": {
    "lint-staged": "run-with-changes i -r eslint-files \"*.js\" -r tslint-files \"*.{ts,tsx}\" -r stylelint-files \"*.css\"",
    "eslint-files": "eslint --color --no-ignore",
    "tslint-files": "tslint",
    "stylelint-files": "stylelint"
  }
}
```

### Fix errors in all changed JS/TS/CSS files (including untracked files) in parallel.

package.json

```json
{
  "scripts": {
    "fix-changed": "run-with-changes iwu -r eslint-fix \"*.js\" -r tslint-fix \"*.{ts,tsx}\" -r stylelint-fix \"*.css\"",
    "eslint-fix": "eslint --color --no-ignore --fix",
    "tslint-fix": "tslint --fix",
    "stylelint-fix": "stylelint --fix"
  }
}
```
