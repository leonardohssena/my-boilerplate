const baseConfig = {
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'jest-environment-node',
  rootDir: './',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@application(.*)$': '<rootDir>/src/core/application$1',
    '^@interfaces(.*)$': '<rootDir>/src/interfaces$1',
    '^@infra(.*)$': '<rootDir>/src/core/infra$1',
    '^@domain(.*)$': '<rootDir>/src/core/domain$1',
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@shared(.*)$': '<rootDir>/src/shared$1',
    '^@test(.*)$': '<rootDir>/test$1',
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/prisma/generated/client/'],
}

module.exports = {
  testSequencer: '<rootDir>/test/jest.test-sequencer.ts',
  maxWorkers: 1,
  testTimeout: 10000,
  projects: [
    {
      ...baseConfig,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      coverageDirectory: './coverage/unit',
    },
    {
      ...baseConfig,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
      coverageDirectory: './coverage/e2e',
      globalSetup: '<rootDir>/test/jest.setup.ts',
      globalTeardown: '<rootDir>/test/jest.teardown.ts',
    },
  ],
}
