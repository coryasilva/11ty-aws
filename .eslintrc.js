module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'standard',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  ignorePatterns: ['dist/**/*', 'cdk/cdk.out/**/*', 'cloudfront'],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
  },
}
