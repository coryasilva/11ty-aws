module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/cloudfront'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
