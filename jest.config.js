/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^tiny-secp256k1$': '<rootDir>/src/lib/secp256k1-compat.js',
    // @plasmohq/storage is ESM-only; tests inject in-memory stores instead.
    '^@plasmohq/storage/secure$': '<rootDir>/test/helpers/plasmoStub.ts',
    '^@plasmohq/storage$': '<rootDir>/test/helpers/plasmoStub.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|@noble|tapyrusjs-lib|bip39|bip32)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
