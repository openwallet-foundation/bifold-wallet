module.exports = {
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(.*react-native.*|@credo-ts|@openid4vc|@scure|@verifiables|@owf|cbor-x|cbor-extract|@noble|@stablelib|@digitalcredentials|dcql|valibot|query-string|decode-uri-component|filter-obj|split-on-first|uuid|@bifold)/)',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@verifiables/request-converter$':
      '<rootDir>/../../node_modules/@verifiables/request-converter/dist/index.js',
  },
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/lib',
    '<rootDir>/build',
    '<rootDir>/coverage',
  ],
  coveragePathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/lib',
    '<rootDir>/build',
    '<rootDir>/coverage',
  ],
}
