module.exports = {
  roots: ["backend", "frontend"],
  setupFiles: ["./backend/__tests__/setup.ts"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "ts"],
};
