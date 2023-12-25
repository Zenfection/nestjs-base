// import { parentPort } from 'worker_threads';

function fib(n: number) {
  if (n < 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
}

// parentPort.on('message', ({ n, id }) => {
//   const result = fib(n);
//   parentPort.postMessage({ id, result });
// });

module.exports = (n: number) => {
  return fib(n);
};
