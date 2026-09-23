module.exports = {
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  moduleNameMapper: {
    '^@verifiables/request-converter$':
      '<rootDir>/../../node_modules/@verifiables/request-converter/dist/index.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*react-native.*|@credo-ts|@openid4vc|@scure|@verifiables|@owf|cbor-x|cbor-extract|@noble|@stablelib|@digitalcredentials|dcql|valibot|query-string|decode-uri-component|filter-obj|split-on-first|uuid|@bifold)/)',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/lib',
    '<rootDir>/build',
    '<rootDir>/__tests__/contexts/',
    '<rootDir>/__tests__/helpers/',
  ],
  cacheDirectory: '.jest/cache',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
}
