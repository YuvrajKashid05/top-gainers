import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const globals = {
  window: 'readonly', document: 'readonly', localStorage: 'readonly', navigator: 'readonly',
  console: 'readonly', URLSearchParams: 'readonly', Intl: 'readonly', setInterval: 'readonly',
  clearInterval: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', fetch: 'readonly',
  CSS: 'readonly',
};

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  { files: ['src/context/ThemeContext.jsx'], rules: { 'react-refresh/only-export-components': 'off' } },
];
