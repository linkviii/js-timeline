/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
  
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
  
    root: true,
  
    "ignorePatterns": ["**/*.js"],
  
    rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "no-extra-semi": 0,
        "@typescript-eslint/no-unused-vars": 0,
        "eqeqeq": 2,
    }
};