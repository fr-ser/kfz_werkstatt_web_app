module.exports = {
  rootDir: "backend",
  globalSetup: "./__tests__/_setup_global.ts",
  setupFilesAfterEnv: ["./__tests__/_setup_after_env.ts"],
  testMatch: ["**/__tests__/**/*.test.(ts|js)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts"],
};
