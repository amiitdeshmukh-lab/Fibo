const fib = require('./fib')

test('fib(1) returns 1', () => {
  expect(fib(1)).toBe(1);
});

test('fib(5) returns 8', () => {
  expect(fib(5)).toBe(8);
});

test('fib(10) returns 89', () => {
  expect(fib(10)).toBe(89);
});