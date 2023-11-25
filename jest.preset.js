const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/jest.config.ts',
    '!**/cdk/index.ts',
    '!**/cdk.out/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['clover', 'text'],
  resetMocks: true,
};
