# Authentication and Authorization

## 1. Install package nesssaery

```bash
pnpm i bcrypt class-validator class-transformer
pnpm i -D @types/bcrypt @nestjs/mapped-types
```

```bash
nest g module iam
nest g service iam/hashing
nest g service iam/bcrypt
```

> ```ts
> // iam/hashing/hashing.service.ts
> import { Injectable } from '@nestjs/common';
>
> @Injectable()
> export abstract class HashingService {
>   abstract hash(data: string | Buffer): Promise<string>;
>   abstract compare(data: string | Buffer, encrypt: string): Promise<boolean>;
> }
> ```
>
> ```ts
> // iam/hashing/bcrypt.service.ts
> import { Injectable } from '@nestjs/common';
> import { HashingService } from './hashing.service';
> import { hash, genSalt, compare } from 'bcrypt';
>
> @Injectable()
> export class BcryptService implements HashingService {
>   async hash(data: string | Buffer): Promise<string> {
>     const salt = await genSalt(10);
>     return hash(data, salt);
>   }
>   async compare(data: string | Buffer, encrypt: string): Promise<boolean> {
>     return compare(data, encrypt);
>   }
> }
> ```
>
> ```ts
> // use class-validator in main.ts
> ...
> app.useGlobalPipes(
>   new ValidationPipe({
>     transform: true,
>     whitelist: true,
>   }),
> );
> ...
> await app.listen(3000);
> ```

## 2. Authentication

```bash
pnpm i @nestjs/passport passport passport-local
pnpm i -D @types/passport-local
```

```bash
nest g controller iam/authentication
nest g service iam/authentication

nest g class iam/authentication/dto/sign-in.dto --flat
nest g class iam/authentication/dto/sign-up.dto --flatW
```

### JWT

```bash
pnpm i @nestjs/config @nestjs/jwt
```

### Protect routes by Guards

```bash
nest g guard iam/authentication/guards/access-token
```

```ts
// src/iam/authentication/guards/access-token/access-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      request[REQUEST_USER_KEY] = payload;
      // console.log(payload);
    } catch (error: any) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers['authorization'].split(' ') ?? [];
    return token;
  }
}
```

```ts
// src/iam/authentication/guards/authentication/authentication.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Bearer]: this.accessTokenAuth,
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenAuth: AccessTokenGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes
      .map((type: any) => this.authTypeGuardMap[type])
      .flat();

    const guardPromises = guards.map((guard: any) =>
      guard.canActivate(context),
    );

    const results = await Promise.allSettled(guardPromises); //? return 'rejected' or 'fulfilled'

    const rejected = results.find((result: any) => {
      return result.status === 'rejected';
    });

    if (rejected) {
      throw rejected['reason'];
    }

    return results.some(
      (result: any) => result.status === 'fulfilled' && result.value,
    );
  }
}
```

```bash
nest g decorator iam/authentication/decorators/active-user --flat
nest g interface iam/interfaces/active-user-data --flat
```

```bash
nest g class iam/authentication/dto/refresh-token.dto --flat
```

### Use Redis to store refresh token

```bash
pnpm i ioredis
```

```bash
nest g class iam/authentication/refresh-token-ids.storage
```

## 3. Authorization

### Roles

```bash
nest g decorator iam/authorization/decorators/roles --flat
nest g guard iam/authorization/guards/roles
```

### Permissions

```bash
nest g class coffees/coffees.permission --flat
nest g class iam/authorization/permissions.type --flat
nest g decorator iam/authorization/decorators/permissions --flat
nest g guard iam/authorization/guards/permissions
```

### Policies

```bash
nest g interface iam/authorization/policies/interface/policy --flat
nest g interface iam/authorization/policies/interface/policy-handler --flat
nest g class iam/authorization/policies/policy-handlers.storage --flat
nest g class iam/authorization/policies/framwork-contributor.policy --flat
nest g decorator iam/authorization/decorators/policies --flat
nest g guard iam/authorization/guards/policies
```

### 2FA

```bash
pnpm i otplib qrcode
pnpm i -D @types/qrcode
```

```bash
nest g service iam/authentication/otp-authentication --flat
```

## Using Passport

```bash
pnpm i passport @nestjs/passport express-session
pnpm i connect-redis@6.1.3
pnpm i -D @types/passport @types/connect-redis @types/express-session
```

```bash
nest g service iam/authentication/session-authentication --flat
nest g controller iam/authentication/session-authentication --flat
```

```bash
nest g class iam/authentication/serializer/user-serializer
```


```bash
nest g guard iam/authentication/guards/session
```

## Extra: Use REPL

```ts
// relp.ts
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}

bootstrap();
```

Run as: `nest start --entryFile repl`