# [Prisma ORM](https://docs.nestjs.com/recipes/prisma#set-up-prisma)

Use 3rd party ORM Prisma with [nestjs-prisma](https://nestjs-prisma.dev/)

- ✅ Installation

```bash
nest add nestjs-prisma
```

```bash
pnpm add -D ts-node @types/node
```


- ✅ Example create a model in `prisma/schema.prisma`

```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

```bash
npx prisma generate
npx prisma studio
```

Then add PrismaModule in `app.module.ts` forRoot()

- Setup Docker Service

```dockerfile
FROM node:18 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:18

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
```

- Setup Docker Compose

```dockerfile
version: '3.8'
services:
  nest-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nest-api
    restart: always
    ports:
      - 3000:3000
    depends_on:
      - postgres
    env_file:
      - .env

  postgres:
    image: postgres:15
    container_name: postgresprisma
    restart: always
    ports:
      - 5432:5432
    env_file:
      - .env
    volumes:
      - postgres:/var/lib/postgresql/data

volumes:
  postgres:
    name: nest-prisma-docker-db
```

- Setup .env

```env
DATABASE_URL=postgresql://postgres:username@password:5432/nest-prisma-docker-db?schema=public
POSTGRES_USER=zenfection
POSTGRES_PASSWORD=123456
POSTGRES_DB=test
```

✅ Exception Filter Global

```ts
//src/main.ts
...
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
...
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
...
  await app.listen(3000);
```

✅ Logging Middleware

Custom in module

```ts
import { Module } from '@nestjs/common';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';

@Module({
  imports: [
    PrismaModule.forRoot({
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
  ],
})
export class AppModule {}
```