import { cartesian, testBody, testTitle } from ".";

// tests with non-empty Git
for (const [modified, partial, staged, untracked] of cartesian(
  [false, true],
  [false, true],
  [false, true],
  [false, true]
)) {
  const state = { modified, partial, staged, untracked };

  test(testTitle(true, state), testBody(true, state));
}
