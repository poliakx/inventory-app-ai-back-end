export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  globalSetup: "<rootDir>/tests/setup/setupDB.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.afterEnv.js"],
  testTimeout: 10000,
  maxWorkers: 1
};
