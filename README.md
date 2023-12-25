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
