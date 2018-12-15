import { cartesian, testBody, testTitle } from ".";

// tests with empty Git (no commit, no HEAD)
for (const [partial, staged, untracked] of cartesian(
  [false, true],
  [false, true],
  [false, true]
)) {
  const state = { partial, staged, untracked, modified: false };

  test(testTitle(false, state), testBody(false, state));
}
