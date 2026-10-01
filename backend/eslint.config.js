const globals = { console: 'readonly', process: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', Buffer: 'readonly' };

export default [
  {
    ignores: ['dist/**', 'data/**', 'node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-constant-condition': 'warn',
      'no-undef': 'error',
    },
  },
];
