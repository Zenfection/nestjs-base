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
nest g controller iam/authentication
nest g service iam/authentication

nest g class iam/authentication/dto/sign-in.dto --no-spec --flat
nest g class iam/authentication/dto/sign-up.dto --no-spec --flat
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
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../decorator/auth/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenAuth,
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenAuth: AccessTokenGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [(context.getHandler(), context.getClass())],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type: any) => this.authTypeGuardMap[type]);
    let error = new UnauthorizedException('No token provided');

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err: any) => (error = err));

      if (canActivate) return true;

      throw error;
    }
  }
}

```