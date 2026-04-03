/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules', '.next', 'coverage'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [
    {
      files: ['packages/react/**/*.{ts,tsx}'],
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: { react: { version: 'detect' } },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/GOOGLE_DRIVE_API_KEY/]',
            message:
              'Do not embed GOOGLE_DRIVE_API_KEY in the React package; use server routes or env on the server only.',
          },
        ],
      },
    },
  ],
};
