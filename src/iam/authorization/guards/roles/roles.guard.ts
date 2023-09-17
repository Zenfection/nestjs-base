import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/users/enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly relfector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRole = this.relfector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!contextRole) return true;
    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    return contextRole.some(role => user.role?.includes(role));
  }
}
