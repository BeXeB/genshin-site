import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslintPlugin from '@angular-eslint/eslint-plugin';

export default [
  {
    ignores: ['node_modules/', 'dist/', '.angular/', 'build/', '**/*.spec.ts', 'src/**/*.module.ts']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angularEslintPlugin,
    },
    rules: {
      // Angular-specific rules - errors
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      // TypeScript rules - warnings
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',

      // General rules - turn off problematic ones
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-constant-condition': 'off',
      'no-empty-pattern': 'off',
      'no-prototype-builtins': 'off',
    },
  },
];
