import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }]
  },
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
};

export default config;