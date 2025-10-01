// @ts-check


import tseslint from 'typescript-eslint';
import globals from 'globals';
import js from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      '.eslintrc.js',
      'eslint.config.mjs'
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,


  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',           // (deprecated)
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      'prettier/prettier': 'warn',
    },
  }
);