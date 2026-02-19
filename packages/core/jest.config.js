module.exports = {
  preset: 'react-native',
  testTimeout: 12000,
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/jestSetup.js', '@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/file.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/style.js',
    axios: require.resolve('axios'),
    'react-i18next': '<rootDir>/__mocks__/react-i18next.ts',
    '^uuid$': require.resolve('uuid'),
    '^@bifold/oca$': '<rootDir>/../oca/src/index.ts',
    '^@bifold/verifier$': '<rootDir>/../verifier/src/index.ts',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*react-native.*|@credo-ts|@noble|@stablelib|@digitalcredentials|dcql|valibot|query-string|decode-uri-component|uuid|@bifold)/)',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/lib',
    '<rootDir>/__tests__/contexts/',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/screens/fixtures',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '<rootDir>/src/navigators/defaultStackOptions.tsx',
    '<rootDir>/src/defaultConfiguration.ts',
    '<rootDir>/src/components/buttons/InfoIcon.tsx',
    '<rootDir>/src/hooks/deep-links.ts',
  ],
  cacheDirectory: '.jest/cache',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
}
