module.exports = {
  extends: './.eslintrc.production.js',
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {
    'no-console': 'off',
    '@cognite/no-unissued-todos': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': [
      1,
      {
        ignoredNamesRegex: '^_',
      },
    ],
  },
};
