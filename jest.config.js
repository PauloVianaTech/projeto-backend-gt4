module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: { global: { statements: 75, branches: 60, functions: 75, lines: 75 } },
  projects: [
    { displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/tests/unit/**/*.test.js'] },
    {
      displayName: 'integration', testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/*.test.js'],
      setupFiles: ['<rootDir>/tests/setup-env.js'],
      testTimeout: 30000,
    },
  ],
};
