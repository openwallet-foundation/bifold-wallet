import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest'

export default [
  {
    settings: {
      "react": {
        "version": "detect"
      }
    }
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactPlugin.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': "error",
    },
  },
  {
    ignores: [
      'commitlint.config.js',
      'eslint.config.mjs',
      '.eslintrc-common.js',
      '**/.eslintrc.js',
      'scripts/make-blocks.js',
      'scripts/get-next-bump.ts',
      '**/jest.config.js',
      '**/metro.config.js',
      '.yarn/',
      'packages/verifier/build/',
      'packages/oca/build/',
      'packages/remote-logs/build/',
      'packages/react-native-attestation/build/',
      'packages/core/lib/',
    ],
  },
  {
    files: ['**/*.test.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}', '**/__mocks__/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'], // Adjust the pattern to match your test files
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        'jest/globals': true,
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  {
    files: ['packages/core/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    }
  },
]
