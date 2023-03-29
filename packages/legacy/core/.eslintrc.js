module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'no-console': 'error',
    // Because of early development, we only warn on ts-ignore. In future we want to move to error
    '@typescript-eslint/ban-ts-comment': 'warn',
    // Aries protocol defines attributes with snake case.
    '@typescript-eslint/camelcase': 'off',
    // Type is enforced by callers. Not entirely, but it's good enough.
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false, variables: true }],
    'import/order': [
      'error',
      {
        groups: ['type', ['builtin', 'external'], 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'always',
      },
    ],
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: false,
      },
    ],
  },
  globals: {
    require: true,
  },
  overrides: [
    {
      files: ['*.test.*'],
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['aries-components/**/*.ts'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
      },
    },
    {
      files: ['.eslintrc.js', '*.config.js'],
      env: {
        node: true,
      },
    },
  ],
}
