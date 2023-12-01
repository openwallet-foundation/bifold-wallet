module.exports = {
  preset: 'react-native',
  testTimeout: 10000,
  setupFiles: ['<rootDir>/jestSetup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/file.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/style.js',
    axios: require.resolve('axios'),
    'react-i18next': '<rootDir>/__mocks__/react-i18next.ts',
    '^uuid$': require.resolve('uuid'),
    '@aries-framework/core': require.resolve('@aries-framework/core'),
    '@aries-framework/anoncreds': require.resolve('@aries-framework/anoncreds'),
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules\\/(?!(.*react-native.*)|(uuid)|(@aries-framework\\/core)|(@aries-framework\\/anoncreds))',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '<rootDir>/lib',
    '<rootDir>/__tests__/contexts/',
    '<rootDir>/__tests__/helpers/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '<rootDir>/App/navigators/defaultStackOptions.tsx',
    '<rootDir>/App/defaultConfiguration.ts',
    '<rootDir>/App/components/buttons/InfoIcon.tsx',
    '<rootDir>/App/hooks/deep-links.ts',
  ],
  cacheDirectory: '.jest/cache',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
}
