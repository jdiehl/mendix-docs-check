module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'arrow-parens': 0,
    'comma-dangle': 0,
    'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'], 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    'no-console': ['warn'],
    'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
    'no-unreachable': ['warn'],
    'no-unused-vars': ['warn', { args: 'none' }],
    'require-await': 0,
    'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    camelcase: 0,
    curly: ['error', 'multi-line'],
    semi: ['error', 'never']
  }
}
