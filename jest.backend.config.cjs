/** Backend Jest config in CommonJS so it loads without "type": "module" in package.json */
module.exports = {
  displayName: "backend",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/models/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
    "<rootDir>/config/*.test.js",
    "<rootDir>/routes/*.integration.test.js",
  ],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: [],
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**",
    "helpers/**",
    "middlewares/**",
    "config/**",
    "models/**",
    "routes/**",
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
