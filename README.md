# [Swagger openAPI](https://docs.nestjs.com/openapi/introduction)

The OpenAPI specification is a language-agnostic definition format used to describe RESTful APIs. Nest provides a dedicated module which allows generating such a specification by leveraging decorators.


- ✅ Installation

```bash
pnpm i @nestjs/swagger
```

- ✅ Bootstrap

```ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
...
const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addTag('nestjs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
...

await app.listen(3000);
```

- ❌ Document options

- ❌ Setup options