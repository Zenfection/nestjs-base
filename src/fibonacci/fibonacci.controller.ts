import { Controller, Get, Query } from '@nestjs/common';
// import { FibonacciWorkerHost } from './fibonacci-worker.host/fibonacci-worker.host';
import Piscina from 'piscina';
import { resolve } from 'path';

@Controller('fibonacci')
export class FibonacciController {
  fibonacciWorker = new Piscina({
    filename: resolve(__dirname, './fibonacci.worker', 'fibonacci.worker.js'),
  });
  // constructor(private readonly fibonacciWorkerHost: FibonacciWorkerHost) {}
  @Get()
  getFibonacci(@Query('n') n: number = 10) {
    // return this.fibonacciWorkerHost.run(n);
    return this.fibonacciWorker.run(n);
  }
}
