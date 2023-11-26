/* eslint-disable */
export default {
  displayName: 'nx-serverless-cdk',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/nx-serverless-cdk',
  collectCoverageFrom: ['src/**/*.ts', '!jest.config.ts'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['lcov', 'text'],
  resetMocks: true,
};
