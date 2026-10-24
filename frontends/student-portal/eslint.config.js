import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@erp/sdk',
              message: 'Importing from root @erp/sdk is forbidden. Use explicit capability subpaths like @erp/sdk/shared/schemas or @erp/sdk/frontend/utils.',
            },
            {
              name: '@erp/sdk/server',
              message: 'Frontend code is forbidden from importing server capabilities.',
            },
          ],
          patterns: [
            {
              group: ['@erp/sdk/server/*'],
              message: 'Frontend code is forbidden from importing server capabilities.',
            },
          ],
        },
      ],
    },
  },
)

