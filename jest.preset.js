const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)',
    '<rootDir>/src/**/(*.)+(spec|test).(j|t)s?(x)',
  ],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
};