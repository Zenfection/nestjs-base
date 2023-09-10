# [SWC Compiler](https://docs.nestjs.com/recipes/swc#jest--swc)

SWC (Speedy Web Compiler) is an extensible Rust-based platform that can be used for both compilation and bundling. Using SWC with Nest CLI is a great and simple way to significantly speed up your development process.

- ✅ Installation SWC

```bash
pnpm i -D @swc/cli @swc/core
```

- ✅ Setup SWC and type checking in `nest-cli.json`

```json
...
"compilerOptions": {
    "builder": "swc",
    "typeCheck": true,
    ...
}
...
```



- ✅ Configure SWC `.swcrc` file

```json
{
    "$schema": "https://json.schemastore.org/swcrc",
    "sourceMaps": true,
    "jsc": {
    "parser": {
        "syntax": "typescript",
        "decorators": true,
        "dynamicImport": true
    },
    // "transform": {
    //     "legacyDecorator": true,
    //     "decoratorMetadata": true
    // },
    "baseUrl": "./",
    "paths": {
        "@/*": ["src/*"]
    }
    },
    "minify": false
}
```

- ❌ Use monorepo with SWC

- ❌ Common pitfalls with typeORM, MikroORM and other ORM...

- ✅ Use Jest with SWC

```bash
pnpm i -D jest @swc/core @swc/jest
```

In `package.json`:

```json
{
    ...
    "jest": {
        ...
        "transform": {
            "^.+\\.(t|j)s?$": ["@swc/jest"]
        }
        ...
    }
    ...
}
```

In `.swcrc`

```json
{
    ...
    "transform": {
        "legacyDecorator": true,
        "decoratorMetadata": true
    },
    ...
}
```

- ❌ Use Vitest with SWC