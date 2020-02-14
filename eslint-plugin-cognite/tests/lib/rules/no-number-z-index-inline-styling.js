// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-number-z-index-inline-styling');

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};

// ------------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('no-number-z-index-inline-styling', rule, {
  valid: [
    {
      code: '<div style={{zIndex: zIndex.DIV}}>Content</div>',
    },
  ],
  invalid: [
    {
      code: '<div style={{zIndex: 5}}>Content</div>',
      errors: [{ messageId: 'no-number-z-index-inline-styling' }],
    },
  ],
});
