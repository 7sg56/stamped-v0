const { validatePassword } = require('../utils/password');

const testCases = [
  { input: null, expected: false, message: 'Null input' },
  { input: '', expected: false, message: 'Empty string' },
  { input: 'short', expected: false, message: 'Too short' },
  { input: '1234567', expected: false, message: '7 chars (too short)' },
  { input: 'Valid8ch!', expected: true, message: '8 chars (valid length)' },
  { input: 'alllowercase1!', expected: false, message: 'No uppercase' },
  { input: 'ALLUPPERCASE1!', expected: false, message: 'No lowercase' },
  { input: 'NoNumbersHere!', expected: false, message: 'No numbers' },
  { input: 'NoSpecialChar1', expected: false, message: 'No special char' },
  { input: 'ValidPass123!@#', expected: true, message: 'Valid password (standard symbols)' },
  { input: 'AnotherValid1$', expected: true, message: 'Another valid password ($)' },
  { input: 'ValidWithHyphen1-', expected: true, message: 'Valid password (hyphen)' },
  { input: 'ValidWithUnderscore1_', expected: true, message: 'Valid password (underscore)' },
  { input: 'ValidWithPlus1+', expected: true, message: 'Valid password (plus)' },
  { input: 'LongPasswordWithEverything1!', expected: true, message: 'Long valid password' }
];

let passed = 0;
let failed = 0;

console.log('Running password validation tests...\n');

testCases.forEach((test, index) => {
  const result = validatePassword(test.input);
  if (result.isValid === test.expected) {
    console.log(`✅ Test ${index + 1}: ${test.message} - PASSED`);
    passed++;
  } else {
    console.error(`❌ Test ${index + 1}: ${test.message} - FAILED`);
    console.error(`   Input: "${test.input}"`);
    console.error(`   Expected: ${test.expected}, Got: ${result.isValid}`);
    console.error(`   Message: ${result.message}`);
    failed++;
  }
});

console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
