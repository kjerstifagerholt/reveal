module.exports = {
  extends: './.eslintrc.production.js',
  ignorePatterns: ['.eslintrc.js', '.eslintrc.production.js', 'generated.ts'],
  // We can relax some settings here for nicer development experience; warnings will crash in CI
  rules: {},
};
