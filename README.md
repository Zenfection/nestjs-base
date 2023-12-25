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

### 3. IoC Container

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
