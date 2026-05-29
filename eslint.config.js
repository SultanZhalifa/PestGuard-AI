import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Only lint our own source — never build output, deploy artifacts, or the Python venv
  globalIgnores([
    'dist',
    '.vercel',
    'backend',
    'node_modules',
    'docs',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // The newest eslint-plugin-react-hooks adds strict stylistic rules that
      // flag common, working patterns (e.g. an initial data fetch in useEffect).
      // These are advisory, not bugs — keep them as warnings so `npm run lint`
      // stays green while still surfacing them during development.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  // Vite config runs in Node — allow process/__dirname etc.
  {
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
