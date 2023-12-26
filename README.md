# Advanced Concept

## 1. Debug Mode

```bash
NEST_DEBUG=true pnpm start:dev
```

Install madge to check circular dependency

```bash
pnpm i -D madge
npx madge dist/main.js --circular
npx madge dist/main.js --image graph.png
```

## 2. Lazy Moduling

```ts
// Using NestJS Lazy Module Loader
// *.controller.ts
constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

async create (){
    const rewardsModuleRef = await this.lazyModuleLoader.load(() =>
      import('../rewards/rewards.module').then((m) => m.RewardsModule),
    );
    const rewardsService =
      await rewardsModuleRef.resolve<RewardsService>(RewardsService);

    rewardsService.grantReward();
}
```

```bash
# Testing
curl -H "Content-Type: application/json"  http://localhost:3000/coffees -d "{}"
```

## 3. IoC Container

```bash
nest g mo scheduler
nest g cl scheduler/interval.scheduler --no-spec
nest g d scheduler/decorators/interval.host --no-spec
nest g d scheduler/decorators/interval --no-spec

nest g mo cron
nest g s cron
```

```ts
//interval.scheduler.tss
...
@Injectable()
export class IntervalScheduler
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly intervals: NodeJS.Timeout[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);
      if (!instance || !prototype) {
        return;
      }
      const isIntervalHost =
        this.reflector.get(INTERVAL_HOST_KEY, instance.constructor) ?? false;
      if (!isIntervalHost) {
        return;
      }

      const methodKeys = this.metadataScanner.getAllMethodNames(prototype);
      methodKeys.forEach((methodKey) => {
        const interval = this.reflector.get(INTERVAL_KEY, instance[methodKey]);
        if (!interval) {
          return;
        }
        setInterval(() => {
          instance[methodKey]();
        }, interval);
        this.intervals.push(interval);
      });
    });
  }

  onApplicationShutdown() {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
  }
}
```

```ts
...
export const INTERVAL_HOST_KEY = 'INTERVAL_HOST_KEY';
export const IntervalHost: ClassDecorator = SetMetadata(
  INTERVAL_HOST_KEY,
  true,
);
```

```ts
// interval.decorator.ts
...
export const INTERVAL_HOST_KEY = 'INTERVAL_HOST_KEY';
export const IntervalHost: ClassDecorator = SetMetadata(
  INTERVAL_HOST_KEY,
  true,
);
```

## 4. Worker Thread

Test with fibonacci recursive function

```bash
nest g mo fibonacci
nest g co fibonacci --no-spec

#Test curl
curl -X GET "http://localhost:3000/fibonacci/?n=40"
```

Init worker thread

```bash
nest g cl fibonacci/fibonacci.worker --no-spec
nest g cl fibinacci/fibonacci-worker.host --no-spec
```

```ts
//fibonacci.worker.ts
import { parentPort } from 'worker_threads';

function fib(n: number) {
  if (n < 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
}

parentPort.on('message', ({ n, id }) => {
  const result = fib(n);
  parentPort.postMessage({ id, result });
});
```

```ts
//fibonacci-worker.host.ts
import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { Observable, filter, firstValueFrom, fromEvent, map } from 'rxjs';
import { Worker } from 'worker_threads';

export class FibonacciWorkerHost
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private worker: Worker;
  private message$: Observable<{ id: string; result: number }>;

  onApplicationBootstrap() {
    this.worker = new Worker(
      join(__dirname, '../fibonacci.worker', 'fibonacci.worker.js'),
    );
    this.message$ = fromEvent(this.worker, 'message') as Observable<{
      id: string;
      result: number;
    }>;
  }

  onApplicationShutdown() {
    this.worker.terminate();
  }

  run(n: number) {
    const uid = randomUUID();
    this.worker.postMessage({ n, id: uid });

    return firstValueFrom(
      this.message$.pipe(
        filter(({ id }) => id === uid),
        map(({ result }) => result),
      ),
    );
  }
}
```

Install piscina for worker thread pool

```bash
pnpm add piscina
```

## 5. Circuit Breaker Pattern

```bash
nest g interceptor common/interceptors/circuit-breaker --no-flat
nest g class common/interceptors/circuit-breaker --no-spec --no-flat
```

```ts
// circuit-breaker.ts
...
const SUCCESS_THRESHOLD = 3;
const FAILURE_THRESHOLD = 3;
const OPEN_TO_HALF_OPEN_WAIT_TIME = 60000;

enum CircuitBreakerState {
  Closed,
  Open,
  HalfOpen,
}

export class CircuitBreaker {
  private state = CircuitBreakerState.Closed;
  private failureCount = 0;
  private successCount = 0;
  private lastError: Error;
  private nextAttempt: number;

  exec(next: CallHandler) {
    if (this.state === CircuitBreakerState.Open) {
      if (this.nextAttempt > Date.now()) {
        return throwError(() => this.lastError);
      }
      this.state = CircuitBreakerState.HalfOpen;
    }
    return next.handle().pipe(
      tap({
        next: () => this.handleOnSuccess(),
        error: (err) => this.handleOnError(err),
      }),
    );
  }

  private handleOnSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitBreakerState.HalfOpen) {
      this.successCount++;
      if (this.successCount >= SUCCESS_THRESHOLD) {
        this.successCount = 0;
        this.state = CircuitBreakerState.Closed;
      }
    }
  }

  private handleOnError(err: Error) {
    this.failureCount++;
    if (
      this.failureCount >= FAILURE_THRESHOLD ||
      this.state === CircuitBreakerState.HalfOpen
    ) {
      this.state = CircuitBreakerState.Open;
      this.lastError = err;
      this.nextAttempt = Date.now() + OPEN_TO_HALF_OPEN_WAIT_TIME;
    }
  }
}
```

```ts
// circuit-breaker.interceptor.ts
...
@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly circuitBreakerbyHandler = new WeakMap<
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function,
    CircuitBreaker
  >();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodRef = context.getHandler();
    let circuitBreaker: CircuitBreaker;

    if (this.circuitBreakerbyHandler.has(methodRef)) {
      circuitBreaker = this.circuitBreakerbyHandler.get(methodRef);
    } else {
      circuitBreaker = new CircuitBreaker();
      this.circuitBreakerbyHandler.set(methodRef, circuitBreaker);
    }
    return circuitBreaker.exec(next);
  }
}
```
