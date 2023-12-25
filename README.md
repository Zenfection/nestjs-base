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
