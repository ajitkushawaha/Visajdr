module.exports = {
  // Format files with Prettier
  '*.{ts,tsx,js,jsx,json,md,yml,yaml,css}': ['prettier --write'],
  // Note: ESLint and Jest tests run via npm test on CI for better performance
}
