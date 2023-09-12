#

## 1. Install bcrypt

```bash
pnpm i bcrypt
pnpm i -D @types/bcrypt
```

```bash
nest g module iam
nest g service iam/hashing
nest g service iam/bcrypt
```

## 2. Authentication

### Install package nessary

```bash
pnpm i class-validator class-transformer
pnpm i -D @nestjs/mapped-types
```

Use them in `main.ts`

```ts
...
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
);
...
await app.listen(3000);
```


```bash
nest g controller iam/authencication
nest g service iam/authencication

nest g class iam/authencication/dto/sign-in.dto --no-spec --flat
nest g class iam/authencication/dto/sign-up.dto --no-spec --flat
```

### JWT

```bash
pnpm i @nestjs/config @nestjs/jwt
```

### Protect routes by Guards

```bash
nest g /iam/authentication/guards/access-token
```