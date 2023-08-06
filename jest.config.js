module.exports = {
  preset: 'ts-jest',
  runner: '@kayahr/jest-electron-runner/main',
  testEnvironment: '@kayahr/jest-electron-runner/environment',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/*.test.ts'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
