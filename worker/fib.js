function fib(index) {
  if (index < 2) return 1;
  let a = 1, b = 1;
  for (let i = 2; i <= index; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

module.exports = fib;