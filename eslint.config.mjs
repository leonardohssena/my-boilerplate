import pluginJs from '@eslint/js'
import prettier from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import { builtinModules } from 'node:module'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['src/**'],
    ignores: [
      '.commitlintrc*',
      '.docker',
      '.eslintcache',
      '.eslintrc*',
      '.prettierrc*',
      'coverage',
      'dist',
      'jest.config.js',
      'logs',
      'node_modules',
      'package-lock.json',
      'yarn.lock',
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports.
            ['^\\u0000'],
            // Node.js builtins.
            [`^(${builtinModules.join('|')})(/|$)`],
            // Packages. `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            ['^(@application|@domain|@infra|@interfaces|@shared|@config)(/.*|$)'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  prettier,
]
