module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // "**/" because of a bug.
  // @see https://github.com/facebook/jest/issues/7108
  testMatch: ["**/test/**/*.test.ts"]
};
