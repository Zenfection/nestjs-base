import { PolicyHandlersStorage } from './../../policies/policy-handlers.storage';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
} from '@nestjs/common';
import { Policy } from '../../policies/interface/policy.interface';
import { POLICIES_KEY } from '../../decorators/policies.decorator';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly relfector: Reflector,
    private readonly policyHandlersStorage: PolicyHandlersStorage,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextPolicies = this.relfector.getAllAndOverride<Policy[]>(
      POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!contextPolicies) return true;

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    await Promise.all(
      contextPolicies.map(policy => {
        const policyHandler = this.policyHandlersStorage.get(
          policy.constructor as Type,
        );
        return policyHandler.handle(policy, user);
      }),
    ).catch((error: any) => {
      throw new ForbiddenException(error.message);
    });

    return true;
  }
}
